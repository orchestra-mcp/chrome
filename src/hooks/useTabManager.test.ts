import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabManager, _resetTabManager } from './useTabManager';
import { tabManager } from '../services/TabManager';
import type { ManagedTab } from '../types/tabs';

// Mock chrome.runtime.sendMessage globally
const mockSendMessage = vi.fn();
(globalThis as any).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
};

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

describe('useTabManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetTabManager();
  });

  it('should return empty tabs on mount', () => {
    const { result } = renderHook(() => useTabManager());

    expect(result.current.tabs).toHaveLength(0);
    expect(result.current.activeTabId).toBeUndefined();
    expect(result.current.activeTab).toBeUndefined();
  });

  it('should reflect tabs after setTabs', () => {
    tabManager.setTabs([
      makeTab({ chromeTabId: 1, active: true }),
      makeTab({ chromeTabId: 2, url: 'https://test.com' }),
    ], 1);

    const { result } = renderHook(() => useTabManager());
    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.activeTabId).toBe(1);
  });

  it('should send chrome.runtime message on createTab', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.createTab('https://test.com', 'my-plugin');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.create',
      payload: { url: 'https://test.com', pluginId: 'my-plugin' },
    });
  });

  it('should send chrome.runtime message on closeTab', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.closeTab(42);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.close',
      payload: { tabId: 42 },
    });
  });

  it('should send chrome.runtime message on activateTab', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.activateTab(7);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.activate',
      payload: { tabId: 7 },
    });
  });

  it('should send chrome.runtime message on groupTabs', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.groupTabs([1, 2, 3], 'Dev');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.group',
      payload: { tabIds: [1, 2, 3], groupName: 'Dev' },
    });
  });

  it('should send tabs.pin on pinTab(true)', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.pinTab(5, true);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.pin',
      payload: { tabId: 5 },
    });
  });

  it('should send tabs.unpin on pinTab(false)', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.pinTab(5, false);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'tabs.unpin',
      payload: { tabId: 5 },
    });
  });

  it('should react to external tabManager mutations', () => {
    const { result } = renderHook(() => useTabManager());

    expect(result.current.tabs).toHaveLength(0);

    act(() => {
      tabManager.upsertTab(makeTab({ chromeTabId: 1 }));
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].url).toBe('https://example.com');
  });

  it('should return activeTab when available', () => {
    tabManager.upsertTab(makeTab({ chromeTabId: 1, active: true }));

    const { result } = renderHook(() => useTabManager());
    expect(result.current.activeTab?.chromeTabId).toBe(1);
  });
});
