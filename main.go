package main

import (
	"embed"

	"log"

	"hyperion-downloader/services"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register events
	application.RegisterEvent[services.HyperDownloadTasksSnapshot]("tasksSnapshot")
	application.RegisterEvent[services.HyperDownloadError]("downloadError")
	application.RegisterEvent[string]("downloadCompleted")
}

func main() {
	// Create application
	app := application.New(application.Options{
		Name:        "Hyperion Downloader",
		Description: "A multi-threaded downloader built with Go and Wails.",
		Services:    []application.Service{},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Register services
	app.RegisterService(application.NewService(services.NewConfigService(app)))
	app.RegisterService(application.NewService(services.NewWindowControls(app)))
	app.RegisterService(application.NewService(services.NewHyperDownloadService(app)))

	// Create window
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:      "main",
		Title:     "Hyperion Downloader",
		Width:     800,
		Height:    700,
		Frameless: true,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	// Run application
	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
