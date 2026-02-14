package generator

import (
	"encoding/json"
	"sort"

	"github.com/orchestra-mcp/chrome/config"
	"github.com/orchestra-mcp/chrome/src/types"
)

// manifestBase is the Chrome Manifest V3 structure.
type manifestBase struct {
	ManifestVersion int                    `json:"manifest_version"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Version         string                 `json:"version"`
	Permissions     []string               `json:"permissions"`
	SidePanel       map[string]string      `json:"side_panel,omitempty"`
	Action          map[string]string      `json:"action,omitempty"`
	Background      map[string]string      `json:"background,omitempty"`
	ContentScripts  []manifestContentEntry `json:"content_scripts,omitempty"`
}

type manifestContentEntry struct {
	Matches   []string `json:"matches"`
	JS        []string `json:"js"`
	RunAt     string   `json:"run_at,omitempty"`
	AllFrames bool     `json:"all_frames,omitempty"`
}

// GenerateManifest builds a Chrome Manifest V3 JSON from the base template
// plus dynamic content scripts contributed by plugins.
func GenerateManifest(cfg *config.ChromeConfig, scripts []types.ChromeContentScriptDef) ([]byte, error) {
	m := manifestBase{
		ManifestVersion: 3,
		Name:            cfg.Name,
		Description:     cfg.Description,
		Version:         cfg.Version,
		Permissions:     []string{"sidePanel", "storage", "activeTab", "tabs", "scripting"},
		SidePanel:       map[string]string{"default_path": "sidepanel.html"},
		Action:          map[string]string{"default_title": cfg.Name},
		Background:      map[string]string{"service_worker": "background.js", "type": "module"},
	}

	// Sort content scripts by priority for deterministic output.
	sort.Slice(scripts, func(i, j int) bool { return scripts[i].Priority < scripts[j].Priority })

	for _, s := range scripts {
		entry := manifestContentEntry{
			Matches:   s.Matches,
			JS:        []string{s.Entry},
			RunAt:     normalizeRunAt(s.RunAt),
			AllFrames: s.AllFrames,
		}
		m.ContentScripts = append(m.ContentScripts, entry)
	}

	return json.MarshalIndent(m, "", "  ")
}

const (
	runAtDocumentStart = "document_start"
	runAtDocumentEnd   = "document_end"
	runAtDocumentIdle  = "document_idle"
)

// normalizeRunAt ensures valid Chrome run_at values.
func normalizeRunAt(runAt string) string {
	switch runAt {
	case runAtDocumentStart, runAtDocumentEnd, runAtDocumentIdle:
		return runAt
	default:
		return runAtDocumentIdle
	}
}
