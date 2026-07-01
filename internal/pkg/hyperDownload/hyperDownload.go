package hyperDownload

import (
	"encoding/json"
	"errors"
	"fmt"
	"hyperion-downloader/internal/pkg/hyperStructs"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/valyala/fasthttp"
)

// Create a highly tuned client specifically for blasting concurrent requests
var fastClient = &fasthttp.Client{
	MaxConnsPerHost:     1000,             // Prevents bottlenecking if concurrentDownloads is very high
	MaxIdleConnDuration: 15 * time.Second, // Keeps TCP connections warm between chunks
	ReadTimeout:         5 * time.Minute,  // Hard cutoff for hanging downloads
	WriteTimeout:        10 * time.Second, // Time allowed to send the request headers
	StreamResponseBody:  true,             // Stream the response body to avoid buffering large files in memory
}

func ConstructHyperFile(urlString string, concurrentDownloads int, targetPartSize int64, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions, redirectCount int) (*hyperStructs.HyperFile, error) {
	// Make a HEAD request to get the file size and check if the server supports range requests
	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(urlString)
	req.Header.SetMethod("HEAD")
	req.Header.Set("Accept", "*/*")
	if advancedOptions != nil {
		if advancedOptions.Cookies != "" {
			req.Header.Set("Cookie", advancedOptions.Cookies)
		}
		if advancedOptions.UserAgent != "" {
			req.Header.Set("User-Agent", advancedOptions.UserAgent)
		}
		if advancedOptions.Referer != "" {
			req.Header.Set("Referer", advancedOptions.Referer)
		}
		if advancedOptions.AuthorizationHeader != "" {
			req.Header.Set("Authorization", advancedOptions.AuthorizationHeader)
		}
	}
	err := fastClient.Do(req, resp)
	if err != nil {
		return nil, fmt.Errorf("failed to make HEAD request: %w", err)
	}

	// If the server returns a redirect status code, we need to follow the redirect and make a new HEAD request to the new URL to get the correct file size and check for range support, but we should limit the number of redirects to avoid infinite redirect loops
	for resp.StatusCode() >= 300 && resp.StatusCode() < 400 {
		if redirectCount >= 5 {
			return nil, errors.New("too many redirects")
		}
		redirectCount++

		// Get the redirect URL from the Location header
		location := resp.Header.Peek("Location")
		if len(location) == 0 {
			return nil, errors.New("redirect location is missing")
		}
		urlString = string(location)
		return ConstructHyperFile(urlString, concurrentDownloads, targetPartSize, advancedOptions, redirectCount)
	}

	// If HEAD request returns 405 Method Not Allowed, the server may still support range requests, so we can try a GET request for the first byte to check for range support and get the file size, but this needs a timeouut to avoid downloading a large file if the server does not support range requests
	if resp.StatusCode() == fasthttp.StatusMethodNotAllowed {
		req.SetRequestURI(urlString)
		req.Header.SetMethod("GET")
		req.Header.Set("Accept", "*/*")
		req.Header.Set("Range", "bytes=0-0")
		if advancedOptions != nil {
			if advancedOptions.Cookies != "" {
				req.Header.Set("Cookie", advancedOptions.Cookies)
			}
			if advancedOptions.UserAgent != "" {
				req.Header.Set("User-Agent", advancedOptions.UserAgent)
			}
			if advancedOptions.Referer != "" {
				req.Header.Set("Referer", advancedOptions.Referer)
			}
			if advancedOptions.AuthorizationHeader != "" {
				req.Header.Set("Authorization", advancedOptions.AuthorizationHeader)
			}
		}
		err := fastClient.Do(req, resp)
		if err != nil {
			return nil, fmt.Errorf("failed to make GET request: %w", err)
		}
		if resp.StatusCode() != fasthttp.StatusPartialContent {
			return nil, errors.New("server does not support range requests")
		}
	}

	// If the HEAD request returns a non-200 status code, return an error
	if resp.StatusCode() != fasthttp.StatusOK && resp.StatusCode() != fasthttp.StatusPartialContent {
		return nil, fmt.Errorf("HEAD request returned non-200 status code: %d", resp.StatusCode())
	}

	// Check if the server supports range requests TODO: Allow for severs that dontsupport range requests by treating the whole file as a single part
	if string(resp.Header.Peek("Accept-Ranges")) != "bytes" {
		return nil, errors.New("server does not support range requests")
	}

	// Get the file size from the Content-Length header
	contentLength := resp.Header.Peek("Content-Length")
	if len(contentLength) == 0 {
		return nil, errors.New("Content-Length header is missing")
	}

	// Get the filename from the Content-Disposition header if it exists, otherwise use the last part of the URL path
	contentDisposition := resp.Header.Peek("Content-Disposition")
	filename, err := url.QueryUnescape(filepath.Base(urlString))
	if err != nil {
		filename = filepath.Base(urlString)
	}
	if len(contentDisposition) != 0 {
		// Look for "filename=" in the Content-Disposition header and extract the filename by reading between 'filename="' and the next '"' character, or between 'filename=' and the end of the string if there is no '"' character after 'filename='
		cdStr := string(contentDisposition)
		filenameIndex := strings.Index(cdStr, "filename=")
		if filenameIndex != -1 {
			filenameStart := filenameIndex + len("filename=")
			if filenameStart < len(cdStr) {
				if cdStr[filenameStart] == '"' {
					filenameEnd := strings.Index(cdStr[filenameStart+1:], "\"")
					if filenameEnd != -1 {
						rawFilename := cdStr[filenameStart+1 : filenameStart+1+filenameEnd]
						filename = filepath.Base(rawFilename)
					}
				} else {
					filenameEnd := strings.IndexAny(cdStr[filenameStart:], "; ")
					if filenameEnd != -1 {
						rawFilename := cdStr[filenameStart : filenameStart+filenameEnd]
						filename = filepath.Base(rawFilename)
					} else {
						filename = filepath.Base(cdStr[filenameStart:])
					}
				}
			}
		}
	}

	// Parse the file size
	var fileSize int64
	_, err = fmt.Sscanf(string(contentLength), "%d", &fileSize)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Content-Length header: %w", err)
	}

	// Calculate the size of each part and have the final part take the remainder
	targetPartCount := int(fileSize / targetPartSize)
	// If the target part count is less than the number of concurrent downloads, we can set the part count to the concurrent download count to better utilize the available concurrency
	partCount := targetPartCount

	// Safe concurrency sizing
	if targetPartCount < concurrentDownloads {
		partCount = concurrentDownloads
	}
	// Ensure the part count is not larger than the file size
	if int64(partCount) > fileSize {
		partCount = int(fileSize)
	}
	if partCount == 0 {
		partCount = 1
	}

	partSize := fileSize / int64(partCount)
	remainder := fileSize % int64(partCount)

	parts := make([]hyperStructs.HyperFilePart, partCount)
	for i := 0; i < partCount; i++ {
		startByte := int64(i) * partSize
		endByte := startByte + partSize - 1
		if i == partCount-1 {
			endByte += remainder
		}

		// Padded filename numbers with minimal padding to ensure correct ordering when sorted lexicographically
		paddedIndex := fmt.Sprintf("%0*d", len(fmt.Sprintf("%d", partCount-1)), i)

		parts[i] = hyperStructs.HyperFilePart{
			Url:        urlString,
			Filename:   fmt.Sprintf("%s.%s", filename, paddedIndex),
			PartNumber: i,
			StartByte:  startByte,
			EndByte:    endByte,
		}
	}
	return &hyperStructs.HyperFile{
		Url:      urlString,
		Filename: filename,
		Size:     fileSize,
		Parts:    parts,
	}, nil
}

func DownloadPart(part hyperStructs.HyperFilePart, outputDir string, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions) error {
	safeFilename := filepath.Base(part.Filename)
	filename := filepath.Join(outputDir, safeFilename)

	// If file already exists, skip downloading this part
	if _, err := os.Stat(filename); err == nil {
		return nil
	}

	// Create a request for the part
	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(part.Url)
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", part.StartByte, part.EndByte))

	if advancedOptions != nil {
		if advancedOptions.Cookies != "" {
			req.Header.Set("Cookie", advancedOptions.Cookies)
		}
		if advancedOptions.UserAgent != "" {
			req.Header.Set("User-Agent", advancedOptions.UserAgent)
		}
		if advancedOptions.Referer != "" {
			req.Header.Set("Referer", advancedOptions.Referer)
		}
		if advancedOptions.AuthorizationHeader != "" {
			req.Header.Set("Authorization", advancedOptions.AuthorizationHeader)
		}
	}

	maxRetries := 5
	timeoutDuration := 5 * time.Minute

	for attempt := 0; attempt <= maxRetries; attempt++ {
		err := fastClient.DoTimeout(req, resp, timeoutDuration)

		if err != nil {
			if attempt < maxRetries {
				// Delay 1 second + attempt before retrying
				time.Sleep(time.Second * time.Duration(attempt+1))
				continue
			}
			return fmt.Errorf("failed to download part after %d network retries: %w", maxRetries, err)
		}

		statusCode := resp.StatusCode()

		if statusCode == fasthttp.StatusPartialContent || statusCode == fasthttp.StatusOK {
			// Create the part file
			partFile, err := os.Create(filename)
			defer partFile.Close()
			if err != nil {
				return fmt.Errorf("failed to create part file: %w", err)
			}

			// Create body stream
			bodyStream := resp.BodyStream()
			defer resp.CloseBodyStream()

			// Copy the response body to the part file
			_, err = io.Copy(partFile, bodyStream)

			if err != nil {
				return fmt.Errorf("failed to save part to file: %w", err)
			}
			return nil
		}

		if statusCode >= 500 && statusCode < 600 {
			if attempt < maxRetries {
				time.Sleep(time.Second * time.Duration(attempt+1))
				continue
			}
			return fmt.Errorf("server failed with status %d after %d retries", statusCode, maxRetries)
		}

		return fmt.Errorf("fatal error: server returned status %d", statusCode)
	}

	return fmt.Errorf("exceeded maximum retries")
}

// Download parts concurrently using goroutines
func DownloadParts(parts []hyperStructs.HyperFilePart, outputDir string, concurrentDownloads int, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions, functions hyperStructs.HyperFunctions) error {
	var downloadedParts int64 = 0
	totalParts := len(parts)
	sem := make(chan struct{}, concurrentDownloads)
	errChan := make(chan error, len(parts))
	var wg sync.WaitGroup

	for _, part := range parts {
		sem <- struct{}{}
		wg.Add(1)

		go func(part hyperStructs.HyperFilePart) {
			defer func() {
				<-sem
				wg.Done()
			}()

			if functions.CheckPausedFunc != nil && functions.CheckPausedFunc() {
				functions.TaskFunc("Download paused")
				return
			}
			if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
				functions.TaskFunc("Download cancelled")
				return
			}

			err := DownloadPart(part, outputDir, advancedOptions)
			if err != nil {
				errChan <- fmt.Errorf("failed to download part %d: %w", part.PartNumber, err)
				return
			}

			currentDownloaded := atomic.AddInt64(&downloadedParts, 1)

			if functions.ProgressFunc != nil {
				functions.ProgressFunc(((float64(currentDownloaded) / float64(totalParts)) * 0.9) + 0.05)
			}
			if functions.TaskFunc != nil {
				functions.TaskFunc(fmt.Sprintf("Downloaded part %d of %d", currentDownloaded, totalParts))
			}
		}(part)
	}

	// Wait for all downloads to finish
	wg.Wait()
	close(errChan)

	// Collect the first fatal error if any occurred
	for err := range errChan {
		if err != nil {
			return err
		}
	}
	return nil
}

// Combine parts into a single file
func CombineParts(partsDir string, outputFilePath string, functions hyperStructs.HyperFunctions) error {
	outputFile, err := os.Create(outputFilePath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer outputFile.Close()

	partFiles, err := os.ReadDir(partsDir)
	if err != nil {
		return fmt.Errorf("failed to read parts directory: %w", err)
	}

	// Remove download.json from list
	var filteredPartFiles []os.DirEntry
	for _, entry := range partFiles {
		if entry.Name() == "download.json" {
			continue
		}
		filteredPartFiles = append(filteredPartFiles, entry)
	}

	// Sort part files by part number, which is the last number in the filename after the last dot, before the file extension, and is zero padded to ensure correct ordering when sorted lexicographically
	type partFileInfo struct {
		name       string
		partNumber int
	}
	var partFileInfos []partFileInfo
	for _, entry := range filteredPartFiles {
		name := entry.Name()

		// Extension parsing
		lastDot := strings.LastIndex(name, ".")
		if lastDot == -1 {
			return fmt.Errorf("failed to parse part number from missing extension in filename '%s'", name)
		}

		partNumberStr := name[lastDot+1:]
		partNumber, err := strconv.Atoi(partNumberStr)
		if err != nil {
			return fmt.Errorf("failed to parse part number from filename '%s': %w", name, err)
		}
		partFileInfos = append(partFileInfos, partFileInfo{name: name, partNumber: partNumber})
	}

	// Sort part files by part number
	sort.Slice(partFileInfos, func(i, j int) bool {
		return partFileInfos[i].partNumber < partFileInfos[j].partNumber
	})

	for _, partFileInfo := range partFileInfos {
		if functions.TaskFunc != nil {
			functions.TaskFunc(fmt.Sprintf("Combining part %d", partFileInfo.partNumber+1))
		}
		if functions.ProgressFunc != nil {
			functions.ProgressFunc(0.95 + (float64(partFileInfo.partNumber+1) / float64(len(partFileInfos)) * 0.05))
		}
		partFilePath := filepath.Join(partsDir, partFileInfo.name)

		// BUGFIX: Safely isolate the file descriptor to ensure closure on io.Copy failures
		err := func() error {
			partFile, err := os.Open(partFilePath)
			if err != nil {
				return err
			}
			defer partFile.Close()

			_, err = io.Copy(outputFile, partFile)
			return err
		}()

		if err != nil {
			return fmt.Errorf("failed to write part to output file: %w", err)
		}

		_ = os.Remove(partFilePath)

		if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
			functions.TaskFunc("Download cancelled")
			outputFile.Close()
			// Delete output file
			_ = os.Remove(outputFilePath)
			// Delete temp directory and all its contents
			_ = os.RemoveAll(partsDir)
			return nil
		}
	}
	return nil
}

func DownloadFile(url string, outputDir string, tempDir string, concurrentDownloads int, targetPartSize int64, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions, functions hyperStructs.HyperFunctions) error {
	// Time the download process
	startTime := time.Now()
	defer func() {
		elapsed := time.Since(startTime)
		fmt.Printf("Download completed in %s\n", elapsed)
	}()
	// Check if a download.json file exists in the tempDir, if it does, we can assume that this is a resumed download and we can skip the metadata fetching and go straight to downloading the parts, otherwise we need to fetch the metadata and emit the gotMetadata event
	downloadJsonPath := filepath.Join(tempDir, "download.json")
	_, err := os.Stat(downloadJsonPath)
	isResumed := err == nil
	var hyperFile *hyperStructs.HyperFile

	if isResumed {
		functions.TaskFunc("Resuming download")
		functions.ProgressFunc(0.05)
		downloadJsonData, err := os.ReadFile(downloadJsonPath)
		if err != nil {
			return fmt.Errorf("failed to read download.json file: %w", err)
		}
		err = json.Unmarshal(downloadJsonData, &hyperFile)

		// Handle corrupted resume files
		if err != nil {
			_ = os.Remove(downloadJsonPath)
			isResumed = false
		} else {
			if functions.GotMetadataFunc != nil {
				err = functions.GotMetadataFunc(hyperFile)
				if err != nil {
					return fmt.Errorf("failed to execute GotMetadataFunc: %w", err)
				}
			}
		}
	}

	if !isResumed {
		functions.TaskFunc("Getting file metadata")
		hyperFile, err = ConstructHyperFile(url, concurrentDownloads, targetPartSize, advancedOptions, 0)
		if err != nil {
			return fmt.Errorf("failed to construct hyper file: %w", err)
		}

		// Emit gotMetadata event with the hyperFile metadata, so the frontend can use this information to display the file name, size, and progress of the download
		if functions.GotMetadataFunc != nil {
			err = functions.GotMetadataFunc(hyperFile)
			if err != nil {
				return fmt.Errorf("failed to execute GotMetadataFunc: %w", err)
			}
		}

		functions.TaskFunc("Downloading file")
		functions.ProgressFunc(0.05)

		// Create temp directory if it doesn't exist
		err = os.MkdirAll(tempDir, 0755)
		if err != nil {
			return fmt.Errorf("failed to create temp directory: %w", err)
		}

		// Save the hyperFile metadata to a download.json file in the tempDir, so that if the download is paused or stopped, we can resume it later by reading this file
		downloadJsonData, err := json.Marshal(hyperFile)
		if err != nil {
			return fmt.Errorf("failed to marshal hyper file metadata: %w", err)
		}
		err = os.WriteFile(downloadJsonPath, downloadJsonData, 0644)
		if err != nil {
			return fmt.Errorf("failed to write download.json file: %w", err)
		}
	}

	if functions.CheckPausedFunc != nil && functions.CheckPausedFunc() {
		functions.TaskFunc("Download paused")
		return nil
	}

	if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
		functions.TaskFunc("Download cancelled")
		// Delete temp directory and all its contents
		_ = os.RemoveAll(tempDir)
		return nil
	}

	err = DownloadParts(hyperFile.Parts, tempDir, concurrentDownloads, advancedOptions, functions)
	if err != nil {
		return fmt.Errorf("failed to download parts: %w", err)
	}

	if functions.CheckPausedFunc != nil && functions.CheckPausedFunc() {
		functions.TaskFunc("Download paused")
		return nil
	}
	if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
		functions.TaskFunc("Download cancelled")
		// Delete temp directory and all its contents
		_ = os.RemoveAll(tempDir)
		return nil
	}

	outputFilePath := filepath.Join(outputDir, hyperFile.Filename)
	functions.TaskFunc("Combining parts")
	err = CombineParts(tempDir, outputFilePath, functions)
	if err != nil {
		return fmt.Errorf("failed to combine parts: %w", err)
	}

	// Delete temp directory
	_ = os.RemoveAll(tempDir)

	functions.TaskFunc("Download completed")

	return nil
}
