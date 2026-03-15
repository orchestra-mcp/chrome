"use client";

/**
 * useDesktopConnection
 * Manages desktop connection state and theme sync for the side panel.
 * Restores persisted theme on mount and reacts to live messages from
 * the service worker.
 */

import { useState, useEffect } from 'react';
import { getColorTheme } from '@orchestra-mcp/theme';
import { ThemeSyncService } from '../services/ThemeSyncService';

export interface UseDesktopConnectionReturn {
  connected: boolean;
  themeId: string;
}

export function useDesktopConnection(): UseDesktopConnectionReturn {
  const [connected, setConnected] = useState(false);
  const [themeId, setThemeId] = useState(() => getColorTheme());

  useEffect(() => {
    // Restore last known theme from storage on mount.
    ThemeSyncService.restore().then(() => {
      setThemeId(getColorTheme());
    });

    // Check initial connection status.
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'desktop.status' }, (response: any) => {
        if (response?.connected) {
          setConnected(true);
        }
      });
    }

    const handleMessage = (message: any): void => {
      switch (message?.type) {
        case 'desktop.connected':
          setConnected(true);
          ThemeSyncService.requestFromDesktop();
          break;

        case 'desktop.disconnected':
          setConnected(false);
          break;

        case 'theme.change':
        case 'theme.update':
          if (message.payload) {
            ThemeSyncService.applyFromDesktop(message.payload);
            setThemeId(message.payload.themeId ?? getColorTheme());
          }
          break;
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(handleMessage);
      }
    };
  }, []);

  return { connected, themeId };
}
