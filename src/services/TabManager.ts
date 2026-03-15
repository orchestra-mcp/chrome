import type { ManagedTab } from '../types/tabs';

type ChangeCallback = () => void;

/**
 * Singleton manager for Chrome browser tabs managed by the extension.
 *
 * Tracks real Chrome tabs via chrome.tabs API. The service worker
 * listens to chrome.tabs events and pushes updates here. The side
 * panel UI subscribes via useSyncExternalStore.
 *
 * getSnapshot() returns a referentially-stable array that only
 * changes on mutation — required by useSyncExternalStore.
 */
class TabManager {
  private tabs: Map<number, ManagedTab> = new Map();
  private activeTabId: number | undefined = undefined;
  private listeners: Set<ChangeCallback> = new Set();
  private cachedTabs: ManagedTab[] = [];

  // ------------------------------------------------------------------
  // State updates (called by service worker messages)
  // ------------------------------------------------------------------

  /** Replace all managed tabs with a new snapshot from the service worker. */
  setTabs(tabs: ManagedTab[], activeTabId?: number): void {
    this.tabs.clear();
    for (const tab of tabs) {
      this.tabs.set(tab.chromeTabId, tab);
    }
    this.activeTabId = activeTabId;
    this.rebuildCache();
    this.notify();
  }

  /** Add or update a single managed tab. */
  upsertTab(tab: ManagedTab): void {
    this.tabs.set(tab.chromeTabId, tab);
    if (tab.active) {
      this.activeTabId = tab.chromeTabId;
    }
    this.rebuildCache();
    this.notify();
  }

  /** Remove a tab by Chrome tab ID. */
  removeTab(chromeTabId: number): void {
    this.tabs.delete(chromeTabId);
    this.rebuildCache();
    if (this.activeTabId === chromeTabId) {
      this.activeTabId = this.cachedTabs.length > 0
        ? this.cachedTabs[0]?.chromeTabId
        : undefined;
    }
    this.notify();
  }

  /** Mark a tab as active. */
  setActiveTab(chromeTabId: number): void {
    if (!this.tabs.has(chromeTabId)) return;
    this.activeTabId = chromeTabId;
    for (const [id, tab] of this.tabs) {
      this.tabs.set(id, { ...tab, active: id === chromeTabId });
    }
    this.rebuildCache();
    this.notify();
  }

  // ------------------------------------------------------------------
  // Commands (send to service worker via chrome.runtime.sendMessage)
  // ------------------------------------------------------------------

  /** Request the service worker to create a new Chrome tab. */
  requestCreate(url: string, pluginId: string): void {
    chrome.runtime?.sendMessage?.({
      type: 'tabs.create',
      payload: { url, pluginId },
    });
  }

  /** Request the service worker to close a Chrome tab. */
  requestClose(chromeTabId: number): void {
    chrome.runtime?.sendMessage?.({
      type: 'tabs.close',
      payload: { tabId: chromeTabId },
    });
  }

  /** Request the service worker to activate a Chrome tab. */
  requestActivate(chromeTabId: number): void {
    chrome.runtime?.sendMessage?.({
      type: 'tabs.activate',
      payload: { tabId: chromeTabId },
    });
  }

  /** Request the service worker to group tabs. */
  requestGroup(chromeTabIds: number[], groupName: string): void {
    chrome.runtime?.sendMessage?.({
      type: 'tabs.group',
      payload: { tabIds: chromeTabIds, groupName },
    });
  }

  /** Request the service worker to pin/unpin a tab. */
  requestPin(chromeTabId: number, pinned: boolean): void {
    chrome.runtime?.sendMessage?.({
      type: pinned ? 'tabs.pin' : 'tabs.unpin',
      payload: { tabId: chromeTabId },
    });
  }

  // ------------------------------------------------------------------
  // Reads
  // ------------------------------------------------------------------

  /** All managed tabs. */
  getTabs(): ManagedTab[] {
    return Array.from(this.tabs.values());
  }

  /** Get a single tab by Chrome tab ID. */
  getTab(chromeTabId: number): ManagedTab | undefined {
    return this.tabs.get(chromeTabId);
  }

  /** Currently active Chrome tab ID. */
  getActiveTabId(): number | undefined {
    return this.activeTabId;
  }

  /** Currently active managed tab. */
  getActiveTab(): ManagedTab | undefined {
    if (this.activeTabId === undefined) return undefined;
    return this.tabs.get(this.activeTabId);
  }

  /** Number of managed tabs. */
  count(): number {
    return this.tabs.size;
  }

  // ------------------------------------------------------------------
  // React integration (useSyncExternalStore)
  // ------------------------------------------------------------------

  /** Referentially-stable snapshot for useSyncExternalStore. */
  getSnapshot(): ManagedTab[] {
    return this.cachedTabs;
  }

  /** Subscribe to changes. Returns unsubscribe function. */
  onChange(callback: ChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /** Reset all state. */
  clear(): void {
    this.tabs.clear();
    this.activeTabId = undefined;
    this.rebuildCache();
    this.notify();
  }

  // ------------------------------------------------------------------
  // Internal
  // ------------------------------------------------------------------

  private rebuildCache(): void {
    this.cachedTabs = Array.from(this.tabs.values());
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb();
    }
  }
}

/** Singleton instance shared across the Chrome extension side panel. */
export const tabManager = new TabManager();
