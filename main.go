package main

import (
	"context"
	"embed"
	"time"

	"log"

	"hyperion-downloader/services"
	"hyperion-downloader/services/config"
	"hyperion-downloader/services/downloadedFiles"
	"hyperion-downloader/services/hyperDownload"
	"hyperion-downloader/services/updaterService"
	"hyperion-downloader/setups"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/updater"
	"github.com/wailsapp/wails/v3/pkg/updater/providers/github"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register events
	application.RegisterEvent[hyperDownload.HyperDownloadTasksSnapshot]("tasksSnapshot")
	application.RegisterEvent[hyperDownload.HyperDownloadError]("downloadError")
	application.RegisterEvent[*hyperDownload.HyperDownloadTask]("downloadCompleted")
	application.RegisterEvent[string]("fileUpdate")
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
			DisableBounce:             true,
			BackgroundColour:          application.NewRGBA(18, 18, 18, 255),
		},
		Android: application.AndroidOptions{},
	}

	// Platform-specific options setup
	setups.IosSpecificOptionsSetup(&appOptions)

	// Create application
	app := application.New(appOptions)

	// Platform-specific app setups
	setups.IosSpecificAppSetup(app)

	// Register services
	app.RegisterService(application.NewService(config.NewConfigService(app)))
	app.RegisterService(application.NewService(services.NewWindowControls(app)))
	app.RegisterService(application.NewService(hyperDownload.NewHyperDownloadService(app)))
	app.RegisterService(application.NewService(downloadedFiles.NewDownloadedFilesService(app)))
	app.RegisterService(application.NewService(updaterService.NewUpdaterService(app)))

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

	// Set up auto-updater
	const currentVersion = "0.1.5"

	gh, err := github.New(github.Config{
		Repository:    "meponderR/HyperionDownloader",
		ChecksumAsset: "SHA256SUMS",
	})
	if err != nil {
		log.Fatalf("github.New: %v", err)
	}

	if err := app.Updater.Init(updater.Config{
		CurrentVersion: currentVersion,
		Providers:      []updater.Provider{gh},
		CheckInterval:  6 * time.Hour,
	}); err != nil {
		log.Fatalf("Updater.Init: %v", err)
	}

	// Set up application menu
	menu := app.Menu.New()
	app.Menu.SetApplicationMenu(menu)
	appMenu := menu.AddSubmenu("App")
	appMenu.Add("Check for Updates…").OnClick(func(*application.Context) {
		go func() {
			if err := app.Updater.CheckAndInstall(context.Background()); err != nil {
				app.Logger.Error("update", "error", err)
			}
		}()
	})

	// Run application
	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
