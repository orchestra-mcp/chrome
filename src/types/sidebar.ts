/**
 * Sidebar types for Chrome extension side panel.
 * Matches Go backend structure + view-based architecture.
 */

/** Legacy sidebar entry from service worker */
export interface SidebarEntry {
  id: string;
  title: string;
  icon?: string;
  order: number;
  badge?: number;
  collapsible: boolean;
  sections?: SidebarEntry[];
  action?: string;
  plugin_id: string;
}

/** Legacy sidebar state */
export interface SidebarState {
  entries: SidebarEntry[];
  active?: string;
}

/** Legacy sidebar update message */
export interface SidebarUpdate {
  type: 'sidebar.update';
  payload: SidebarState;
}

/** An action button displayed in the view title bar */
export interface SidebarAction {
  id: string;
  icon: string;
  tooltip: string;
  action: string;
}

/** A registered sidebar view (icon nav + content panel) */
export interface SidebarView {
  id: string;
  title: string;
  icon: string;
  order: number;
  visible: boolean;
  badge?: string;
  actions: SidebarAction[];
  hasSearch: boolean;
}

/** Message types the sidebar listens for */
export type SidebarMessage =
  | { type: 'sidebar.update'; payload: SidebarState }
  | { type: 'desktop.connected' }
  | { type: 'desktop.disconnected' }
  | { type: 'theme.change'; payload: Record<string, string> };
