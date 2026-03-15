/**
 * Tab types for Chrome browser tab management.
 * The extension manages real Chrome browser tabs via chrome.tabs API.
 * Plugins request tab operations; the service worker executes them.
 */

/** A Chrome browser tab managed by the extension. */
export interface ManagedTab {
  chromeTabId: number;
  url: string;
  title: string;
  favIconUrl?: string;
  groupId?: number;
  groupName?: string;
  pluginId: string;
  pinned: boolean;
  active: boolean;
}

/** Command sent from side panel to service worker. */
export interface TabCommand {
  type:
    | 'tabs.create'
    | 'tabs.close'
    | 'tabs.activate'
    | 'tabs.group'
    | 'tabs.ungroup'
    | 'tabs.pin'
    | 'tabs.unpin';
  payload: TabCommandPayload;
}

export interface TabCommandPayload {
  url?: string;
  title?: string;
  tabId?: number;
  tabIds?: number[];
  groupName?: string;
  pluginId?: string;
  pinned?: boolean;
}

/** Event from service worker to side panel when tab state changes. */
export interface TabEvent {
  type: 'tabs.update';
  tabs: ManagedTab[];
  activeTabId?: number;
}

/** Full tab state sent from Go backend via WebSocket. */
export interface TabState {
  tabs: ManagedTab[];
  activeTabId?: number;
}
