/**
 * Content script registrations — generated at build time.
 * Each entry describes a content script to register dynamically.
 */

export interface ContentScriptEntry {
  id: string
  matches: string[]
  js: string[]
  runAt: 'document_start' | 'document_idle' | 'document_end'
}

export const contentScripts: ContentScriptEntry[] = []
