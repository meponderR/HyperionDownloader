//go:build ios

package services

import (
	"net/url"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type DownloadedFilesService struct {
	app *application.App
}

func NewDownloadedFilesService(app *application.App) *DownloadedFilesService {
	return &DownloadedFilesService{app: app}
}

type DownloadedFile struct {
	Name  string `json:"name"`
	Path  string `json:"path"`
	Size  int64  `json:"size"`
	MTime int64  `json:"mtime"`
	Dir   bool   `json:"dir"`
}

func (dfs *DownloadedFilesService) GetFiles(path string) ([]DownloadedFile, error) {
	files := []DownloadedFile{}
	err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			files = append(files, DownloadedFile{
				Name:  info.Name(),
				Path:  filePath,
				Size:  info.Size(),
				MTime: info.ModTime().Unix(),
				Dir:   info.IsDir(),
			})
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func (dfs *DownloadedFilesService) DeleteFile(path string) error {
	err := os.Remove(path)
	dfs.app.Event.Emit("fileUpdate", path)
	return err
}

func (dfs *DownloadedFilesService) ShareFile(path string) error {
	// Convert the file path to a file URL
	fileURL := &url.URL{
		Scheme: "file",
		Path:   filePath,
	}
	dfs.app.IOS.Share(`{"url": "` + fileURL.String() + `"}`)
	return nil
}
