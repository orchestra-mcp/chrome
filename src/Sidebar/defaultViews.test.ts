import { DEFAULT_VIEWS } from './defaultViews';

describe('DEFAULT_VIEWS', () => {
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_VIEWS)).toBe(true);
  });

  it('has five views', () => {
    expect(DEFAULT_VIEWS).toHaveLength(5);
  });

  it('every view has required fields: id, title, icon, order, visible', () => {
    for (const view of DEFAULT_VIEWS) {
      expect(view).toHaveProperty('id');
      expect(view).toHaveProperty('title');
      expect(view).toHaveProperty('icon');
      expect(typeof view.order).toBe('number');
      expect(typeof view.visible).toBe('boolean');
    }
  });

  it('every view has an actions array', () => {
    for (const view of DEFAULT_VIEWS) {
      expect(Array.isArray(view.actions)).toBe(true);
    }
  });

  it('every view has a hasSearch boolean', () => {
    for (const view of DEFAULT_VIEWS) {
      expect(typeof view.hasSearch).toBe('boolean');
    }
  });

  it('includes the explorer view', () => {
    const explorer = DEFAULT_VIEWS.find((v) => v.id === 'explorer');
    expect(explorer).toBeDefined();
    expect(explorer?.title).toBe('Explorer');
    expect(explorer?.hasSearch).toBe(true);
  });

  it('includes the search view', () => {
    const search = DEFAULT_VIEWS.find((v) => v.id === 'search');
    expect(search).toBeDefined();
    expect(search?.title).toBe('Search');
  });

  it('includes the extensions view', () => {
    const extensions = DEFAULT_VIEWS.find((v) => v.id === 'extensions');
    expect(extensions).toBeDefined();
    expect(extensions?.title).toBe('Extensions');
  });

  it('includes the settings view', () => {
    const settings = DEFAULT_VIEWS.find((v) => v.id === 'settings');
    expect(settings).toBeDefined();
    expect(settings?.title).toBe('Settings');
    expect(settings?.order).toBe(99);
  });

  it('explorer view has action buttons', () => {
    const explorer = DEFAULT_VIEWS.find((v) => v.id === 'explorer');
    expect(explorer?.actions.length).toBeGreaterThan(0);
  });

  it('action buttons have id, icon, tooltip, and action fields', () => {
    const explorer = DEFAULT_VIEWS.find((v) => v.id === 'explorer');
    for (const action of explorer?.actions ?? []) {
      expect(action).toHaveProperty('id');
      expect(action).toHaveProperty('icon');
      expect(action).toHaveProperty('tooltip');
      expect(action).toHaveProperty('action');
    }
  });

  it('all views are visible by default', () => {
    for (const view of DEFAULT_VIEWS) {
      expect(view.visible).toBe(true);
    }
  });

  it('views are ordered by order field (explorer first)', () => {
    const sorted = [...DEFAULT_VIEWS].sort((a, b) => a.order - b.order);
    expect(sorted[0].id).toBe('explorer');
  });
});
