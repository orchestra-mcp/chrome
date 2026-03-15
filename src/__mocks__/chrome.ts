/**
 * Chrome API mock for testing
 * Re-exports the shared chrome mock from resources/chrome/src/__mocks__/chrome.ts
 * This file exists so that package tests can import from '../__mocks__/chrome'
 * using the same relative path convention as the original test files.
 */

export { chrome } from '../../../../../resources/chrome/src/__mocks__/chrome';
