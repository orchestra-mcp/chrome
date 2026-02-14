package providers

import (
	"github.com/orchestra-mcp/framework/app/plugins"
)

// SidebarBuilder is a fluent builder for constructing ChromeViewDef sidebar entries.
type SidebarBuilder struct {
	def plugins.ChromeViewDef
}

// NewSidebarBuilder creates a new SidebarBuilder with the given ID and plugin ID.
func NewSidebarBuilder(id, pluginID string) *SidebarBuilder {
	return &SidebarBuilder{
		def: plugins.ChromeViewDef{
			ID:       id,
			PluginID: pluginID,
			Panel:    "sidebar",
		},
	}
}

func (b *SidebarBuilder) Title(t string) *SidebarBuilder     { b.def.Title = t; return b }
func (b *SidebarBuilder) Icon(i string) *SidebarBuilder      { b.def.Icon = i; return b }
func (b *SidebarBuilder) Component(c string) *SidebarBuilder { b.def.Component = c; return b }
func (b *SidebarBuilder) Panel(p string) *SidebarBuilder     { b.def.Panel = p; return b }
func (b *SidebarBuilder) Priority(p int) *SidebarBuilder     { b.def.Priority = p; return b }
func (b *SidebarBuilder) When(w string) *SidebarBuilder      { b.def.When = w; return b }

// Searchable enables the search bar with the given placeholder text.
func (b *SidebarBuilder) Searchable(placeholder string) *SidebarBuilder {
	b.def.HasSearch = true
	b.def.SearchPlaceholder = placeholder
	return b
}

// HeaderAction adds a header action button to the sidebar view.
func (b *SidebarBuilder) HeaderAction(id, icon, title string) *SidebarBuilder {
	b.def.HeaderActions = append(b.def.HeaderActions, plugins.HeaderActionDef{
		ID: id, Icon: icon, Title: title,
	})
	return b
}

// Build returns the completed ChromeViewDef.
func (b *SidebarBuilder) Build() plugins.ChromeViewDef { return b.def }

// TabBuilder is a fluent builder for constructing ChromeTabDef entries.
type TabBuilder struct {
	def plugins.ChromeTabDef
}

// NewTabBuilder creates a new TabBuilder with the given ID and plugin ID.
func NewTabBuilder(id, pluginID string) *TabBuilder {
	return &TabBuilder{
		def: plugins.ChromeTabDef{
			ID:       id,
			PluginID: pluginID,
			Closable: true,
		},
	}
}

func (b *TabBuilder) Title(t string) *TabBuilder     { b.def.Title = t; return b }
func (b *TabBuilder) Icon(i string) *TabBuilder      { b.def.Icon = i; return b }
func (b *TabBuilder) Component(c string) *TabBuilder { b.def.Component = c; return b }
func (b *TabBuilder) Pattern(p string) *TabBuilder   { b.def.Pattern = p; return b }
func (b *TabBuilder) Closable(c bool) *TabBuilder    { b.def.Closable = c; return b }
func (b *TabBuilder) Priority(p int) *TabBuilder     { b.def.Priority = p; return b }

// Build returns the completed ChromeTabDef.
func (b *TabBuilder) Build() plugins.ChromeTabDef { return b.def }
