package types

// ExtensionConfig is serialized into extension-config.ts for the Chrome extension frontend.
type ExtensionConfig struct {
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Version     string            `json:"version"`
	ApiURL      string            `json:"apiUrl"`
	Plugins     map[string]string `json:"plugins"`
}
