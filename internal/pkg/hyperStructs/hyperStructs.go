package hyperStructs

type HyperFilePart struct {
	Url        string `json:"url"`        // URL to download this part from. Must support HTTP Range requests.
	Filename   string `json:"filename"`   // i.e. file.25 (Should have minumal padding to ensure correct ordering when sorted lexicographically)
	PartNumber int    `json:"partNumber"` // Part number, starting from 0
	StartByte  int64  `json:"startByte"`  // Start byte for this part, inclusive, starting from 0
	EndByte    int64  `json:"endByte"`    // End byte for this part, inclusive
}

type HyperFile struct {
	Url      string          `json:"url"`      // URL to download this file from. Must support HTTP Range requests. This is used for single-part downloads and as a fallback for multi-part downloads.
	Filename string          `json:"filename"` // i.e. file.25
	Size     int64           `json:"size"`     // Total size of the file in bytes
	Parts    []HyperFilePart `json:"parts"`
}

type HyperDownloadAdvancedOptions struct {
	Cookies             string `json:"cookies"`             // Cookies to include in the download request, formatted as a single string (e.g. "key1=value1; key2=value2")
	UserAgent           string `json:"userAgent"`           // User-Agent string to include in the download request
	Referer             string `json:"referer"`             // Referer URL to include in the download request
	AuthorizationHeader string `json:"authorizationHeader"` // Value for the Authorization header to include in the download request (e.g. "Bearer <token>")
}

type HyperFunctions interface {
	GotMetadataFunc(*HyperFile) error
	ProgressFunc(float64) error
	TaskFunc(string) error
	CheckPausedFunc() bool
	CheckCancelledFunc() bool
}
