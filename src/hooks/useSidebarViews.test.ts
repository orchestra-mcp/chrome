import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarViews, _resetActiveId } from './useSidebarViews';
import { sidebarViewRegistry } from '../services/SidebarViewRegistry';
import { DEFAULT_VIEWS } from '../Sidebar/defaultViews';

// Mock chrome.runtime.sendMessage globally
const mockSendMessage = vi.fn();
(globalThis as any).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
};

describe('useSidebarViews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetActiveId();

    // Reset registry to default views
    sidebarViewRegistry.clear();
    for (const view of DEFAULT_VIEWS) {
      sidebarViewRegistry.register(view);
    }
  });

  it('should return default views on mount', () => {
    const { result } = renderHook(() => useSidebarViews());

    expect(result.current.views.length).toBe(
      DEFAULT_VIEWS.filter((v) => v.visible).length,
    );
    for (const view of result.current.views) {
      expect(view.visible).toBe(true);
    }
  });

  it('should default activeId to first visible view', () => {
    const { result } = renderHook(() => useSidebarViews());

    const sortedVisible = DEFAULT_VIEWS
      .filter((v) => v.visible)
      .sort((a, b) => a.order - b.order);

    expect(result.current.activeId).toBe(sortedVisible[0].id);
  });

  it('should change activeId when setActive is called', () => {
    const { result } = renderHook(() => useSidebarViews());

    act(() => {
      result.current.setActive('search');
    });

    expect(result.current.activeId).toBe('search');
  });

  it('should return matching activeView', () => {
    const { result } = renderHook(() => useSidebarViews());

    act(() => {
      result.current.setActive('extensions');
    });

    expect(result.current.activeView).toBeDefined();
    expect(result.current.activeView?.id).toBe('extensions');
    expect(result.current.activeView?.title).toBe('Extensions');
  });

  it('should send chrome.runtime message on setActive', () => {
    const { result } = renderHook(() => useSidebarViews());

    act(() => {
      result.current.setActive('search');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'sidebar.setActive',
      payload: { viewId: 'search' },
    });
  });

  it('should fall back to first view when active id is removed', () => {
    const { result } = renderHook(() => useSidebarViews());

    act(() => {
      result.current.setActive('explorer');
    });

    expect(result.current.activeId).toBe('explorer');

    act(() => {
      sidebarViewRegistry.unregister('explorer');
    });

    // Should fall back to the first visible view after explorer is removed
    const remaining = DEFAULT_VIEWS
      .filter((v) => v.visible && v.id !== 'explorer')
      .sort((a, b) => a.order - b.order);

    expect(result.current.activeId).toBe(remaining[0].id);
  });

  it('should react to new views being registered', () => {
    const { result } = renderHook(() => useSidebarViews());

    const initialCount = result.current.views.length;

    act(() => {
      sidebarViewRegistry.register({
        id: 'git',
        title: 'Source Control',
        icon: 'bx-git-branch',
        order: 4,
        visible: true,
        actions: [],
        hasSearch: false,
      });
    });

    expect(result.current.views.length).toBe(initialCount + 1);
    expect(result.current.views.find((v) => v.id === 'git')).toBeDefined();
  });

  it('should return empty activeId when no views exist', () => {
    act(() => {
      sidebarViewRegistry.clear();
    });

    const { result } = renderHook(() => useSidebarViews());

    expect(result.current.activeId).toBe('');
    expect(result.current.activeView).toBeUndefined();
  });

  it('should return views sorted by order', () => {
    const { result } = renderHook(() => useSidebarViews());

    const orders = result.current.views.map((v) => v.order);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1]);
    }
  });
});
