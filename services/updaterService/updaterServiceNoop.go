//go:build ios && android

package updaterService

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

type UpdaterService struct {
	app *application.App
}

func NewUpdaterService(app *application.App) *UpdaterService {
	return &UpdaterService{app: app}
}

func (us *UpdaterService) CheckForUpdates() (string, error) {
	return "Update check is not supported on iOS and Android", nil
}
