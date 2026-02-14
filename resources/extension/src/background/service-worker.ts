/**
 * Chrome Manifest V3 service worker for Orchestra.
 * Routes messages between sidepanel, content scripts, and Go backend.
 */

import { extensionConfig } from '@/generated/extension-config'
import { contentScripts } from '@/generated/content-scripts'
import { CONTENT_MESSAGES } from '@/content/messages'

const API = extensionConfig.apiBaseUrl

// Open side panel when the extension action icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

// Keyboard shortcut handler (e.g., Cmd+Shift+O)
chrome.commands?.onCommand?.addListener(async (command) => {
  if (command === 'toggle-ide') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id })
    }
  }
})

// Track sidepanel open/close via port connection
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidepanel') return
  console.log('[Orchestra] Sidepanel opened')
  port.onDisconnect.addListener(() => {
    console.log('[Orchestra] Sidepanel closed')
  })
})

// Register dynamic content scripts from plugins
async function registerContentScripts(): Promise<void> {
  if (contentScripts.length === 0) return
  try {
    await chrome.scripting.unregisterContentScripts()
    await chrome.scripting.registerContentScripts(
      contentScripts.map((s) => ({
        id: s.id,
        matches: s.matches,
        js: s.js,
        runAt: s.runAt,
      })),
    )
  } catch (err) {
    console.error('[Orchestra] Failed to register content scripts:', err)
  }
}

registerContentScripts()

// Fetch helper for Go backend
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

// Message router: sidepanel + content scripts -> Go backend
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type } = message

  if (type === CONTENT_MESSAGES.PING) {
    sendResponse({ ok: true })
    return true
  }

  if (type === CONTENT_MESSAGES.GET_PROJECTS) {
    apiFetch<{ projects: unknown[] }>('/projects')
      .then((data) => sendResponse({ projects: data.projects ?? [] }))
      .catch(() => sendResponse({ projects: [] }))
    return true
  }

  if (type === CONTENT_MESSAGES.GET_EPICS) {
    const slug = message.project as string
    apiFetch<{ epics: unknown[] }>(`/projects/${slug}/epics`)
      .then((data) => sendResponse({ epics: data.epics ?? [] }))
      .catch(() => sendResponse({ epics: [] }))
    return true
  }

  if (type === CONTENT_MESSAGES.GET_STORIES) {
    const { project, epic } = message as { project: string; epic: string }
    apiFetch<{ stories: unknown[] }>(`/projects/${project}/epics/${epic}/stories`)
      .then((data) => sendResponse({ stories: data.stories ?? [] }))
      .catch(() => sendResponse({ stories: [] }))
    return true
  }

  if (type === CONTENT_MESSAGES.IMPORT_ISSUE) {
    const { issue, project, epic, story, mode } = message
    apiFetch<{ taskId?: string }>('/tasks/import', {
      method: 'POST',
      body: JSON.stringify({ issue, project, epic, story, mode }),
    })
      .then((data) => sendResponse({ success: true, taskId: data.taskId }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }))
    return true
  }

  return false
})

console.log('[Orchestra] Background service worker started')
