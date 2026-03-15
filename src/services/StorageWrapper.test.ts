/**
 * Tests for Chrome Storage API wrapper
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageWrapper } from './StorageWrapper';
import { chrome } from '../__mocks__/chrome';

describe('StorageWrapper', () => {
  let storage: StorageWrapper;

  beforeEach(() => {
    chrome._resetAll();
    vi.restoreAllMocks();
    storage = new StorageWrapper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('retrieves a stored value', async () => {
      chrome.storage.local._setData({ key1: 'value1' });
      const result = await storage.get<string>('key1');
      expect(result).toBe('value1');
    });

    it('returns null for non-existent key', async () => {
      const result = await storage.get('nonexistent');
      expect(result).toBeNull();
    });

    it('retrieves complex objects', async () => {
      const testObj = { foo: 'bar', nested: { value: 42 } };
      chrome.storage.local._setData({ myObj: testObj });
      const result = await storage.get('myObj');
      expect(result).toEqual(testObj);
    });

    it('handles type parameter correctly', async () => {
      chrome.storage.local._setData({ count: 42 });
      const result = await storage.get<number>('count');
      expect(result).toBe(42);
      expect(typeof result).toBe('number');
    });
  });

  describe('set', () => {
    it('stores a value successfully', async () => {
      await storage.set('key1', 'value1');
      const data = chrome.storage.local._getData();
      expect(data.key1).toBe('value1');
    });

    it('stores complex objects', async () => {
      const testObj = { foo: 'bar', arr: [1, 2, 3] };
      await storage.set('myObj', testObj);
      const data = chrome.storage.local._getData();
      expect(data.myObj).toEqual(testObj);
    });

    it('overwrites existing values', async () => {
      chrome.storage.local._setData({ key1: 'old' });
      await storage.set('key1', 'new');
      const data = chrome.storage.local._getData();
      expect(data.key1).toBe('new');
    });

    it('handles errors from chrome.runtime.lastError', async () => {
      const mockError = { message: 'Storage quota exceeded' };
      vi.spyOn(chrome.storage.local, 'set').mockImplementation(
        (items: Record<string, any>, callback?: () => void) => {
          chrome.runtime.lastError = mockError;
          callback?.();
        },
      );

      await expect(storage.set('key', 'value')).rejects.toEqual(mockError);
    });
  });

  describe('remove', () => {
    it('removes a single key', async () => {
      chrome.storage.local._setData({ key1: 'value1', key2: 'value2' });
      await storage.remove('key1');
      const data = chrome.storage.local._getData();
      expect(data.key1).toBeUndefined();
      expect(data.key2).toBe('value2');
    });

    it('handles removing non-existent key', async () => {
      await expect(storage.remove('nonexistent')).resolves.not.toThrow();
    });

    it('handles errors from chrome.runtime.lastError', async () => {
      const mockError = { message: 'Remove failed' };
      vi.spyOn(chrome.storage.local, 'remove').mockImplementation(
        (keys: string | string[], callback?: () => void) => {
          chrome.runtime.lastError = mockError;
          callback?.();
        },
      );

      await expect(storage.remove('key')).rejects.toEqual(mockError);
    });
  });

  describe('clear', () => {
    it('removes all stored data', async () => {
      chrome.storage.local._setData({ key1: 'value1', key2: 'value2' });
      await storage.clear();
      const data = chrome.storage.local._getData();
      expect(Object.keys(data)).toHaveLength(0);
    });

    it('handles errors from chrome.runtime.lastError', async () => {
      const mockError = { message: 'Clear failed' };
      vi.spyOn(chrome.storage.local, 'clear').mockImplementation((callback?: () => void) => {
        chrome.runtime.lastError = mockError;
        callback?.();
      });

      await expect(storage.clear()).rejects.toEqual(mockError);
    });
  });

  describe('getAll', () => {
    it('retrieves all stored data', async () => {
      const testData = { key1: 'value1', key2: 'value2', key3: 42 };
      chrome.storage.local._setData(testData);
      const result = await storage.getAll();
      expect(result).toEqual(testData);
    });

    it('returns empty object when storage is empty', async () => {
      const result = await storage.getAll();
      expect(result).toEqual({});
    });
  });

  describe('onChanged', () => {
    it('listens to storage changes', async () => {
      const callback = vi.fn();

      storage.onChanged(callback);

      await storage.set('key1', 'value1');

      // Wait for async callback
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith({
        key1: {
          oldValue: undefined,
          newValue: 'value1',
        },
      });
    });

    it('receives changes when updating existing values', async () => {
      chrome.storage.local._setData({ key1: 'old' });
      const callback = vi.fn();

      storage.onChanged(callback);

      await storage.set('key1', 'new');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith({
        key1: {
          oldValue: 'old',
          newValue: 'new',
        },
      });
    });

    it('only triggers for local storage changes', async () => {
      const callback = vi.fn();
      storage.onChanged(callback);

      await storage.set('key1', 'value1');
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should be called once for the 'local' storage change
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
