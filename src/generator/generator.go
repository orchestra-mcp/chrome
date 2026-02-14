package generator

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/orchestra-mcp/chrome/config"
	"github.com/orchestra-mcp/chrome/src/types"
)

// Generator produces TypeScript and JSON files for the Chrome extension
// from plugin contributions. It does not run pnpm or Vite.
type Generator struct {
	cfg            *config.ChromeConfig
	views          []types.ChromeViewDef
	tabs           []types.ChromeTabDef
	statusBar      []types.ChromeStatusBarDef
	contentScripts []types.ChromeContentScriptDef
	viewConfigs    map[string]types.ChromeViewsConfig
	packages       []string
}

// New creates a Generator with the given configuration.
func New(cfg *config.ChromeConfig) *Generator {
	return &Generator{
		cfg:         cfg,
		viewConfigs: make(map[string]types.ChromeViewsConfig),
	}
}

// AddViews registers sidebar/panel views for generation.
func (g *Generator) AddViews(views []types.ChromeViewDef) { g.views = append(g.views, views...) }

// AddTabs registers tab definitions for generation.
func (g *Generator) AddTabs(tabs []types.ChromeTabDef) { g.tabs = append(g.tabs, tabs...) }

// AddStatusBar registers status bar items for generation.
func (g *Generator) AddStatusBar(items []types.ChromeStatusBarDef) {
	g.statusBar = append(g.statusBar, items...)
}

// AddContentScripts registers content scripts for generation.
func (g *Generator) AddContentScripts(scripts []types.ChromeContentScriptDef) {
	g.contentScripts = append(g.contentScripts, scripts...)
}

// AddViewConfig registers a plugin's view config (path + namespace).
func (g *Generator) AddViewConfig(pluginID string, cfg types.ChromeViewsConfig) {
	g.viewConfigs[pluginID] = cfg
}

// AddPackages registers npm packages for Vite dedupe.
func (g *Generator) AddPackages(pkgs []string) { g.packages = append(g.packages, pkgs...) }

// Build copies the extension template and generates all Chrome extension files.
func (g *Generator) Build(workspace string) error {
	srcDir := filepath.Join(workspace, g.cfg.ExtensionPath)
	dstDir := filepath.Join(workspace, g.cfg.OutputPath)

	// Copy the extension template to the output directory.
	if srcDir != dstDir {
		if _, err := os.Stat(srcDir); err == nil {
			if err := copyDir(srcDir, dstDir); err != nil {
				return fmt.Errorf("copy template: %w", err)
			}
		}
	}

	// Ensure generated output directory exists.
	outDir := filepath.Join(dstDir, "src", "generated")
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return fmt.Errorf("create output dir: %w", err)
	}

	steps := []struct {
		name string
		fn   func(string) error
	}{
		{"plugin-views.ts", g.writeViews},
		{"extension-config.ts", g.writeConfig},
		{"content-scripts.ts", g.writeContentScripts},
		{"manifest.json", g.writeManifest},
		{"vite.plugins.json", g.writeVitePlugins},
		{"vite.scripts.json", g.writeViteScripts},
	}
	for _, s := range steps {
		if err := s.fn(workspace); err != nil {
			return fmt.Errorf("generate %s: %w", s.name, err)
		}
	}
	return nil
}

func (g *Generator) writeViews(workspace string) error {
	path := filepath.Join(workspace, g.cfg.OutputPath, "src", "generated", "plugin-views.ts")
	content := GeneratePluginViews(g.views, g.tabs, g.statusBar)
	return os.WriteFile(path, []byte(content), 0o644)
}

func (g *Generator) writeConfig(workspace string) error {
	path := filepath.Join(workspace, g.cfg.OutputPath, "src", "generated", "extension-config.ts")
	pluginMap := make(map[string]string)
	for id, vc := range g.viewConfigs {
		pluginMap[id] = vc.Namespace
	}
	extCfg := types.ExtensionConfig{
		Name:        g.cfg.Name,
		Description: g.cfg.Description,
		Version:     g.cfg.Version,
		ApiURL:      g.cfg.ApiURL,
		Plugins:     pluginMap,
	}
	content := GenerateExtensionConfig(extCfg)
	return os.WriteFile(path, []byte(content), 0o644)
}

func (g *Generator) writeContentScripts(workspace string) error {
	path := filepath.Join(workspace, g.cfg.OutputPath, "src", "generated", "content-scripts.ts")
	content := GenerateContentScripts(g.contentScripts)
	return os.WriteFile(path, []byte(content), 0o644)
}

func (g *Generator) writeManifest(workspace string) error {
	// Write to public/ so Vite copies it into dist/ automatically.
	path := filepath.Join(workspace, g.cfg.OutputPath, "public", "manifest.json")
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	data, err := GenerateManifest(g.cfg, g.contentScripts)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

func (g *Generator) writeVitePlugins(workspace string) error {
	path := filepath.Join(workspace, g.cfg.OutputPath, "vite.plugins.json")
	data, err := GenerateVitePlugins(g.viewConfigs)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

func (g *Generator) writeViteScripts(workspace string) error {
	path := filepath.Join(workspace, g.cfg.OutputPath, "vite.scripts.json")
	sort.Strings(g.packages)
	data, err := GenerateViteScripts(g.packages)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}
