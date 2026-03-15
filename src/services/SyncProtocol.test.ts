/**
 * Tests for Sync Protocol Handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncProtocol, SyncMessage } from './SyncProtocol';

describe('SyncProtocol', () => {
  let protocol: SyncProtocol;

  beforeEach(() => {
    protocol = new SyncProtocol();
    vi.clearAllMocks();
  });

  describe('on/off handlers', () => {
    it('registers a message handler', () => {
      const handler = vi.fn();
      protocol.on('test-event', handler);

      const message = protocol.createMessage('test-event', { data: 'test' });
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('registers multiple handlers for different types', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      protocol.on('event-1', handler1);
      protocol.on('event-2', handler2);

      const message1 = protocol.createMessage('event-1', { data: 'one' });
      const message2 = protocol.createMessage('event-2', { data: 'two' });

      protocol.handleMessage(message1);
      protocol.handleMessage(message2);

      expect(handler1).toHaveBeenCalledWith({ data: 'one' });
      expect(handler2).toHaveBeenCalledWith({ data: 'two' });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('replaces handler when registering same type twice', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      protocol.on('test-event', handler1);
      protocol.on('test-event', handler2);

      const message = protocol.createMessage('test-event', { data: 'test' });
      protocol.handleMessage(message);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('unregisters a message handler', () => {
      const handler = vi.fn();
      protocol.on('test-event', handler);
      protocol.off('test-event');

      const message = protocol.createMessage('test-event', { data: 'test' });
      protocol.handleMessage(message);

      expect(handler).not.toHaveBeenCalled();
    });

    it('handles unregistering non-existent handler', () => {
      expect(() => protocol.off('non-existent')).not.toThrow();
    });

    it('handles undefined payload', () => {
      const handler = vi.fn();
      protocol.on('test-event', handler);

      const message = protocol.createMessage('test-event');
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('handles complex payload objects', () => {
      const handler = vi.fn();
      protocol.on('complex-event', handler);

      const complexPayload = {
        nested: { value: 42 },
        array: [1, 2, 3],
        string: 'test',
        bool: true,
      };

      const message = protocol.createMessage('complex-event', complexPayload);
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(complexPayload);
    });
  });

  describe('handleMessage', () => {
    it('calls registered handler with payload', () => {
      const handler = vi.fn();
      protocol.on('sidebar:update', handler);

      const payload = { entries: [{ id: '1', label: 'Test', action: 'test' }] };
      const message: SyncMessage = {
        type: 'sidebar:update',
        payload,
        timestamp: Date.now(),
        id: 'msg-1',
      };

      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(payload);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('logs warning for unregistered message type', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const message: SyncMessage = {
        type: 'unknown:type',
        payload: {},
        timestamp: Date.now(),
        id: 'msg-1',
      };

      protocol.handleMessage(message);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SyncProtocol] No handler for message type:',
        'unknown:type'
      );

      consoleWarnSpy.mockRestore();
    });

    it('handles message without payload', () => {
      const handler = vi.fn();
      protocol.on('ping', handler);

      const message: SyncMessage = {
        type: 'ping',
        timestamp: Date.now(),
        id: 'msg-1',
      };

      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('does not throw if handler throws', () => {
      const handler = vi.fn(() => {
        throw new Error('Handler error');
      });
      protocol.on('error-event', handler);

      const message = protocol.createMessage('error-event', {});

      expect(() => protocol.handleMessage(message)).toThrow('Handler error');
    });
  });

  describe('createMessage', () => {
    it('creates message with type and payload', () => {
      const payload = { data: 'test' };
      const message = protocol.createMessage('test-type', payload);

      expect(message.type).toBe('test-type');
      expect(message.payload).toEqual(payload);
      expect(message.timestamp).toBeTypeOf('number');
      expect(message.id).toBeTypeOf('string');
    });

    it('creates message without payload', () => {
      const message = protocol.createMessage('ping');

      expect(message.type).toBe('ping');
      expect(message.payload).toBeUndefined();
      expect(message.timestamp).toBeTypeOf('number');
      expect(message.id).toBeTypeOf('string');
    });

    it('generates unique message IDs', () => {
      const message1 = protocol.createMessage('test');
      const message2 = protocol.createMessage('test');
      const message3 = protocol.createMessage('test');

      expect(message1.id).not.toBe(message2.id);
      expect(message2.id).not.toBe(message3.id);
      expect(message1.id).not.toBe(message3.id);
    });

    it('includes current timestamp', () => {
      const before = Date.now();
      const message = protocol.createMessage('test');
      const after = Date.now();

      expect(message.timestamp).toBeGreaterThanOrEqual(before);
      expect(message.timestamp).toBeLessThanOrEqual(after);
    });

    it('handles complex nested payloads', () => {
      const payload = {
        user: { id: 1, name: 'Test User' },
        settings: { theme: 'dark', notifications: true },
        data: [1, 2, 3],
      };

      const message = protocol.createMessage('settings:sync', payload);

      expect(message.payload).toEqual(payload);
    });
  });

  describe('isValidMessage', () => {
    it('validates correct message structure', () => {
      const validMessage: SyncMessage = {
        type: 'test',
        timestamp: Date.now(),
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(validMessage)).toBe(true);
    });

    it('validates message with payload', () => {
      const validMessage: SyncMessage = {
        type: 'test',
        payload: { data: 'test' },
        timestamp: Date.now(),
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(validMessage)).toBe(true);
    });

    it('rejects null', () => {
      expect(protocol.isValidMessage(null as any)).toBeFalsy();
    });

    it('rejects undefined', () => {
      expect(protocol.isValidMessage(undefined as any)).toBeFalsy();
    });

    it('rejects non-object values', () => {
      expect(protocol.isValidMessage('string')).toBe(false);
      expect(protocol.isValidMessage(123)).toBe(false);
      expect(protocol.isValidMessage(true)).toBe(false);
    });

    it('rejects message without type', () => {
      const invalidMessage = {
        timestamp: Date.now(),
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('rejects message with non-string type', () => {
      const invalidMessage = {
        type: 123,
        timestamp: Date.now(),
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('rejects message without timestamp', () => {
      const invalidMessage = {
        type: 'test',
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('rejects message with non-number timestamp', () => {
      const invalidMessage = {
        type: 'test',
        timestamp: '123456',
        id: 'msg-1',
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('rejects message without id', () => {
      const invalidMessage = {
        type: 'test',
        timestamp: Date.now(),
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('rejects message with non-string id', () => {
      const invalidMessage = {
        type: 'test',
        timestamp: Date.now(),
        id: 123,
      };

      expect(protocol.isValidMessage(invalidMessage)).toBe(false);
    });

    it('accepts message with extra fields', () => {
      const messageWithExtra = {
        type: 'test',
        timestamp: Date.now(),
        id: 'msg-1',
        extraField: 'extra',
      };

      expect(protocol.isValidMessage(messageWithExtra)).toBe(true);
    });

    it('validates payload can be any type', () => {
      const messages = [
        { type: 'test', timestamp: Date.now(), id: '1', payload: null },
        { type: 'test', timestamp: Date.now(), id: '2', payload: undefined },
        { type: 'test', timestamp: Date.now(), id: '3', payload: 'string' },
        { type: 'test', timestamp: Date.now(), id: '4', payload: 123 },
        { type: 'test', timestamp: Date.now(), id: '5', payload: { nested: 'object' } },
        { type: 'test', timestamp: Date.now(), id: '6', payload: [1, 2, 3] },
      ];

      messages.forEach((msg) => {
        expect(protocol.isValidMessage(msg)).toBe(true);
      });
    });
  });

  describe('ping/pong creation', () => {
    it('creates ping message', () => {
      const ping = protocol.createPing();

      expect(ping.type).toBe('ping');
      expect(ping.payload).toBeUndefined();
      expect(ping.timestamp).toBeTypeOf('number');
      expect(ping.id).toBeTypeOf('string');
    });

    it('creates pong message', () => {
      const pong = protocol.createPong();

      expect(pong.type).toBe('pong');
      expect(pong.payload).toBeUndefined();
      expect(pong.timestamp).toBeTypeOf('number');
      expect(pong.id).toBeTypeOf('string');
    });

    it('creates unique ping messages', () => {
      const ping1 = protocol.createPing();
      const ping2 = protocol.createPing();

      expect(ping1.id).not.toBe(ping2.id);
    });

    it('creates unique pong messages', () => {
      const pong1 = protocol.createPong();
      const pong2 = protocol.createPong();

      expect(pong1.id).not.toBe(pong2.id);
    });

    it('validates ping message structure', () => {
      const ping = protocol.createPing();
      expect(protocol.isValidMessage(ping)).toBe(true);
    });

    it('validates pong message structure', () => {
      const pong = protocol.createPong();
      expect(protocol.isValidMessage(pong)).toBe(true);
    });

    it('handles ping via handleMessage', () => {
      const handler = vi.fn();
      protocol.on('ping', handler);

      const ping = protocol.createPing();
      protocol.handleMessage(ping);

      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('handles pong via handleMessage', () => {
      const handler = vi.fn();
      protocol.on('pong', handler);

      const pong = protocol.createPong();
      protocol.handleMessage(pong);

      expect(handler).toHaveBeenCalledWith(undefined);
    });
  });

  describe('message ID generation', () => {
    it('generates ID with timestamp and random component', () => {
      const message = protocol.createMessage('test');
      const parts = message.id.split('-');

      expect(parts.length).toBe(2);
      expect(Number(parts[0])).toBeTypeOf('number');
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it('generates random component with correct format', () => {
      const message = protocol.createMessage('test');
      const randomPart = message.id.split('-')[1];

      // Should be base36 string
      expect(randomPart).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('integration scenarios', () => {
    it('handles sidebar update message', () => {
      const handler = vi.fn();
      protocol.on('sidebar:update', handler);

      const payload = {
        entries: [
          { id: '1', label: 'Dashboard', action: 'navigate', icon: 'home' },
          { id: '2', label: 'Notifications', action: 'notify', badge: 5 },
        ],
      };

      const message = protocol.createMessage('sidebar:update', payload);
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('handles settings sync message', () => {
      const handler = vi.fn();
      protocol.on('settings:sync', handler);

      const payload = {
        theme: 'dark',
        language: 'en',
        notifications: true,
      };

      const message = protocol.createMessage('settings:sync', payload);
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('handles theme change message', () => {
      const handler = vi.fn();
      protocol.on('theme:change', handler);

      const payload = {
        theme: 'matrix',
        variant: 'compact',
      };

      const message = protocol.createMessage('theme:change', payload);
      protocol.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('round-trips ping-pong', () => {
      const pingHandler = vi.fn();
      const pongHandler = vi.fn();

      protocol.on('ping', pingHandler);
      protocol.on('pong', pongHandler);

      const ping = protocol.createPing();
      protocol.handleMessage(ping);
      expect(pingHandler).toHaveBeenCalled();

      const pong = protocol.createPong();
      protocol.handleMessage(pong);
      expect(pongHandler).toHaveBeenCalled();
    });
  });
});
