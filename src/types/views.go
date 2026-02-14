package types

import (
	"github.com/orchestra-mcp/framework/app/plugins"
)

// Type aliases for framework Chrome types used within this plugin.
// These avoid verbose imports in the generator package.
type (
	ChromeViewDef          = plugins.ChromeViewDef
	ChromeTabDef           = plugins.ChromeTabDef
	ChromeStatusBarDef     = plugins.ChromeStatusBarDef
	ChromeContentScriptDef = plugins.ChromeContentScriptDef
	ChromeViewsConfig      = plugins.ChromeViewsConfig
	HeaderActionDef        = plugins.HeaderActionDef
)
