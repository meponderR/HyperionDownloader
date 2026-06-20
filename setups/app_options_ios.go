//go:build ios

package setups

import "github.com/wailsapp/wails/v3/pkg/application"

func IosSpecificOptionsSetup(opts *application.Options) {
	// Disable signal handlers on iOS to prevent crashes
	opts.DisableDefaultSignalHandler = true
	opts.IOS.DisableSafeAreaInsets = true
}

func IosSpecificAppSetup(app *application.App) {
	application.IOS.SetStatusBar(`{"style":"light","hidden":false}`)
}
