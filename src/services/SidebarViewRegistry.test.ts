import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sidebarViewRegistry } from './SidebarViewRegistry';
import { DEFAULT_VIEWS } from '../Sidebar/defaultViews';
import type { SidebarView } from '../types/sidebar';

function makeView(overrides: Partial<SidebarView> = {}): SidebarView {
  return {
    id: 'custom-view',
    title: 'Custom',
    icon: 'bx-star',
    order: 50,
    visible: true,
    badge: undefined,
    actions: [],
    hasSearch: false,
    ...overrides,
  };
}

describe('SidebarViewRegistry', () => {
  beforeEach(() => {
    // Reset to default views before each test
    sidebarViewRegistry.clear();
    for (const view of DEFAULT_VIEWS) {
      sidebarViewRegistry.register(view);
    }
  });

  // ------------------------------------------------------------------
  // Default views pre-loaded
  // ------------------------------------------------------------------

  it('should have default views pre-loaded', () => {
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length);
    for (const view of DEFAULT_VIEWS) {
      expect(sidebarViewRegistry.has(view.id)).toBe(true);
    }
  });

  it('should return default views sorted by order', () => {
    const all = sidebarViewRegistry.getAll();
    for (let i = 1; i < all.length; i++) {
      expect(all[i].order).toBeGreaterThanOrEqual(all[i - 1].order);
    }
  });

  // ------------------------------------------------------------------
  // register
  // ------------------------------------------------------------------

  it('should register a new view', () => {
    const view = makeView();
    sidebarViewRegistry.register(view);
    expect(sidebarViewRegistry.has('custom-view')).toBe(true);
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length + 1);
  });

  it('should warn and not overwrite on duplicate register', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 'explorer' already exists from DEFAULT_VIEWS
    const duplicate = makeView({ id: 'explorer', title: 'Overwritten' });
    sidebarViewRegistry.register(duplicate);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('explorer'),
    );
    expect(sidebarViewRegistry.get('explorer')?.title).toBe('Explorer');
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length);

    warnSpy.mockRestore();
  });

  // ------------------------------------------------------------------
  // unregister
  // ------------------------------------------------------------------

  it('should unregister a view', () => {
    sidebarViewRegistry.unregister('explorer');
    expect(sidebarViewRegistry.has('explorer')).toBe(false);
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length - 1);
  });

  it('should no-op when unregistering a non-existent view', () => {
    const countBefore = sidebarViewRegistry.count();
    sidebarViewRegistry.unregister('nonexistent');
    expect(sidebarViewRegistry.count()).toBe(countBefore);
  });

  // ------------------------------------------------------------------
  // get / has
  // ------------------------------------------------------------------

  it('should get a view by id', () => {
    const view = sidebarViewRegistry.get('explorer');
    expect(view).toBeDefined();
    expect(view?.title).toBe('Explorer');
  });

  it('should return undefined for a missing id', () => {
    expect(sidebarViewRegistry.get('nonexistent')).toBeUndefined();
  });

  it('should return correct has result', () => {
    expect(sidebarViewRegistry.has('explorer')).toBe(true);
    expect(sidebarViewRegistry.has('nonexistent')).toBe(false);
  });

  // ------------------------------------------------------------------
  // getAll / getVisible
  // ------------------------------------------------------------------

  it('should return all views sorted by order', () => {
    sidebarViewRegistry.register(makeView({ id: 'z-last', order: 999 }));
    sidebarViewRegistry.register(makeView({ id: 'a-first', order: 0 }));

    const all = sidebarViewRegistry.getAll();
    expect(all[0].id).toBe('a-first');
    expect(all[all.length - 1].id).toBe('z-last');
  });

  it('should return only visible views from getVisible', () => {
    sidebarViewRegistry.register(
      makeView({ id: 'hidden', visible: false, order: 5 }),
    );

    const visible = sidebarViewRegistry.getVisible();
    expect(visible.every((v) => v.visible)).toBe(true);
    expect(visible.find((v) => v.id === 'hidden')).toBeUndefined();
  });

  // ------------------------------------------------------------------
  // clear / count
  // ------------------------------------------------------------------

  it('should clear all views', () => {
    sidebarViewRegistry.clear();
    expect(sidebarViewRegistry.count()).toBe(0);
    expect(sidebarViewRegistry.getAll()).toHaveLength(0);
  });

  it('should return correct count', () => {
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length);
    sidebarViewRegistry.register(makeView());
    expect(sidebarViewRegistry.count()).toBe(DEFAULT_VIEWS.length + 1);
  });

  // ------------------------------------------------------------------
  // updateBadge
  // ------------------------------------------------------------------

  it('should update badge on an existing view', () => {
    sidebarViewRegistry.updateBadge('explorer', '5');
    expect(sidebarViewRegistry.get('explorer')?.badge).toBe('5');
  });

  it('should clear badge when set to undefined', () => {
    sidebarViewRegistry.updateBadge('explorer', '5');
    sidebarViewRegistry.updateBadge('explorer', undefined);
    expect(sidebarViewRegistry.get('explorer')?.badge).toBeUndefined();
  });

  it('should no-op when updating badge on nonexistent view', () => {
    // Should not throw
    sidebarViewRegistry.updateBadge('nonexistent', '1');
    expect(sidebarViewRegistry.has('nonexistent')).toBe(false);
  });

  // ------------------------------------------------------------------
  // onChange
  // ------------------------------------------------------------------

  it('should fire onChange on register', () => {
    const callback = vi.fn();
    const unsub = sidebarViewRegistry.onChange(callback);

    sidebarViewRegistry.register(makeView());
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should fire onChange on unregister', () => {
    const callback = vi.fn();
    const unsub = sidebarViewRegistry.onChange(callback);

    sidebarViewRegistry.unregister('explorer');
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should fire onChange on updateBadge', () => {
    const callback = vi.fn();
    const unsub = sidebarViewRegistry.onChange(callback);

    sidebarViewRegistry.updateBadge('explorer', '3');
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should fire onChange on clear', () => {
    const callback = vi.fn();
    const unsub = sidebarViewRegistry.onChange(callback);

    sidebarViewRegistry.clear();
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('should not fire onChange after unsubscribing', () => {
    const callback = vi.fn();
    const unsub = sidebarViewRegistry.onChange(callback);
    unsub();

    sidebarViewRegistry.register(makeView());
    expect(callback).not.toHaveBeenCalled();
  });

  it('should support multiple onChange listeners', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const unsub1 = sidebarViewRegistry.onChange(cb1);
    const unsub2 = sidebarViewRegistry.onChange(cb2);

    sidebarViewRegistry.register(makeView());
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });

  // ------------------------------------------------------------------
  // getSnapshot
  // ------------------------------------------------------------------

  it('should return visible views from getSnapshot', () => {
    const snapshot = sidebarViewRegistry.getSnapshot();
    expect(snapshot).toEqual(sidebarViewRegistry.getVisible());
  });
});
