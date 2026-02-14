package generator

import (
	"encoding/json"
	"sort"

	"github.com/orchestra-mcp/chrome/src/types"
)

// vitePluginEntry represents a single plugin alias entry for Vite.
type vitePluginEntry struct {
	Namespace string `json:"namespace"`
	Path      string `json:"path"`
}

// GenerateVitePlugins produces JSON for vite.plugins.json.
// Vite reads this to create resolve aliases for each plugin's component directory.
func GenerateVitePlugins(configs map[string]types.ChromeViewsConfig) ([]byte, error) {
	entries := make(map[string]vitePluginEntry, len(configs))

	// Sort keys for deterministic output.
	keys := make([]string, 0, len(configs))
	for k := range configs {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, k := range keys {
		cfg := configs[k]
		entries[k] = vitePluginEntry{
			Namespace: cfg.Namespace,
			Path:      cfg.Path,
		}
	}

	return json.MarshalIndent(entries, "", "  ")
}

// GenerateViteScripts produces JSON for vite.scripts.json.
// Vite reads this for optimizeDeps.include / dedupe for plugin packages.
func GenerateViteScripts(packages []string) ([]byte, error) {
	sort.Strings(packages)
	return json.MarshalIndent(packages, "", "  ")
}
