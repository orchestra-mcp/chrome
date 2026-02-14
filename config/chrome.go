package config

// ChromeConfig holds configuration for the Chrome extension plugin.
type ChromeConfig struct {
	Name          string `json:"name" yaml:"name"`
	Description   string `json:"description" yaml:"description"`
	Version       string `json:"version" yaml:"version"`
	ApiURL        string `json:"api_url" yaml:"api_url"`
	ExtensionPath string `json:"extension_path" yaml:"extension_path"`
	OutputPath    string `json:"output_path" yaml:"output_path"`
}

// DefaultConfig returns sensible defaults for the Chrome extension plugin.
func DefaultConfig() *ChromeConfig {
	return &ChromeConfig{
		Name:          "Orchestra",
		Description:   "Orchestra IDE Chrome Extension",
		Version:       "0.1.0",
		ApiURL:        "http://localhost:8080",
		ExtensionPath: "plugins/chrome/resources/extension",
		OutputPath:    "resources/chrome",
	}
}
