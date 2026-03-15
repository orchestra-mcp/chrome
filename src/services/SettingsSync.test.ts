/**
 * Unit tests for SettingsSyncService
 *
 * Mocks chrome.runtime and chrome.storage.local inline to avoid
 * issues with the existing callback-only mock (the source code
 * uses sendMessage as a Promise, not callback-based).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SettingsState, Setting, SettingGroup } from '../types/settings';

// ---------------------------------------------------------------------------
// Chrome API mock
// ---------------------------------------------------------------------------

type MessageListener = (message: any, sender?: any, sendResponse?: Function) => void;

let messageListeners: MessageListener[] = [];
let storageData: Record<string, any> = {};

function setupChromeMock() {
  messageListeners = [];
  storageData = {};

  (globalThis as any).chrome = {
    runtime: {
      lastError: undefined as chrome.runtime.LastError | undefined,
      onMessage: {
        addListener: vi.fn((fn: MessageListener) => {
          messageListeners.push(fn);
        }),
        removeListener: vi.fn((fn: MessageListener) => {
          const idx = messageListeners.indexOf(fn);
          if (idx >= 0) messageListeners.splice(idx, 1);
        }),
      },
      sendMessage: vi.fn().mockResolvedValue(undefined),
    },
    storage: {
      local: {
        get: vi.fn((keys: string | string[] | null, cb: (items: Record<string, any>) => void) => {
          const result: Record<string, any> = {};
          if (keys === null) {
            Object.assign(result, storageData);
          } else {
            const keyArr = Array.isArray(keys) ? keys : [keys];
            keyArr.forEach((k) => {
              if (storageData[k] !== undefined) {
                result[k] = storageData[k];
              }
            });
          }
          // Use setTimeout(0) to match the real Chrome async behavior
          setTimeout(() => cb(result), 0);
        }),
        set: vi.fn((items: Record<string, any>, cb?: () => void) => {
          Object.assign(storageData, items);
          setTimeout(() => cb?.(), 0);
        }),
        remove: vi.fn((key: string | string[], cb?: () => void) => {
          const keys = Array.isArray(key) ? key : [key];
          keys.forEach((k) => delete storageData[k]);
          setTimeout(() => cb?.(), 0);
        }),
        clear: vi.fn((cb?: () => void) => {
          storageData = {};
          setTimeout(() => cb?.(), 0);
        }),
      },
      onChanged: {
        addListener: vi.fn(),
      },
    },
  };
}

/** Simulate an incoming runtime message as if the background script sent it. */
function simulateMessage(message: any) {
  messageListeners.forEach((fn) => fn(message, {}, () => {}));
}

/** Flush all pending setTimeout(0) callbacks and resolved promises. */
async function flushAsync() {
  // Run microtask queue, then macrotask timers, then microtasks again
  await vi.runAllTimersAsync();
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeGroup(overrides: Partial<SettingGroup> = {}): SettingGroup {
  return {
    id: 'general',
    label: 'General',
    order: 0,
    collapsible: true,
    ...overrides,
  };
}

function makeSetting(overrides: Partial<Setting> = {}): Setting {
  return {
    key: 'editor.fontSize',
    label: 'Font Size',
    type: 'number',
    default: 14,
    value: 16,
    group: 'general',
    order: 0,
    plugin_id: 'core',
    ...overrides,
  };
}

function makeState(overrides: Partial<SettingsState> = {}): SettingsState {
  return {
    groups: [makeGroup()],
    settings: [makeSetting()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SettingsSyncService', () => {
  // Import must happen AFTER the chrome mock is in place. We use a dynamic
  // import inside beforeEach so each test gets a fresh module instance.
  let SettingsSyncService: typeof import('./SettingsSync').SettingsSyncService;
  let service: InstanceType<typeof SettingsSyncService>;

  beforeEach(async () => {
    vi.useFakeTimers();
    setupChromeMock();

    // Dynamic import to ensure the module picks up our fresh chrome mock.
    // Resetting the module registry guarantees a clean class with no
    // residual singleton state.
    vi.resetModules();
    const mod = await import('./SettingsSync');
    SettingsSyncService = mod.SettingsSyncService;
    service = new SettingsSyncService();
  });

  afterEach(() => {
    service.destroy();
    vi.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // 1. init loads from storage
  // -----------------------------------------------------------------------
  it('init loads state, values, and version from storage', async () => {
    const state = makeState();
    const values = { 'editor.fontSize': 18 };
    const version = 42;

    storageData['orchestra.settings.state'] = state;
    storageData['orchestra.settings.values'] = values;
    storageData['orchestra.settings.version'] = version;

    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    expect(service.getState()).toEqual(state);
    expect(service.getValues()).toEqual(values);
  });

  // -----------------------------------------------------------------------
  // 2. init adds message listener
  // -----------------------------------------------------------------------
  it('init registers a chrome.runtime.onMessage listener', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledOnce();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  // -----------------------------------------------------------------------
  // 3. init requests state from background
  // -----------------------------------------------------------------------
  it('init sends settings.request to the background script', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'settings.request' },
    );
  });

  // -----------------------------------------------------------------------
  // 4. subscribe emits current state immediately
  // -----------------------------------------------------------------------
  it('subscribe calls listener immediately with current state', async () => {
    // Pre-populate via storage
    const state = makeState();
    storageData['orchestra.settings.state'] = state;
    storageData['orchestra.settings.values'] = { 'editor.fontSize': 16 };
    storageData['orchestra.settings.version'] = 1;

    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    service.subscribe(listener);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ groups: expect.any(Array) }),
      expect.objectContaining({ 'editor.fontSize': 16 }),
    );
  });

  // -----------------------------------------------------------------------
  // 5. subscribe returns working unsubscribe function
  // -----------------------------------------------------------------------
  it('unsubscribe prevents listener from receiving further updates', async () => {
    // Initialize with state so notifyListeners can fire
    const state = makeState();
    storageData['orchestra.settings.state'] = state;
    storageData['orchestra.settings.values'] = { 'editor.fontSize': 16 };
    storageData['orchestra.settings.version'] = 1;

    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    expect(listener).toHaveBeenCalledOnce(); // immediate call

    unsubscribe();

    // Trigger a settings update message
    simulateMessage({
      type: 'settings.update',
      data: {
        groups: [makeGroup()],
        settings: [makeSetting({ value: 20 })],
        version: Date.now() + 1000,
      },
    });
    await flushAsync();

    // Listener should NOT have been called again after unsubscribe
    expect(listener).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // 6. changeSetting updates local values
  // -----------------------------------------------------------------------
  it('changeSetting updates the in-memory values', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const changePromise = service.changeSetting('editor.fontSize', 22, 'core');
    await flushAsync();
    await changePromise;

    expect(service.getValues()).toEqual(
      expect.objectContaining({ 'editor.fontSize': 22 }),
    );
  });

  // -----------------------------------------------------------------------
  // 7. changeSetting persists to chrome.storage.local
  // -----------------------------------------------------------------------
  it('changeSetting persists values and version to storage', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const changePromise = service.changeSetting('editor.fontSize', 22, 'core');
    await flushAsync();
    await changePromise;

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'orchestra.settings.values': expect.objectContaining({ 'editor.fontSize': 22 }) }),
      expect.any(Function),
    );
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'orchestra.settings.version': expect.any(Number) }),
      expect.any(Function),
    );
  });

  // -----------------------------------------------------------------------
  // 8. changeSetting sends message to background
  // -----------------------------------------------------------------------
  it('changeSetting sends setting.change message to background', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const changePromise = service.changeSetting('editor.theme', 'dark', 'theme-plugin');
    await flushAsync();
    await changePromise;

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'setting.change',
      payload: { key: 'editor.theme', value: 'dark', plugin_id: 'theme-plugin' },
    });
  });

  // -----------------------------------------------------------------------
  // 9. handleMessage updates state on settings.update
  // -----------------------------------------------------------------------
  it('updates state when receiving a settings.update message', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    service.subscribe(listener);

    // No state was loaded from storage, so the immediate emit does not fire
    expect(listener).not.toHaveBeenCalled();

    const incomingState = {
      groups: [makeGroup({ id: 'appearance', label: 'Appearance' })],
      settings: [makeSetting({ key: 'theme.mode', value: 'dark', default: 'light' })],
      version: Date.now() + 5000,
    };

    simulateMessage({ type: 'settings.update', data: incomingState });
    await flushAsync();

    const state = service.getState();
    expect(state).not.toBeNull();
    expect(state!.groups[0].id).toBe('appearance');
    expect(service.getValues()).toEqual(
      expect.objectContaining({ 'theme.mode': 'dark' }),
    );

    // listener called once for the incoming update
    expect(listener).toHaveBeenCalledOnce();
  });

  // -----------------------------------------------------------------------
  // 10. handleMessage ignores old versions (last-write-wins)
  // -----------------------------------------------------------------------
  it('ignores settings.update with a version older than the local version', async () => {
    // Seed a high local version
    storageData['orchestra.settings.state'] = makeState();
    storageData['orchestra.settings.values'] = { 'editor.fontSize': 16 };
    storageData['orchestra.settings.version'] = 999_999_999;

    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    service.subscribe(listener);
    listener.mockClear(); // clear the immediate call

    // Send an update with an older version
    simulateMessage({
      type: 'settings.update',
      data: {
        groups: [makeGroup()],
        settings: [makeSetting({ key: 'editor.fontSize', value: 99 })],
        version: 1, // way older
      },
    });
    await flushAsync();

    // Values should remain unchanged
    expect(service.getValues()).toEqual({ 'editor.fontSize': 16 });
    // Listener should NOT have been called for the stale update
    expect(listener).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 11. destroy removes the message listener
  // -----------------------------------------------------------------------
  it('destroy removes the runtime message listener', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    service.destroy();

    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledOnce();
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  // -----------------------------------------------------------------------
  // 12. handles missing chrome API gracefully
  // -----------------------------------------------------------------------
  it('does not throw when chrome API is undefined', async () => {
    const savedChrome = (globalThis as any).chrome;
    (globalThis as any).chrome = undefined;

    // Need a fresh module that sees chrome as undefined
    vi.resetModules();
    const mod = await import('./SettingsSync');
    const svc = new mod.SettingsSyncService();

    // init should not throw -- loadFromStorage will fail, but the catch
    // swallows it; addListener and requestState guard with typeof checks
    await expect(svc.init()).resolves.not.toThrow();

    // changeSetting should not throw either
    // StorageWrapper.set will fail, but the catch in changeSetting handles it
    await expect(svc.changeSetting('foo', 'bar', 'test')).resolves.not.toThrow();

    // destroy should not throw
    expect(() => svc.destroy()).not.toThrow();

    // Restore chrome for afterEach cleanup
    (globalThis as any).chrome = savedChrome;
  });

  // -----------------------------------------------------------------------
  // Extra: desktop.connected / desktop.disconnected messages
  // -----------------------------------------------------------------------
  it('tracks connection state via desktop.connected and desktop.disconnected', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    expect(service.getIsConnected()).toBe(false);

    simulateMessage({ type: 'desktop.connected' });
    expect(service.getIsConnected()).toBe(true);

    simulateMessage({ type: 'desktop.disconnected' });
    expect(service.getIsConnected()).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Extra: settings.update via payload field (alternate shape)
  // -----------------------------------------------------------------------
  it('handles settings.update with payload field instead of data', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const incomingState = {
      groups: [makeGroup()],
      settings: [makeSetting({ key: 'editor.tabSize', value: 4, default: 2 })],
      version: Date.now() + 5000,
    };

    simulateMessage({ type: 'settings.update', payload: incomingState });
    await flushAsync();

    expect(service.getValues()).toEqual(
      expect.objectContaining({ 'editor.tabSize': 4 }),
    );
  });

  // -----------------------------------------------------------------------
  // Extra: subscribe does not call listener if no state loaded yet
  // -----------------------------------------------------------------------
  it('subscribe does not call listener immediately when state is null', async () => {
    // Do NOT load any state into storage -- service.state stays null
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    service.subscribe(listener);

    expect(listener).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Extra: malformed messages are ignored
  // -----------------------------------------------------------------------
  it('ignores messages with missing or non-string type field', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const listener = vi.fn();
    service.subscribe(listener);
    listener.mockClear();

    simulateMessage(null);
    simulateMessage(undefined);
    simulateMessage({});
    simulateMessage({ type: 123 });
    simulateMessage({ type: '' }); // empty string -- passes typeof but not matched

    expect(listener).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Extra: getValues returns a copy, not a reference
  // -----------------------------------------------------------------------
  it('getValues returns a shallow copy so mutations do not affect internal state', async () => {
    storageData['orchestra.settings.values'] = { 'editor.fontSize': 14 };
    storageData['orchestra.settings.version'] = 1;

    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    const copy = service.getValues();
    copy['editor.fontSize'] = 999;

    expect(service.getValues()['editor.fontSize']).toBe(14);
  });

  // -----------------------------------------------------------------------
  // Extra: desktop.connected re-requests state
  // -----------------------------------------------------------------------
  it('re-requests settings state when desktop connects', async () => {
    const initPromise = service.init();
    await flushAsync();
    await initPromise;

    // Clear previous sendMessage calls from init
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockClear();

    simulateMessage({ type: 'desktop.connected' });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'settings.request' },
    );
  });
});
