import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { chrome } from '../__mocks__/chrome';

vi.mock('@orchestra-mcp/theme', () => ({
  setColorTheme: vi.fn(),
  setComponentVariant: vi.fn(),
  getColorTheme: vi.fn(() => 'default'),
  initTheme: vi.fn(),
}));

vi.mock('../services/ThemeSyncService', () => ({
  ThemeSyncService: {
    restore: vi.fn(() => Promise.resolve()),
    requestFromDesktop: vi.fn(),
    applyFromDesktop: vi.fn(),
  },
}));

import { useDesktopConnection } from './useDesktopConnection';
import { ThemeSyncService } from '../services/ThemeSyncService';

beforeEach(() => {
  chrome._resetAll();
  vi.clearAllMocks();
});

describe('useDesktopConnection', () => {
  it('initial state is disconnected', () => {
    const { result } = renderHook(() => useDesktopConnection());
    expect(result.current.connected).toBe(false);
  });

  it('restores theme on mount', async () => {
    renderHook(() => useDesktopConnection());
    await waitFor(() => {
      expect(ThemeSyncService.restore).toHaveBeenCalledOnce();
    });
  });

  it('checks connection status on mount', async () => {
    const sendMessageSpy = vi.spyOn(chrome.runtime, 'sendMessage');
    renderHook(() => useDesktopConnection());
    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalledWith({ type: 'desktop.status' }, expect.any(Function));
    });
  });

  it('sets connected=true when desktop.status returns connected', async () => {
    vi.spyOn(chrome.runtime, 'sendMessage').mockImplementation(
      (msg: any, cb?: (res: any) => void) => {
        if (msg?.type === 'desktop.status') {
          setTimeout(() => cb?.({ connected: true }), 0);
        }
        return Promise.resolve({ connected: true });
      },
    );

    const { result } = renderHook(() => useDesktopConnection());
    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });
  });

  it('handles desktop.connected message', async () => {
    const { result } = renderHook(() => useDesktopConnection());

    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'desktop.connected' },
        {},
        vi.fn(),
      );
    });

    expect(result.current.connected).toBe(true);
    expect(ThemeSyncService.requestFromDesktop).toHaveBeenCalled();
  });

  it('handles desktop.disconnected message', async () => {
    const { result } = renderHook(() => useDesktopConnection());

    // First connect
    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'desktop.connected' },
        {},
        vi.fn(),
      );
    });
    expect(result.current.connected).toBe(true);

    // Then disconnect
    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'desktop.disconnected' },
        {},
        vi.fn(),
      );
    });
    expect(result.current.connected).toBe(false);
  });

  it('handles theme.change message', async () => {
    const { result } = renderHook(() => useDesktopConnection());

    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'theme.change', payload: { themeId: 'dracula', variant: 'compact' } },
        {},
        vi.fn(),
      );
    });

    expect(ThemeSyncService.applyFromDesktop).toHaveBeenCalledWith({
      themeId: 'dracula',
      variant: 'compact',
    });
    expect(result.current.themeId).toBe('dracula');
  });

  it('handles theme.update message', async () => {
    const { result } = renderHook(() => useDesktopConnection());

    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'theme.update', payload: { themeId: 'matrix', variant: 'modern' } },
        {},
        vi.fn(),
      );
    });

    expect(ThemeSyncService.applyFromDesktop).toHaveBeenCalledWith({
      themeId: 'matrix',
      variant: 'modern',
    });
    expect(result.current.themeId).toBe('matrix');
  });

  it('uses fallback themeId when theme.update payload has no themeId', async () => {
    const { result } = renderHook(() => useDesktopConnection());

    act(() => {
      chrome.runtime.onMessage._trigger(
        { type: 'theme.update', payload: { variant: 'compact' } },
        {},
        vi.fn(),
      );
    });

    expect(ThemeSyncService.applyFromDesktop).toHaveBeenCalledWith({
      variant: 'compact',
    });
    // Falls back to getColorTheme() which returns 'default'
    expect(result.current.themeId).toBe('default');
  });

  it('cleans up listener on unmount', () => {
    const removeListenerSpy = vi.spyOn(chrome.runtime.onMessage, 'removeListener');

    const { unmount } = renderHook(() => useDesktopConnection());
    unmount();

    expect(removeListenerSpy).toHaveBeenCalled();
  });
});
