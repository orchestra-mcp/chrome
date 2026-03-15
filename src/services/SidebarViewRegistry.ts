import type { SidebarView } from '../types/sidebar';
import { DEFAULT_VIEWS } from '../Sidebar/defaultViews';

type ChangeCallback = () => void;

/**
 * Singleton registry for sidebar views in the Chrome extension.
 *
 * Plugins register views at startup; the sidebar reads them reactively
 * via useSyncExternalStore through the onChange subscription.
 *
 * The `getSnapshot()` method returns a cached, referentially-stable
 * array that only changes when the registry is mutated. This is
 * required by React's useSyncExternalStore to avoid infinite loops.
 */
class SidebarViewRegistry {
  private views: Map<string, SidebarView> = new Map();
  private listeners: Set<ChangeCallback> = new Set();
  private cachedVisible: SidebarView[] = [];

  constructor() {
    for (const view of DEFAULT_VIEWS) {
      this.views.set(view.id, view);
    }
    this.rebuildCache();
  }

  /** Register a sidebar view. Warns on duplicate without overwriting. */
  register(view: SidebarView): void {
    if (this.views.has(view.id)) {
      console.warn(`[SidebarViewRegistry] View already registered: ${view.id}`);
      return;
    }
    this.views.set(view.id, view);
    this.rebuildCache();
    this.notify();
  }

  /** Remove a view by id. */
  unregister(id: string): void {
    if (this.views.delete(id)) {
      this.rebuildCache();
      this.notify();
    }
  }

  /** Look up a view by id. */
  get(id: string): SidebarView | undefined {
    return this.views.get(id);
  }

  /** All registered views sorted by order. */
  getAll(): SidebarView[] {
    return Array.from(this.views.values()).sort((a, b) => a.order - b.order);
  }

  /** Visible views only, sorted by order. */
  getVisible(): SidebarView[] {
    return this.cachedVisible;
  }

  /** Check whether a view is registered. */
  has(id: string): boolean {
    return this.views.has(id);
  }

  /** Remove all registered views. */
  clear(): void {
    this.views.clear();
    this.rebuildCache();
    this.notify();
  }

  /** Number of registered views. */
  count(): number {
    return this.views.size;
  }

  /** Update (or clear) the badge on an existing view. */
  updateBadge(id: string, badge: string | undefined): void {
    const view = this.views.get(id);
    if (!view) return;
    this.views.set(id, { ...view, badge });
    this.rebuildCache();
    this.notify();
  }

  /**
   * Subscribe to any change in the registry.
   * Returns an unsubscribe function.
   * Compatible with React useSyncExternalStore.
   */
  onChange(callback: ChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Return a referentially-stable snapshot of visible views.
   * Only changes when the registry is mutated.
   */
  getSnapshot(): SidebarView[] {
    return this.cachedVisible;
  }

  // ------------------------------------------------------------------
  // Internal
  // ------------------------------------------------------------------

  /** Rebuild the cached visible-views array. */
  private rebuildCache(): void {
    this.cachedVisible = Array.from(this.views.values())
      .filter((v) => v.visible)
      .sort((a, b) => a.order - b.order);
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb();
    }
  }
}

/** Singleton instance shared across the Chrome extension side panel. */
export const sidebarViewRegistry = new SidebarViewRegistry();
