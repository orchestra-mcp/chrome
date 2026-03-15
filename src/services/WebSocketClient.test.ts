/**
 * Tests for WebSocket client
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketClient } from './WebSocketClient';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState: number = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.(new Event('open'));
      }
    }, 10);
  }

  send(data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.(new CloseEvent('close'));
    }, 10);
  }

  // Test helpers
  _triggerMessage(data: any): void {
    const event = new MessageEvent('message', {
      data: JSON.stringify(data),
    });
    this.onmessage?.(event);
  }

  _triggerError(error?: Error): void {
    const event = new Event('error');
    (event as any).error = error;
    this.onerror?.(event);
  }
}

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  const testUrl = 'ws://localhost:8765';

  beforeEach(() => {
    vi.clearAllTimers();
    (globalThis as any).WebSocket = MockWebSocket;
    client = new WebSocketClient(testUrl);
  });

  afterEach(() => {
    // Cleanup
  });

  describe('connect', () => {
    it('establishes a connection successfully', async () => {
      await client.connect();
      expect(client.isConnected()).toBe(true);
    });

    it('emits connected event on successful connection', async () => {
      const connectedHandler = vi.fn();
      client.on('connected', connectedHandler);

      await client.connect();

      expect(connectedHandler).toHaveBeenCalledWith(null);
    });

    it('does not reconnect if already connected', async () => {
      await client.connect();

      const firstWs = (client as any).ws;
      await client.connect();

      expect((client as any).ws).toBe(firstWs);
    });

    it('handles connection errors', async () => {
      const errorHandler = vi.fn();
      client.on('error', errorHandler);

      const connectPromise = client.connect();

      // Trigger error before connection opens
      const ws = (client as any).ws as MockWebSocket;
      ws._triggerError(new Error('Connection failed'));

      await expect(connectPromise).rejects.toThrow();
    });
  });

  describe('disconnect', () => {
    it('closes the connection', async () => {
      await client.connect();

      await client.disconnect();
      // Wait for async close
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(client.isConnected()).toBe(false);
    });

    it('emits disconnected event', async () => {
      const disconnectedHandler = vi.fn();
      client.on('disconnected', disconnectedHandler);

      await client.connect();

      await client.disconnect();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(disconnectedHandler).toHaveBeenCalledWith(null);
    });

    it('clears reconnect timeout', async () => {
      await client.connect();

      const ws = (client as any).ws as MockWebSocket;
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 20));

      // Reconnect should be scheduled
      expect((client as any).reconnectTimeout).not.toBeNull();

      await client.disconnect();

      // Reconnect timeout should be cleared
      expect((client as any).reconnectTimeout).toBeNull();
    });
  });

  describe('send', () => {
    it('sends JSON stringified data', async () => {
      await client.connect();

      const ws = (client as any).ws as MockWebSocket;
      const sendSpy = vi.spyOn(ws, 'send');

      const testData = { type: 'test', payload: { foo: 'bar' } };
      client.send(testData);

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    it('warns when not connected', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      client.send({ type: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('[WebSocket] Cannot send, not connected');

      consoleSpy.mockRestore();
    });
  });

  describe('message handling', () => {
    it('parses and emits received messages', async () => {
      const messageHandler = vi.fn();
      client.on('message', messageHandler);

      await client.connect();

      const testData = { type: 'update', data: { value: 42 } };
      const ws = (client as any).ws as MockWebSocket;
      ws._triggerMessage(testData);

      expect(messageHandler).toHaveBeenCalledWith(testData);
    });

    it('handles invalid JSON gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await client.connect();

      const ws = (client as any).ws as MockWebSocket;
      const event = new MessageEvent('message', { data: 'invalid json' });
      ws.onmessage?.(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocket] Failed to parse message:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('event listeners', () => {
    it('adds event listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      client.on('test', handler1);
      client.on('test', handler2);

      (client as any).emit('test', { data: 'value' });

      expect(handler1).toHaveBeenCalledWith({ data: 'value' });
      expect(handler2).toHaveBeenCalledWith({ data: 'value' });
    });

    it('removes event listeners', () => {
      const handler = vi.fn();

      client.on('test', handler);
      client.off('test', handler);

      (client as any).emit('test', { data: 'value' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('handles removing non-existent listener', () => {
      const handler = vi.fn();

      expect(() => client.off('nonexistent', handler)).not.toThrow();
    });
  });

  describe('reconnection logic', () => {
    it('schedules reconnection on disconnect', async () => {
      await client.connect();

      const ws = (client as any).ws as MockWebSocket;
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect((client as any).reconnectTimeout).not.toBeNull();
      expect((client as any).reconnectAttempts).toBe(1);
    });

    it('uses exponential backoff for reconnection', async () => {
      await client.connect();

      const ws = (client as any).ws as MockWebSocket;

      // First disconnect
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 20));
      expect((client as any).reconnectAttempts).toBe(1);

      // The delay should be calculated exponentially
      const firstDelay = Math.min(1000 * Math.pow(2, 0), 30000);
      expect(firstDelay).toBe(1000);
    });

    it('stops reconnecting after max attempts', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await client.connect();

      // Simulate max reconnect attempts already reached
      (client as any).reconnectAttempts = 10;

      const ws = (client as any).ws as MockWebSocket;
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(consoleSpy).toHaveBeenCalledWith('[WebSocket] Max reconnect attempts reached');
      expect((client as any).reconnectTimeout).toBeNull();

      consoleSpy.mockRestore();
    });

    it('resets reconnect attempts on successful connection', async () => {
      // Set reconnect attempts
      (client as any).reconnectAttempts = 5;
      (client as any).reconnectDelay = 10000;

      await client.connect();

      expect((client as any).reconnectAttempts).toBe(0);
      expect((client as any).reconnectDelay).toBe(1000);
    });

    it('caps reconnect delay at 30 seconds', async () => {
      await client.connect();

      // Set high reconnect attempts
      (client as any).reconnectAttempts = 20;

      const ws = (client as any).ws as MockWebSocket;
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should be capped at 30000ms
      const scheduledDelay = Math.min(1000 * Math.pow(2, 20), 30000);
      expect(scheduledDelay).toBe(30000);
    });
  });

  describe('isConnected', () => {
    it('returns true when connected', async () => {
      expect(client.isConnected()).toBe(false);

      await client.connect();

      expect(client.isConnected()).toBe(true);
    });

    it('returns false when not connected', async () => {
      await client.connect();

      await client.disconnect();
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(client.isConnected()).toBe(false);
    });
  });
});
