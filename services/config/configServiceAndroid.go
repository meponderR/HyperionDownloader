//go:build android

package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type ConfigService struct {
	app *application.App
}

type Config struct {
	OutputDir        string `json:"outputDir"`
	DefaultCookie    string `json:"defaultCookie"`
	DefaultUserAgent string `json:"defaultUserAgent"`
}

type PlatformInfo struct {
	OS string `json:"os"`
}

func NewConfigService(app *application.App) *ConfigService {
	return &ConfigService{app: app}
}

func (cs *ConfigService) GetPlatformInfo() PlatformInfo {
	return PlatformInfo{
		OS: runtime.GOOS,
	}
}

func getExternalStoragePath() string {
	StorageJsonString := application.Android.StorageJSON()
	var StorageJson struct {
		InternalStorage string `json:"internalStorage"`
		InternalCache   string `json:"internalCache"`
		ExternalStorage string `json:"externalStorage"`
	}
	err := json.Unmarshal([]byte(StorageJsonString), &StorageJson)
	if err != nil {
		return ""
	}
	return StorageJson.ExternalStorage
}
func getInternalStoragePath() string {
	StorageJsonString := application.Android.StorageJSON()
	var StorageJson struct {
		InternalStorage string `json:"internalStorage"`
		InternalCache   string `json:"internalCache"`
		ExternalStorage string `json:"externalStorage"`
	}
	err := json.Unmarshal([]byte(StorageJsonString), &StorageJson)
	if err != nil {
		return ""
	}
	return StorageJson.InternalStorage
}
func getInternalCachePath() string {
	StorageJsonString := application.Android.StorageJSON()
	var StorageJson struct {
		InternalStorage string `json:"internalStorage"`
		InternalCache   string `json:"internalCache"`
		ExternalStorage string `json:"externalStorage"`
	}
	err := json.Unmarshal([]byte(StorageJsonString), &StorageJson)
	if err != nil {
		return ""
	}
	return StorageJson.InternalCache
}

func (cs *ConfigService) GetAppDataDir() string {
	dataDir := getInternalStoragePath()
	// Ensure the directory exists
	os.MkdirAll(dataDir, 0755)
	return dataDir
}

func (cs *ConfigService) GetDownloadsDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return getExternalStoragePath()
	}
	downloadsDir := filepath.Join(homeDir, "Download")
	return downloadsDir
}

func (cs *ConfigService) GetCacheDir() string {
	return getExternalStoragePath()
}

func (cs *ConfigService) ReadConfig() (*Config, error) {
	// Read from the config.json file in the app data directory. If the file doesn't exist, return a default config.
	configPath := filepath.Join(cs.GetAppDataDir(), "config.json")
	file, err := os.Open(configPath)
	defer file.Close()
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{
				DefaultCookie:    "",
				DefaultUserAgent: "",
			}, nil
		}
		return nil, err
	}
	var config Config
	err = json.NewDecoder(file).Decode(&config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (cs *ConfigService) SaveConfig(config *Config) error {
	// Save the config to a config.json file in the app data directory.
	configDir := cs.GetAppDataDir()
	err := os.MkdirAll(configDir, 0755)
	if err != nil {
		return err
	}
	configPath := filepath.Join(configDir, "config.json")
	file, err := os.Create(configPath)
	if err != nil {
		return err
	}
	defer file.Close()
	return json.NewEncoder(file).Encode(config)
}

func (cs *ConfigService) GetOutputDir() string {
	return cs.GetDownloadsDir()
}
func (cs *ConfigService) SetOutputDir(outputDir string) error {
	return nil
}

func (cs *ConfigService) GetDefaultCookie() string {
	config, err := cs.ReadConfig()
	if err != nil {
		return ""
	}
	return config.DefaultCookie
}
func (cs *ConfigService) SetDefaultCookie(cookie string) error {
	config, err := cs.ReadConfig()
	if err != nil {
		return err
	}
	config.DefaultCookie = cookie
	return cs.SaveConfig(config)
}

func (cs *ConfigService) GetDefaultUserAgent() string {
	config, err := cs.ReadConfig()
	if err != nil {
		return ""
	}
	return config.DefaultUserAgent
}
func (cs *ConfigService) SetDefaultUserAgent(userAgent string) error {
	config, err := cs.ReadConfig()
	if err != nil {
		return err
	}
	config.DefaultUserAgent = userAgent
	return cs.SaveConfig(config)
}

func (cs *ConfigService) PickDir(title string) (string, error) {
	return "", nil
}
