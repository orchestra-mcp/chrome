"use client";

import { useCallback, useSyncExternalStore } from 'react';
import type { SidebarView } from '../types/sidebar';
import { sidebarViewRegistry } from '../services/SidebarViewRegistry';

export interface UseSidebarViewsReturn {
  /** All visible views sorted by order. */
  views: SidebarView[];
  /** The id of the currently active view. */
  activeId: string;
  /** Switch to a different view. Also notifies the service worker. */
  setActive: (id: string) => void;
  /** The full SidebarView object for the active id (if it exists). */
  activeView: SidebarView | undefined;
}

// ---------------------------------------------------------------
// Views external store  (delegates to SidebarViewRegistry)
// ---------------------------------------------------------------

const subscribeViews = (callback: () => void): (() => void) => {
  return sidebarViewRegistry.onChange(callback);
};

const getViewsSnapshot = (): SidebarView[] => {
  return sidebarViewRegistry.getVisible();
};

const getViewsServerSnapshot = (): SidebarView[] => {
  return sidebarViewRegistry.getVisible();
};

// ---------------------------------------------------------------
// Active-id external store
//
// A tiny standalone store so that setActive triggers a React
// re-render without mutating the view registry.
// ---------------------------------------------------------------

let activeIdValue: string | null = null;
const activeIdListeners = new Set<() => void>();

function setActiveIdValue(id: string): void {
  activeIdValue = id;
  for (const cb of activeIdListeners) {
    cb();
  }
}

function subscribeActiveId(callback: () => void): () => void {
  activeIdListeners.add(callback);
  return () => {
    activeIdListeners.delete(callback);
  };
}

function getActiveIdSnapshot(): string | null {
  return activeIdValue;
}

function getActiveIdServerSnapshot(): string | null {
  return activeIdValue;
}

// ---------------------------------------------------------------
// Exported helper to reset state between tests
// ---------------------------------------------------------------

export function _resetActiveId(): void {
  activeIdValue = null;
  activeIdListeners.clear();
}

// ---------------------------------------------------------------
// Hook
// ---------------------------------------------------------------

/**
 * React hook that exposes sidebar views from the SidebarViewRegistry
 * and tracks which view is currently active.
 *
 * Uses useSyncExternalStore for React 19 compatibility with
 * concurrent rendering.
 */
export function useSidebarViews(): UseSidebarViewsReturn {
  const views = useSyncExternalStore(
    subscribeViews,
    getViewsSnapshot,
    getViewsServerSnapshot,
  );

  const rawActiveId = useSyncExternalStore(
    subscribeActiveId,
    getActiveIdSnapshot,
    getActiveIdServerSnapshot,
  );

  // Resolve: use stored id if still visible, otherwise first visible view.
  let activeId: string;
  if (rawActiveId !== null && views.some((v) => v.id === rawActiveId)) {
    activeId = rawActiveId;
  } else {
    activeId = views.length > 0 ? views[0].id : '';
  }

  const setActive = useCallback((id: string) => {
    setActiveIdValue(id);

    // Notify the Chrome extension service worker.
    // Optional chaining handles Storybook / non-extension contexts.
    chrome.runtime?.sendMessage?.({
      type: 'sidebar.setActive',
      payload: { viewId: id },
    });
  }, []);

  const activeView = views.find((v) => v.id === activeId);

  return { views, activeId, setActive, activeView };
}
