//go:build !ios && !android

package updaterService

import (
	"context"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type UpdaterService struct {
	app *application.App
}

func NewUpdaterService(app *application.App) *UpdaterService {
	return &UpdaterService{app: app}
}

func (us *UpdaterService) CheckForUpdates() (string, error) {
	err := us.app.Updater.CheckAndInstall(context.Background())
	if err != nil {
		return "", err
	}
	return "Update check completed", nil
}
