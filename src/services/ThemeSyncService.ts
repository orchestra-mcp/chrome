/**
 * ThemeSyncService
 * Manages theme sync between the Chrome extension and the desktop app.
 * Persists theme state to chrome.storage.local for offline/startup restore.
 */

import { setColorTheme, setComponentVariant } from '@orchestra-mcp/theme';
import type { ComponentVariant } from '@orchestra-mcp/theme';

interface ThemeState {
  themeId: string;
  variant?: string;
  timestamp: number;
}

interface ThemePayload {
  themeId: string;
  variant?: string;
}

const STORAGE_KEY = 'orchestra_theme_state';

export class ThemeSyncService {
  private static STORAGE_KEY = STORAGE_KEY;

  /** Apply theme from a desktop theme.change payload. */
  static applyFromDesktop(payload: ThemePayload): void {
    setColorTheme(payload.themeId);
    if (payload.variant) {
      setComponentVariant(payload.variant as ComponentVariant);
    }
    ThemeSyncService.persist(payload.themeId, payload.variant).catch((err) => {
      console.error('[ThemeSync] Failed to persist theme:', err);
    });
  }

  /** Persist current theme state to chrome.storage.local. */
  static async persist(themeId: string, variant?: string): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const state: ThemeState = { themeId, variant, timestamp: Date.now() };
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /** Restore theme from chrome.storage.local (for offline/startup). */
  static async restore(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const state: ThemeState | undefined = result[STORAGE_KEY];
        if (state?.themeId) {
          setColorTheme(state.themeId);
          if (state.variant) {
            setComponentVariant(state.variant as ComponentVariant);
          }
        }
        resolve();
      });
    });
  }

  /** Request current theme from desktop via the service worker. */
  static requestFromDesktop(): void {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
    try {
      const result = chrome.runtime.sendMessage({ type: 'theme.request' });
      if (result && typeof (result as any).catch === 'function') {
        (result as any).catch(() => {});
      }
    } catch {
      // Background script might not be ready
    }
  }
}
