import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chrome } from '../__mocks__/chrome';
import { ThemeSyncService } from './ThemeSyncService';

vi.mock('@orchestra-mcp/theme', () => ({
  setColorTheme: vi.fn(),
  setComponentVariant: vi.fn(),
  getColorTheme: vi.fn(() => 'dracula'),
  initTheme: vi.fn(),
}));

import { setColorTheme, setComponentVariant } from '@orchestra-mcp/theme';

beforeEach(() => {
  chrome._resetAll();
  vi.clearAllMocks();
});

describe('ThemeSyncService.applyFromDesktop', () => {
  it('calls setColorTheme with the given themeId', () => {
    ThemeSyncService.applyFromDesktop({ themeId: 'dracula' });
    expect(setColorTheme).toHaveBeenCalledWith('dracula');
  });

  it('calls setComponentVariant when variant is provided', () => {
    ThemeSyncService.applyFromDesktop({ themeId: 'monokai', variant: 'compact' });
    expect(setColorTheme).toHaveBeenCalledWith('monokai');
    expect(setComponentVariant).toHaveBeenCalledWith('compact');
  });

  it('does not call setComponentVariant when variant is absent', () => {
    ThemeSyncService.applyFromDesktop({ themeId: 'nord' });
    expect(setComponentVariant).not.toHaveBeenCalled();
  });
});

describe('ThemeSyncService.persist', () => {
  it('stores themeId and variant in chrome.storage.local', async () => {
    await ThemeSyncService.persist('dracula', 'modern');

    const stored = chrome.storage.local._getData();
    expect(stored['orchestra_theme_state']).toMatchObject({
      themeId: 'dracula',
      variant: 'modern',
    });
    expect(typeof stored['orchestra_theme_state'].timestamp).toBe('number');
  });

  it('stores only themeId when variant is not provided', async () => {
    await ThemeSyncService.persist('nord');

    const stored = chrome.storage.local._getData();
    expect(stored['orchestra_theme_state'].themeId).toBe('nord');
    expect(stored['orchestra_theme_state'].variant).toBeUndefined();
  });
});

describe('ThemeSyncService.restore', () => {
  it('applies saved theme on restore', async () => {
    chrome.storage.local._setData({
      orchestra_theme_state: { themeId: 'monokai', variant: 'compact', timestamp: 1 },
    });

    await ThemeSyncService.restore();

    expect(setColorTheme).toHaveBeenCalledWith('monokai');
    expect(setComponentVariant).toHaveBeenCalledWith('compact');
  });

  it('applies only themeId when variant is not stored', async () => {
    chrome.storage.local._setData({
      orchestra_theme_state: { themeId: 'nord', timestamp: 1 },
    });

    await ThemeSyncService.restore();

    expect(setColorTheme).toHaveBeenCalledWith('nord');
    expect(setComponentVariant).not.toHaveBeenCalled();
  });

  it('is a no-op when no state is saved', async () => {
    await ThemeSyncService.restore();

    expect(setColorTheme).not.toHaveBeenCalled();
    expect(setComponentVariant).not.toHaveBeenCalled();
  });
});

describe('ThemeSyncService.requestFromDesktop', () => {
  it('sends a theme.request message to the service worker', () => {
    const sendMessageSpy = vi.spyOn(chrome.runtime, 'sendMessage');

    ThemeSyncService.requestFromDesktop();

    expect(sendMessageSpy).toHaveBeenCalledWith({ type: 'theme.request' });
  });
});
