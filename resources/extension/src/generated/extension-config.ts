/**
 * Extension configuration — generated at build time by the browser plugin.
 * Defaults here are used during development.
 */
export const extensionConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
  wsBaseUrl: 'ws://localhost:8080/ws',
  version: '0.1.0',
} as const

export type ExtensionConfig = typeof extensionConfig
