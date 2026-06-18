//go:build !ios

package setups

import "github.com/wailsapp/wails/v3/pkg/application"

// IosSpecificOptionsSetup is a no-op on non-iOS platforms
func IosSpecificOptionsSetup(opts *application.Options) {
	// No modifications needed for non-iOS platforms
}

// IosSpecificAppSetup is a no-op on non-iOS platforms
func IosSpecificAppSetup(app *application.App) {
	// No modifications needed for non-iOS platforms
}
