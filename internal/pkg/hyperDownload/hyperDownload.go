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
	"time"

	"github.com/valyala/fasthttp"
)

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
	err := fasthttp.Do(req, resp)
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
		err := fasthttp.Do(req, resp)
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
						filename = cdStr[filenameStart+1 : filenameStart+1+filenameEnd]
					}
				} else {
					filenameEnd := strings.IndexAny(cdStr[filenameStart:], "; ")
					if filenameEnd != -1 {
						filename = cdStr[filenameStart : filenameStart+filenameEnd]
					} else {
						filename = cdStr[filenameStart:]
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
	if targetPartCount < concurrentDownloads {
		partCount = concurrentDownloads
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

func DownloadPart(part hyperStructs.HyperFilePart, outputDir string, retryindex int, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions) error {
	// If file already exists, skip downloading this part
	filename := fmt.Sprintf("%s/%s", outputDir, part.Filename)
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
	rangeHeader := fmt.Sprintf("bytes=%d-%d", part.StartByte, part.EndByte)
	req.Header.Set("Range", rangeHeader)
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
	err := fasthttp.Do(req, resp)
	if err != nil {
		return fmt.Errorf("failed to download part: %w", err)
	}

	if resp.StatusCode() != fasthttp.StatusPartialContent {
		// If the server returns an error starting in 5, we retry.
		if resp.StatusCode() >= 500 && resp.StatusCode() < 600 {
			if retryindex < 5 {
				// Delay 1 second before retrying
				time.Sleep(time.Second)
				return DownloadPart(part, outputDir, retryindex+1, advancedOptions)
			}
			return fmt.Errorf("failed to download part after 5 retries: %d", resp.StatusCode())
		}
		return fmt.Errorf("download part request returned non-206 status code: %d", resp.StatusCode())
	} else {

		// Save the part to a file
		filename = fmt.Sprintf("%s/%s", outputDir, part.Filename)
		err = os.WriteFile(filename, resp.Body(), 0644)
		if err != nil {
			return fmt.Errorf("failed to save part to file: %w", err)
		}
		return nil
	}
}

// Download parts using goroutines
func DownloadParts(parts []hyperStructs.HyperFilePart, outputDir string, concurrentDownloads int, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions, functions hyperStructs.HyperFunctions) error {
	downloadedParts := 0
	totalParts := len(parts)
	sem := make(chan struct{}, concurrentDownloads)
	errChan := make(chan error, len(parts))
	for _, part := range parts {
		sem <- struct{}{}
		go func(part hyperStructs.HyperFilePart) {
			defer func() { <-sem }()
			if functions.CheckPausedFunc != nil && functions.CheckPausedFunc() {
				functions.TaskFunc("Download paused")
				errChan <- nil
				return
			}
			if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
				functions.TaskFunc("Download cancelled")
				errChan <- nil
				return
			}
			err := DownloadPart(part, outputDir, 0, advancedOptions)
			if err != nil {
				errChan <- fmt.Errorf("failed to download part %d: %w", part.PartNumber, err)
			}
			downloadedParts++
			if functions.ProgressFunc != nil {
				functions.ProgressFunc(((float64(downloadedParts) / float64(totalParts)) * 0.9) + 0.05)
			}
			if functions.TaskFunc != nil {
				functions.TaskFunc(fmt.Sprintf("Downloaded part %d of %d", downloadedParts, totalParts))
			}
		}(part)
	}
	// Wait for all downloads to finish
	for i := 0; i < cap(sem); i++ {
		sem <- struct{}{}
	}
	close(errChan)

	// Check for errors
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

		partNumberStr := strings.TrimPrefix(filepath.Ext(name), ".")

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
		partFilePath := fmt.Sprintf("%s/%s", partsDir, partFileInfo.name)
		partFile, err := os.Open(partFilePath)
		if err != nil {
			return fmt.Errorf("failed to open part file: %w", err)
		}
		_, err = io.Copy(outputFile, partFile)
		partFile.Close()
		if err != nil {
			return fmt.Errorf("failed to write part to output file: %w", err)
		}
		err = os.Remove(partFilePath)
		if functions.CheckCancelledFunc != nil && functions.CheckCancelledFunc() {
			functions.TaskFunc("Download cancelled")
			// Delete output file
			os.Remove(outputFilePath)
			// Delete temp directory and all its contents
			os.RemoveAll(partsDir)
			return nil
		}
	}
	return nil
}

func DownloadFile(url string, outputDir string, tempDir string, concurrentDownloads int, targetPartSize int64, advancedOptions *hyperStructs.HyperDownloadAdvancedOptions, functions hyperStructs.HyperFunctions) error {
	// Check if a download.json file exists in the tempDir, if it does, we can assume that this is a resumed download and we can skip the metadata fetching and go straight to downloading the parts, otherwise we need to fetch the metadata and emit the gotMetadata event
	downloadJsonPath := fmt.Sprintf("%s/download.json", tempDir)
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
		if err != nil {
			return fmt.Errorf("failed to unmarshal download.json file: %w", err)
		}

		if functions.GotMetadataFunc != nil {
			err = functions.GotMetadataFunc(hyperFile)
			if err != nil {
				return fmt.Errorf("failed to execute GotMetadataFunc: %w", err)
			}
		}
	} else {

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
		err = os.RemoveAll(tempDir)
		if err != nil {
			return fmt.Errorf("failed to delete temp directory: %w", err)
		}
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
		err = os.RemoveAll(tempDir)
		if err != nil {
			return fmt.Errorf("failed to delete temp directory: %w", err)
		}
		return nil
	}

	outputFilePath := fmt.Sprintf("%s/%s", outputDir, hyperFile.Filename)
	functions.TaskFunc("Combining parts")
	err = CombineParts(tempDir, outputFilePath, functions)
	if err != nil {
		return fmt.Errorf("failed to combine parts: %w", err)
	}

	// Delete temp directory
	err = os.RemoveAll(tempDir)
	if err != nil {
		return fmt.Errorf("failed to delete temp directory: %w", err)
	}
	functions.TaskFunc("Download completed")

	return nil
}
