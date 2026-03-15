import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tabManager } from './TabManager';
import type { ManagedTab } from '../types/tabs';

function makeTab(overrides: Partial<ManagedTab> = {}): ManagedTab {
  return {
    chromeTabId: 1,
    url: 'https://example.com',
    title: 'Example',
    pluginId: 'core',
    pinned: false,
    active: false,
    ...overrides,
  };
}

describe('TabManager', () => {
  beforeEach(() => {
    tabManager.clear();
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // setTabs
  // ------------------------------------------------------------------

  it('should replace all tabs with setTabs', () => {
    tabManager.setTabs([
      makeTab({ chromeTabId: 1 }),
      makeTab({ chromeTabId: 2, url: 'https://test.com' }),
    ], 1);

    expect(tabManager.getTabs()).toHaveLength(2);
    expect(tabManager.getActiveTabId()).toBe(1);
  });

  it('should clear previous tabs on setTabs', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 99 }));
    tabManager.setTabs([makeTab({ chromeTabId: 1 })]);

    expect(tabManager.getTabs()).toHaveLength(1);
    expect(tabManager.getTab(99)).toBeUndefined();
  });

  // ------------------------------------------------------------------
  // upsertTab
  // ------------------------------------------------------------------

  it('should add a new tab with upsertTab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    expect(tabManager.getTabs()).toHaveLength(1);
    expect(tabManager.getTab(1)?.url).toBe('https://example.com');
  });

  it('should update an existing tab with upsertTab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, title: 'Old' }));
    tabManager.upsertTab(makeTab({ chromeTabId: 1, title: 'New' }));

    expect(tabManager.getTabs()).toHaveLength(1);
    expect(tabManager.getTab(1)?.title).toBe('New');
  });

  it('should set activeTabId when upserting an active tab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    expect(tabManager.getActiveTabId()).toBe(1);
  });

  // ------------------------------------------------------------------
  // removeTab
  // ------------------------------------------------------------------

  it('should remove a tab by Chrome tab ID', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    tabManager.removeTab(1);
    expect(tabManager.getTabs()).toHaveLength(0);
  });

  it('should clear activeTabId when active tab is removed', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    tabManager.removeTab(1);
    expect(tabManager.getActiveTabId()).toBeUndefined();
  });

  it('should no-op when removing a non-existent tab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    tabManager.removeTab(999);
    expect(tabManager.getTabs()).toHaveLength(1);
  });

  // ------------------------------------------------------------------
  // setActiveTab
  // ------------------------------------------------------------------

  it('should activate a tab and update active flags', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    tabManager.upsertTab(makeTab({ chromeTabId: 2 }));

    tabManager.setActiveTab(2);

    expect(tabManager.getActiveTabId()).toBe(2);
    expect(tabManager.getTab(1)?.active).toBe(false);
    expect(tabManager.getTab(2)?.active).toBe(true);
  });

  it('should no-op when activating a non-existent tab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    tabManager.setActiveTab(999);
    expect(tabManager.getActiveTabId()).toBe(1);
  });

  // ------------------------------------------------------------------
  // requestCreate / requestClose / requestActivate
  // ------------------------------------------------------------------

  it('should send chrome.runtime message on requestCreate', () => {
    const spy = vi.fn();
    (globalThis as any).chrome = { runtime: { sendMessage: spy } };

    tabManager.requestCreate('https://test.com', 'my-plugin');

    expect(spy).toHaveBeenCalledWith({
      type: 'tabs.create',
      payload: { url: 'https://test.com', pluginId: 'my-plugin' },
    });
  });

  it('should send chrome.runtime message on requestClose', () => {
    const spy = vi.fn();
    (globalThis as any).chrome = { runtime: { sendMessage: spy } };

    tabManager.requestClose(42);

    expect(spy).toHaveBeenCalledWith({
      type: 'tabs.close',
      payload: { tabId: 42 },
    });
  });

  it('should send chrome.runtime message on requestActivate', () => {
    const spy = vi.fn();
    (globalThis as any).chrome = { runtime: { sendMessage: spy } };

    tabManager.requestActivate(7);

    expect(spy).toHaveBeenCalledWith({
      type: 'tabs.activate',
      payload: { tabId: 7 },
    });
  });

  it('should send tabs.pin on requestPin(true)', () => {
    const spy = vi.fn();
    (globalThis as any).chrome = { runtime: { sendMessage: spy } };

    tabManager.requestPin(5, true);

    expect(spy).toHaveBeenCalledWith({
      type: 'tabs.pin',
      payload: { tabId: 5 },
    });
  });

  it('should send tabs.unpin on requestPin(false)', () => {
    const spy = vi.fn();
    (globalThis as any).chrome = { runtime: { sendMessage: spy } };

    tabManager.requestPin(5, false);

    expect(spy).toHaveBeenCalledWith({
      type: 'tabs.unpin',
      payload: { tabId: 5 },
    });
  });

  // ------------------------------------------------------------------
  // getSnapshot stability
  // ------------------------------------------------------------------

  it('should return the same reference from getSnapshot when nothing changes', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));

    const snap1 = tabManager.getSnapshot();
    const snap2 = tabManager.getSnapshot();
    expect(snap1).toBe(snap2);
  });

  it('should return a new reference from getSnapshot after mutation', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    const snap1 = tabManager.getSnapshot();

    tabManager.upsertTab(makeTab({ chromeTabId: 2 }));
    const snap2 = tabManager.getSnapshot();

    expect(snap1).not.toBe(snap2);
  });

  // ------------------------------------------------------------------
  // onChange
  // ------------------------------------------------------------------

  it('should fire onChange on upsertTab', () => {
    const callback = vi.fn();
    const unsub = tabManager.onChange(callback);

    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should fire onChange on removeTab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));

    const callback = vi.fn();
    const unsub = tabManager.onChange(callback);

    tabManager.removeTab(1);
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should not fire onChange after unsubscribing', () => {
    const callback = vi.fn();
    const unsub = tabManager.onChange(callback);
    unsub();

    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    expect(callback).not.toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // getActiveTab
  // ------------------------------------------------------------------

  it('should return active tab', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    expect(tabManager.getActiveTab()?.chromeTabId).toBe(1);
  });

  it('should return undefined when no active tab', () => {
    expect(tabManager.getActiveTab()).toBeUndefined();
  });

  // ------------------------------------------------------------------
  // count
  // ------------------------------------------------------------------

  it('should return correct count', () => {
    expect(tabManager.count()).toBe(0);
    tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    tabManager.upsertTab(makeTab({ chromeTabId: 2 }));
    expect(tabManager.count()).toBe(2);
  });

  // ------------------------------------------------------------------
  // clear
  // ------------------------------------------------------------------

  it('should clear all tabs and activeTabId', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));
    tabManager.upsertTab(makeTab({ chromeTabId: 2 }));

    tabManager.clear();

    expect(tabManager.getTabs()).toHaveLength(0);
    expect(tabManager.getActiveTabId()).toBeUndefined();
    expect(tabManager.getSnapshot()).toHaveLength(0);
    expect(tabManager.count()).toBe(0);
  });
});
