//go:build !ios && !android

package downloadedFiles

import (
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
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			return nil, err
		}
		files = append(files, DownloadedFile{
			Name:  info.Name(),
			Path:  filepath.Join(path, info.Name()),
			Size:  info.Size(),
			MTime: info.ModTime().Unix(),
			Dir:   info.IsDir(),
		})
	}
	return files, nil
}

func (dfs *DownloadedFilesService) DeleteFile(path string) error {
	err := os.Remove(path)
	dfs.app.Event.Emit("fileUpdate", path)
	return err
}

func (dfs *DownloadedFilesService) ShareFile(filePath string) error {
	return nil
}
