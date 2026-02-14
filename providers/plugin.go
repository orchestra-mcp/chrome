package providers

import (
	"fmt"

	"github.com/orchestra-mcp/chrome/config"
	"github.com/orchestra-mcp/chrome/src/generator"
	"github.com/orchestra-mcp/framework/app/plugins"
)

// ChromePlugin implements the Orchestra plugin interface for Chrome extension generation.
// It collects chrome contributions from all plugins and generates TypeScript files.
type ChromePlugin struct {
	active bool
	ctx    *plugins.PluginContext
	cfg    *config.ChromeConfig
}

// NewChromePlugin creates a new ChromePlugin instance.
func NewChromePlugin() *ChromePlugin { return &ChromePlugin{} }

func (p *ChromePlugin) ID() string             { return "orchestra/chrome" }
func (p *ChromePlugin) Name() string           { return "Chrome Extension" }
func (p *ChromePlugin) Version() string        { return "0.1.0" }
func (p *ChromePlugin) Dependencies() []string { return nil }
func (p *ChromePlugin) IsActive() bool         { return p.active }
func (p *ChromePlugin) FeatureFlag() string    { return "chrome" }
func (p *ChromePlugin) ConfigKey() string      { return "chrome" }

func (p *ChromePlugin) DefaultConfig() map[string]any {
	return map[string]any{
		"name":           "Orchestra",
		"description":    "Orchestra IDE Chrome Extension",
		"version":        "0.1.0",
		"api_url":        "http://localhost:8080",
		"extension_path": "plugins/chrome/resources/extension",
		"output_path":    "resources/chrome",
	}
}

// Activate initializes the chrome plugin with configuration.
func (p *ChromePlugin) Activate(ctx *plugins.PluginContext) error {
	p.ctx = ctx
	p.cfg = config.DefaultConfig()
	if v := ctx.GetConfigString("api_url"); v != "" {
		p.cfg.ApiURL = v
	}
	if v := ctx.GetConfigString("output_path"); v != "" {
		p.cfg.OutputPath = v
	}
	p.active = true
	ctx.Logger.Info().Str("plugin", p.ID()).Msg("chrome plugin activated")
	return nil
}

// Deactivate stops the chrome plugin.
func (p *ChromePlugin) Deactivate() error {
	p.active = false
	return nil
}

// Commands returns the CLI commands provided by this plugin.
func (p *ChromePlugin) Commands() []plugins.Command {
	return []plugins.Command{
		{Name: "chrome:build", Description: "Generate Chrome extension files from plugin contributions", Handler: p.cmdBuild},
	}
}

func (p *ChromePlugin) cmdBuild(args []string) error {
	workspace := "."
	if len(args) > 0 {
		workspace = args[0]
	}
	gen := generator.New(p.cfg)
	if err := gen.Build(workspace); err != nil {
		return fmt.Errorf("chrome build failed: %w", err)
	}
	return nil
}

// Compile-time interface assertions.
var (
	_ plugins.Plugin         = (*ChromePlugin)(nil)
	_ plugins.HasConfig      = (*ChromePlugin)(nil)
	_ plugins.HasCommands    = (*ChromePlugin)(nil)
	_ plugins.HasFeatureFlag = (*ChromePlugin)(nil)
)
