"use client";

import { useCallback, useSyncExternalStore } from 'react';
import type { ManagedTab } from '../types/tabs';
import { tabManager } from '../services/TabManager';

export interface UseTabManagerReturn {
  /** All managed Chrome browser tabs. */
  tabs: ManagedTab[];
  /** Currently active Chrome tab ID. */
  activeTabId: number | undefined;
  /** Currently active managed tab. */
  activeTab: ManagedTab | undefined;
  /** Request creating a new Chrome tab. */
  createTab: (url: string, pluginId: string) => void;
  /** Request closing a Chrome tab. */
  closeTab: (chromeTabId: number) => void;
  /** Request activating a Chrome tab. */
  activateTab: (chromeTabId: number) => void;
  /** Request grouping Chrome tabs. */
  groupTabs: (chromeTabIds: number[], groupName: string) => void;
  /** Request pinning/unpinning a Chrome tab. */
  pinTab: (chromeTabId: number, pinned: boolean) => void;
}

// ---------------------------------------------------------------
// External store bindings for useSyncExternalStore
// ---------------------------------------------------------------

const subscribeTabs = (callback: () => void): (() => void) => {
  return tabManager.onChange(callback);
};

const getTabsSnapshot = (): ManagedTab[] => {
  return tabManager.getSnapshot();
};

const getTabsServerSnapshot = (): ManagedTab[] => {
  return tabManager.getSnapshot();
};

// ---------------------------------------------------------------
// Exported helper to reset state between tests
// ---------------------------------------------------------------

export function _resetTabManager(): void {
  tabManager.clear();
}

// ---------------------------------------------------------------
// Hook
// ---------------------------------------------------------------

/**
 * React hook for managing Chrome browser tabs.
 *
 * Uses useSyncExternalStore for React 19 concurrent rendering.
 * Commands are sent to the service worker via chrome.runtime.sendMessage.
 */
export function useTabManager(): UseTabManagerReturn {
  const tabs = useSyncExternalStore(
    subscribeTabs,
    getTabsSnapshot,
    getTabsServerSnapshot,
  );

  const activeTabId = tabManager.getActiveTabId();
  const activeTab = tabManager.getActiveTab();

  const createTab = useCallback((url: string, pluginId: string) => {
    tabManager.requestCreate(url, pluginId);
  }, []);

  const closeTab = useCallback((chromeTabId: number) => {
    tabManager.requestClose(chromeTabId);
  }, []);

  const activateTab = useCallback((chromeTabId: number) => {
    tabManager.requestActivate(chromeTabId);
  }, []);

  const groupTabs = useCallback((chromeTabIds: number[], groupName: string) => {
    tabManager.requestGroup(chromeTabIds, groupName);
  }, []);

  const pinTab = useCallback((chromeTabId: number, pinned: boolean) => {
    tabManager.requestPin(chromeTabId, pinned);
  }, []);

  return { tabs, activeTabId, activeTab, createTab, closeTab, activateTab, groupTabs, pinTab };
}
