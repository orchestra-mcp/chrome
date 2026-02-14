# Changelog

All notable changes to Orchestra Chrome Plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-14

### Added

- Go plugin bridge for Chrome extension generation
- `chrome:build` CLI command — collects plugin contributions and generates extension
- TypeScript generators for plugin-views.ts, extension-config.ts, content-scripts.ts
- Chrome Manifest V3 generator with dynamic content scripts
- Vite config generators (plugin aliases, dedupe packages)
- Extension template: React side panel, service worker, content scripts
- Fluent builders: SidebarBuilder, TabBuilder for plugin contributions
- ChromeContributesRegistry for collecting views, tabs, status bar items
- Template copy utility for extension source files
- GitHub Actions CI/CD (lint, format, test, build, release)
- golangci-lint + gofumpt formatting

[0.1.0]: https://github.com/orchestra-mcp/chrome/releases/tag/v0.1.0
