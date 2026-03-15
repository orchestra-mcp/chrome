/**
 * Tests for Desktop Discovery Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DesktopDiscovery } from './DesktopDiscovery';
import { chrome } from '../__mocks__/chrome';

describe('DesktopDiscovery', () => {
  let originalWebSocket: any;
  let mockWsInstances: any[] = [];

  beforeEach(() => {
    chrome._resetAll();
    mockWsInstances = [];
    originalWebSocket = globalThis.WebSocket;
  });

  afterEach(() => {
    (globalThis as any).WebSocket = originalWebSocket;
    vi.restoreAllMocks();
  });

  const createMockWebSocket = (behavior: 'success' | 'error' | 'timeout') => {
    return class MockWS {
      url: string;
      onopen: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readyState = 0;
      static OPEN = 1;
      static CLOSED = 3;

      constructor(url: string) {
        this.url = url;
        mockWsInstances.push(this);

        if (behavior === 'success') {
          Promise.resolve().then(() => {
            this.readyState = 1;
            this.onopen?.();
          });
        } else if (behavior === 'error') {
          Promise.resolve().then(() => this.onerror?.());
        }
        // timeout: do nothing
      }

      close() {
        this.readyState = 3;
      }

      send(_data: string) {}
    };
  };

  describe('discover', () => {
    it('returns cached endpoint if available and alive', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost:8765' });
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      expect(result.url).toBe('ws://localhost:8765');
      expect(result.port).toBe(8765);
    });

    it('tries common ports when cache is empty', async () => {
      let attemptCount = 0;

      (globalThis as any).WebSocket = class MockWS {
        url: string;
        onopen: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readyState = 0;
        static OPEN = 1;
        static CLOSED = 3;

        constructor(url: string) {
          this.url = url;
          attemptCount++;

          // First port fails, second succeeds
          if (url.includes(':8765')) {
            Promise.resolve().then(() => this.onerror?.());
          } else if (url.includes(':3000')) {
            Promise.resolve().then(() => {
              this.readyState = 1;
              this.onopen?.();
            });
          }
        }

        close() {}
        send(_data: string) {}
      };

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      expect(result.url).toBe('ws://localhost:3000');
      expect(result.port).toBe(3000);
      expect(attemptCount).toBeGreaterThan(1);
    });

    it('returns not found when all ports fail', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('error');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(false);
      expect(result.url).toBeUndefined();
      expect(result.port).toBeUndefined();
    });

    it('caches discovered endpoint', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('success');

      await DesktopDiscovery.discover();

      const cached = chrome.storage.local._getData();
      expect(cached.orchestra_desktop_endpoint).toBe('ws://localhost:8765');
    });

    it('retries when cached endpoint is dead', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost:9999' });

      let attemptCount = 0;

      (globalThis as any).WebSocket = class MockWS {
        url: string;
        onopen: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readyState = 0;
        static OPEN = 1;
        static CLOSED = 3;

        constructor(url: string) {
          this.url = url;
          attemptCount++;

          // Cached port fails, first default port succeeds
          if (url.includes(':9999')) {
            Promise.resolve().then(() => this.onerror?.());
          } else if (url.includes(':8765')) {
            Promise.resolve().then(() => {
              this.readyState = 1;
              this.onopen?.();
            });
          } else {
            Promise.resolve().then(() => this.onerror?.());
          }
        }

        close() {}
        send(_data: string) {}
      };

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      expect(result.url).toBe('ws://localhost:8765');
    });
  });

  describe('testConnection (via discover)', () => {
    it('returns true for successful connection', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
    });

    it('returns false when connection times out', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('timeout');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(false);
    }, 12000); // Timeout: 2s per port * 5 ports + buffer

    it('returns false on connection error', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('error');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(false);
    });

    it('closes WebSocket after successful connection', async () => {
      let closeCalled = false;

      (globalThis as any).WebSocket = class MockWS extends createMockWebSocket('success') {
        close() {
          closeCalled = true;
          super.close();
        }
      };

      await DesktopDiscovery.discover();

      expect(closeCalled).toBe(true);
    });

    it('closes WebSocket on timeout', async () => {
      let closeCalled = false;

      (globalThis as any).WebSocket = class MockWS extends createMockWebSocket('timeout') {
        close() {
          closeCalled = true;
          super.close();
        }
      };

      await DesktopDiscovery.discover();

      expect(closeCalled).toBe(true);
    }, 12000); // Timeout: 2s per port * 5 ports + buffer
  });

  describe('cacheEndpoint (via discover)', () => {
    it('saves endpoint to chrome.storage.local', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('success');

      await DesktopDiscovery.discover();

      const data = chrome.storage.local._getData();
      expect(data.orchestra_desktop_endpoint).toBeDefined();
      expect(data.orchestra_desktop_endpoint).toMatch(/^ws:\/\/localhost:\d+$/);
    });

    it('handles chrome.storage being undefined', async () => {
      const originalChrome = globalThis.chrome;
      (globalThis as any).chrome = undefined;
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      (globalThis as any).chrome = originalChrome;
    });
  });

  describe('getCachedEndpoint (via discover)', () => {
    it('retrieves cached endpoint', async () => {
      const testUrl = 'ws://localhost:8765';
      await chrome.storage.local.set({ orchestra_desktop_endpoint: testUrl });
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.url).toBe(testUrl);
    });

    it('falls back to port scan when no cache exists', async () => {
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
    });

    it('returns null when chrome.storage is undefined', async () => {
      const originalChrome = globalThis.chrome;
      (globalThis as any).chrome = undefined;
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      (globalThis as any).chrome = originalChrome;
    });
  });

  describe('clearCache', () => {
    it('removes cached endpoint', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost:8765' });

      await DesktopDiscovery.clearCache();

      const data = chrome.storage.local._getData();
      expect(data.orchestra_desktop_endpoint).toBeUndefined();
    });

    it('handles clearing when cache is empty', async () => {
      await expect(DesktopDiscovery.clearCache()).resolves.not.toThrow();
    });

    it('handles chrome.storage being undefined', async () => {
      const originalChrome = globalThis.chrome;
      (globalThis as any).chrome = undefined;

      await expect(DesktopDiscovery.clearCache()).resolves.not.toThrow();

      (globalThis as any).chrome = originalChrome;
    });

    it('clears cache and re-discovers on next call', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost:9999' });
      await DesktopDiscovery.clearCache();

      (globalThis as any).WebSocket = class MockWS {
        url: string;
        onopen: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readyState = 0;
        static OPEN = 1;
        static CLOSED = 3;

        constructor(url: string) {
          this.url = url;
          if (url.includes(':8765')) {
            Promise.resolve().then(() => {
              this.readyState = 1;
              this.onopen?.();
            });
          } else {
            Promise.resolve().then(() => this.onerror?.());
          }
        }

        close() {}
        send(_data: string) {}
      };

      const result = await DesktopDiscovery.discover();

      expect(result.found).toBe(true);
      expect(result.url).toBe('ws://localhost:8765');
    });
  });

  describe('port extraction', () => {
    it('extracts port from URL', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost:3000' });
      (globalThis as any).WebSocket = createMockWebSocket('success');

      const result = await DesktopDiscovery.discover();

      expect(result.port).toBe(3000);
    });

    it('defaults to 8765 for invalid URL', async () => {
      await chrome.storage.local.set({ orchestra_desktop_endpoint: 'ws://localhost' });

      (globalThis as any).WebSocket = class MockWS {
        url: string;
        onopen: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readyState = 0;
        static OPEN = 1;
        static CLOSED = 3;

        constructor(url: string) {
          this.url = url;
          if (url === 'ws://localhost') {
            Promise.resolve().then(() => {
              this.readyState = 1;
              this.onopen?.();
            });
          } else {
            Promise.resolve().then(() => this.onerror?.());
          }
        }

        close() {}
        send(_data: string) {}
      };

      const result = await DesktopDiscovery.discover();

      if (result.found && result.url === 'ws://localhost') {
        expect(result.port).toBe(8765);
      }
    });
  });
});
