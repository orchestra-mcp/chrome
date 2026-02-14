# Orchestra Chrome Plugin

Go plugin that bridges the Orchestra plugin system to a Chrome Extension. Collects views, tabs, content scripts, and dependencies from all active plugins, generates TypeScript manifests, and builds a Chrome Manifest V3 extension via Vite.

## Overview

The Chrome plugin provides a `chrome:build` CLI command that:

1. **Collects contributions** from all active Orchestra plugins (sidebar views, editor tabs, status bar items, content scripts, npm dependencies)
2. **Generates TypeScript manifests** (`plugin-views.ts`, `extension-config.ts`, `content-scripts.ts`, `manifest.json`, Vite config files)
3. **Copies the extension template** (React + Vite) and generates dynamic files on top
4. **Builds the extension** via Vite (two-pass: ES modules + content script IIFE)

The output is a ready-to-load unpacked Chrome extension at `resources/chrome/dist/`.

## Install

### From Source

```bash
cd plugins/chrome && go build -o orchestra-chrome ./src/cmd/
```

### Via Makefile

```bash
make chrome-build    # Full build pipeline
```

## Usage

### CLI

```bash
# Build the Chrome extension (from plugin dir)
cd plugins/chrome && go run ./src/cmd/ build --workspace ../..

# Or from repo root
make chrome-build
```

### What `chrome:build` Does

```
1. Copy template from plugins/chrome/resources/extension/ → resources/chrome/
2. Generate src/generated/plugin-views.ts      (sidebar views, tabs, status bar)
3. Generate src/generated/extension-config.ts  (app name, version, API URL)
4. Generate src/generated/content-scripts.ts   (content script definitions)
5. Generate public/manifest.json               (Chrome Manifest V3)
6. Generate vite.plugins.json                  (plugin path aliases)
7. Generate vite.scripts.json                  (dedupe packages)
8. Run pnpm install + pnpm build               (Vite → dist/)
```

### Integrated Plugin

```go
import chromeproviders "github.com/orchestra-mcp/chrome/providers"

pm := plugins.NewPluginManager(cfg)
pm.Register(chromeproviders.NewChromePlugin())
pm.Boot()
```

## Structure

```
plugins/chrome/
├── go.mod                              # Standalone module
├── config/chrome.go                    # ChromeConfig (name, version, paths)
├── providers/
│   ├── plugin.go                       # ChromePlugin — Go plugin registration
│   └── builder.go                      # SidebarBuilder, TabBuilder fluent APIs
├── src/
│   ├── cmd/main.go                     # CLI entry point (chrome:build)
│   ├── types/
│   │   ├── views.go                    # ChromeViewDef, ChromeTabDef, StatusBarItemDef
│   │   └── config.go                   # ExtensionConfig (serialized to TS)
│   ├── registry/
│   │   └── chrome_registry.go          # ChromeContributesRegistry
│   └── generator/
│       ├── generator.go                # Main orchestrator
│       ├── manifest.go                 # manifest.json generator
│       ├── views.go                    # plugin-views.ts generator
│       ├── config.go                   # extension-config.ts generator
│       ├── scripts.go                  # content-scripts.ts generator
│       ├── vite.go                     # vite.plugins.json + vite.scripts.json
│       └── copy.go                     # Template file copy utility
├── resources/
│   └── extension/                      # Extension template source
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── sidepanel.html
│       └── src/
│           ├── background/service-worker.ts
│           ├── sidepanel/index.tsx
│           ├── sidepanel/App.tsx
│           ├── content/index.ts
│           ├── content/messages.ts
│           ├── lib/api-client.ts
│           ├── lib/chrome-bridge.ts
│           └── generated/              # Populated by generator
└── docs/architecture.md
```

## Plugin Contributions

Other Orchestra plugins contribute Chrome features by implementing interfaces:

```go
// Sidebar views, editor tabs, status bar items
type HasChromeViews interface {
    ChromeViews() []ChromeViewDef
}

// Content scripts injected into web pages
type HasChromeContentScripts interface {
    ChromeContentScripts() []ChromeContentScriptDef
}

// npm dependencies to install
type HasChromeDependencies interface {
    ChromeDependencies() map[string]string
}
```

### Fluent Builders

```go
view := builders.SidebarBuilder("explorer-panel", pluginID).
    Title("Explorer").
    Icon("folder").
    Component("@plugin/explorer/ExplorerPanel.tsx").
    Searchable("Search files...").
    Priority(100).
    Build()
```

## Configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `name` | string | `"Orchestra"` | Extension display name |
| `description` | string | `"Orchestra IDE Chrome Extension"` | Extension description |
| `version` | string | `"0.1.0"` | Extension version |
| `api_url` | string | `"http://localhost:8080"` | Backend API URL |
| `extension_path` | string | `"plugins/chrome/resources/extension"` | Template source path |
| `output_path` | string | `"resources/chrome"` | Generated output path |

## Testing & Code Quality

```bash
# Run tests
cd plugins/chrome && go test ./... -v

# Run linter
cd plugins/chrome && golangci-lint run ./...

# Format code
gofumpt -w config/ providers/ src/
```

## Extension Development

After building with `make chrome-build`:

```bash
# Dev mode with watch
cd resources/chrome && pnpm dev

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked" → select resources/chrome/dist/
```
