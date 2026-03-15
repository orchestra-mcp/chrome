/**
 * Desktop Discovery Service
 * Auto-discovers Orchestra desktop app WebSocket server
 */

export interface DiscoveryResult {
  found: boolean;
  url?: string;
  port?: number;
}

export class DesktopDiscovery {
  private static readonly PORTS = [8765, 3000, 3001, 8080, 8000];
  private static readonly TIMEOUT_MS = 2000;
  private static readonly STORAGE_KEY = 'orchestra_desktop_endpoint';

  /**
   * Discover desktop WebSocket server by trying common ports
   */
  static async discover(): Promise<DiscoveryResult> {
    // Check cached endpoint first
    const cached = await this.getCachedEndpoint();
    if (cached) {
      const isAlive = await this.testConnection(cached);
      if (isAlive) {
        return { found: true, url: cached, port: this.extractPort(cached) };
      }
    }

    // Try common ports
    for (const port of this.PORTS) {
      const url = `ws://localhost:${port}`;
      const isAlive = await this.testConnection(url);

      if (isAlive) {
        await this.cacheEndpoint(url);
        return { found: true, url, port };
      }
    }

    return { found: false };
  }

  /**
   * Test WebSocket connection to URL
   */
  private static async testConnection(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, this.TIMEOUT_MS);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
  }

  /**
   * Cache discovered endpoint
   */
  private static async cacheEndpoint(url: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: url });
    }
  }

  /**
   * Get cached endpoint
   */
  private static async getCachedEndpoint(): Promise<string | null> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return null;
    }

    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        resolve(result[this.STORAGE_KEY] || null);
      });
    });
  }

  /**
   * Extract port number from WebSocket URL
   */
  private static extractPort(url: string): number {
    const match = url.match(/:(\d+)/);
    return match ? parseInt(match[1], 10) : 8765;
  }

  /**
   * Clear cached endpoint
   */
  static async clearCache(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove(this.STORAGE_KEY);
    }
  }
}
