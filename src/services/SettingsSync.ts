/**
 * Settings Sync Service
 * Bidirectional settings sync between Chrome extension and desktop app.
 * Persists to chrome.storage.local for offline support.
 * Uses last-write-wins conflict resolution via version timestamps.
 */

import type { SettingsState, Setting } from '../types/settings';
import { StorageWrapper } from './StorageWrapper';

const STORAGE_KEYS = {
  state: 'orchestra.settings.state',
  values: 'orchestra.settings.values',
  version: 'orchestra.settings.version',
} as const;

type SettingsListener = (state: SettingsState, values: Record<string, any>) => void;

export class SettingsSyncService {
  private storage: StorageWrapper;
  private state: SettingsState | null = null;
  private values: Record<string, any> = {};
  private version = 0;
  private listeners: Set<SettingsListener> = new Set();
  private isConnected = false;
  private boundHandleMessage: (message: any) => void;

  constructor() {
    this.storage = new StorageWrapper();
    this.boundHandleMessage = this.handleMessage.bind(this);
  }

  /** Initialize: load from storage, listen for messages, request fresh state */
  async init(): Promise<void> {
    try {
      await this.loadFromStorage();
    } catch (err) {
      console.warn('[SettingsSync] Failed to load from storage:', err);
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(this.boundHandleMessage);
    }

    this.requestState();
  }

  /** Subscribe to settings updates. Returns unsubscribe function. */
  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    if (this.state) {
      listener(this.state, this.values);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Change a setting value -- persists locally and sends to backend */
  async changeSetting(key: string, value: any, pluginId: string): Promise<void> {
    this.values[key] = value;
    this.version = Date.now();

    try {
      await this.storage.set(STORAGE_KEYS.values, this.values);
      await this.storage.set(STORAGE_KEYS.version, this.version);
    } catch (err) {
      console.error('[SettingsSync] Failed to persist value:', err);
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'setting.change',
        payload: { key, value, plugin_id: pluginId },
      }).catch(() => {
        // Background script might not be ready
      });
    }

    this.notifyListeners();
  }

  /** Get current setting values */
  getValues(): Record<string, any> {
    return { ...this.values };
  }

  /** Get current settings state (groups + settings definitions) */
  getState(): SettingsState | null {
    return this.state;
  }

  /** Whether the desktop connection is active */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /** Clean up listeners */
  destroy(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.removeListener(this.boundHandleMessage);
    }
    this.listeners.clear();
  }

  private handleMessage(message: any): void {
    if (!message || typeof message.type !== 'string') return;

    switch (message.type) {
      case 'settings.update':
        if (message.data) {
          this.handleSettingsUpdate(message.data);
        } else if (message.payload) {
          this.handleSettingsUpdate(message.payload);
        }
        break;

      case 'desktop.connected':
        this.isConnected = true;
        this.requestState();
        break;

      case 'desktop.disconnected':
        this.isConnected = false;
        break;
    }
  }

  private handleSettingsUpdate(data: any): void {
    const incomingVersion = data.version ?? Date.now();
    if (incomingVersion < this.version) {
      // Local version is newer -- last-write-wins, ignore incoming
      return;
    }

    const state: SettingsState = {
      groups: data.groups || [],
      settings: data.settings || [],
    };

    this.state = state;

    const newValues: Record<string, any> = {};
    state.settings.forEach((s: Setting) => {
      newValues[s.key] = s.value ?? s.default;
    });
    this.values = newValues;
    this.version = incomingVersion;

    // Persist to storage (fire-and-forget)
    this.persistToStorage();
    this.notifyListeners();
  }

  private async loadFromStorage(): Promise<void> {
    const [state, values, version] = await Promise.all([
      this.storage.get<SettingsState>(STORAGE_KEYS.state),
      this.storage.get<Record<string, any>>(STORAGE_KEYS.values),
      this.storage.get<number>(STORAGE_KEYS.version),
    ]);

    if (state) this.state = state;
    if (values) this.values = values;
    if (version) this.version = version;
  }

  private persistToStorage(): void {
    Promise.all([
      this.storage.set(STORAGE_KEYS.state, this.state),
      this.storage.set(STORAGE_KEYS.values, this.values),
      this.storage.set(STORAGE_KEYS.version, this.version),
    ]).catch((err) => {
      console.error('[SettingsSync] Failed to persist state:', err);
    });
  }

  private requestState(): void {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;

    chrome.runtime.sendMessage({ type: 'settings.request' }).catch(() => {
      // Background script might not be ready yet
    });
  }

  private notifyListeners(): void {
    if (!this.state) return;
    const state = this.state;
    const values = this.values;
    this.listeners.forEach((fn) => {
      try {
        fn(state, values);
      } catch (err) {
        console.error('[SettingsSync] Listener error:', err);
      }
    });
  }
}
