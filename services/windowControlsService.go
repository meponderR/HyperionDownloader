package services

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

type WindowControls struct {
	app *application.App
}

func NewWindowControls(app *application.App) *WindowControls {
	return &WindowControls{app: app}
}

func (wc *WindowControls) Minimise() {
	window, _ := wc.app.Window.GetByName("main")
	window.Minimise()
}

func (wc *WindowControls) Maximise() {
	window, _ := wc.app.Window.GetByName("main")
	if window.IsMaximised() {
		window.UnMaximise()
	} else {
		window.Maximise()
	}
}

func (wc *WindowControls) Close() {
	window, _ := wc.app.Window.GetByName("main")
	window.Close()
}
