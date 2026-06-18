package main

import (
	"embed"

	"log"

	"hyperion-downloader/services"
	"hyperion-downloader/setups"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register events
	application.RegisterEvent[services.HyperDownloadTasksSnapshot]("tasksSnapshot")
	application.RegisterEvent[services.HyperDownloadError]("downloadError")
	application.RegisterEvent[*services.HyperDownloadTask]("downloadCompleted")
}

func main() {
	appOptions := application.Options{
		Name:        "Hyperion Downloader",
		Description: "A multi-threaded downloader built with Go and Wails.",
		Services:    []application.Service{},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		IOS: application.IOSOptions{
			DisableInputAccessoryView: true,
			DisableSafeAreaInsets:     true,
			DisableBounce:             true,
			BackgroundColour:          application.NewRGBA(18, 18, 18, 255),
		},
	}

	// Platform-specific options setup
	setups.IosSpecificOptionsSetup(&appOptions)

	// Create application
	app := application.New(appOptions)

	// Platform-specific app setups
	setups.IosSpecificAppSetup(app)

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
		BackgroundColour: application.NewRGBA(18, 18, 18, 255),
		URL:              "/",
	})

	// Run application
	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
