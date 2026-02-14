/**
 * Content script -- detects issue pages on supported platforms and shows
 * a floating "Import to Orchestra" button. Communicates with the background
 * service worker via chrome.runtime.sendMessage using CONTENT_MESSAGES.
 */

import { CONTENT_MESSAGES } from './messages'

// -- Issue detection ------------------------------------------------------

interface DetectedIssue {
  service: 'github' | 'gitlab' | 'bitbucket' | 'jira' | 'linear'
  issueId: string
  url: string
}

interface IssuePattern {
  service: DetectedIssue['service']
  regex: RegExp
  extractId: (match: RegExpMatchArray) => string
}

const PATTERNS: IssuePattern[] = [
  {
    service: 'github',
    regex: /github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)/,
    extractId: (m) => `${m[1]}/${m[2]}#${m[3]}`,
  },
  {
    service: 'gitlab',
    regex: /gitlab\.com\/([\w./-]+)\/-\/issues\/(\d+)/,
    extractId: (m) => `${m[1]}#${m[2]}`,
  },
  {
    service: 'bitbucket',
    regex: /bitbucket\.org\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)/,
    extractId: (m) => `${m[1]}/${m[2]}#${m[3]}`,
  },
  {
    service: 'jira',
    regex: /atlassian\.net\/browse\/([A-Z][\w]+-\d+)/,
    extractId: (m) => m[1],
  },
  {
    service: 'jira',
    regex: /atlassian\.net\/jira\/software\/.*selectedIssue=([A-Z][\w]+-\d+)/,
    extractId: (m) => m[1],
  },
  {
    service: 'linear',
    regex: /linear\.app\/[\w-]+\/issue\/([A-Z][\w]*-\d+)/,
    extractId: (m) => m[1],
  },
]

function detectIssue(url: string): DetectedIssue | null {
  for (const p of PATTERNS) {
    const match = url.match(p.regex)
    if (match) return { service: p.service, issueId: p.extractId(match), url }
  }
  return null
}

// -- Floating button UI ---------------------------------------------------

let currentIssue: DetectedIssue | null = null
let container: HTMLDivElement | null = null

const SERVICE_COLORS: Record<string, string> = {
  github: '#24292e',
  gitlab: '#fc6d26',
  bitbucket: '#0052CC',
  jira: '#0052CC',
  linear: '#5E6AD2',
}

function createContainer(): HTMLDivElement {
  const el = document.createElement('div')
  el.id = 'orchestra-import-helper'
  el.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'right:20px',
    'z-index:2147483647',
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
    'font-size:13px',
  ].join(';')
  document.body.appendChild(el)
  return el
}

function renderButton(issue: DetectedIssue): void {
  if (!container) container = createContainer()
  const color = SERVICE_COLORS[issue.service] ?? '#333'

  container.innerHTML = `
    <button id="orchestra-import-btn" style="
      display:flex;align-items:center;gap:8px;padding:8px 16px;
      border:none;border-radius:8px;background:${color};color:#fff;
      font-size:13px;font-weight:500;cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      Import ${issue.issueId} to Orchestra
    </button>
  `

  container.querySelector('#orchestra-import-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage(
      { type: CONTENT_MESSAGES.IMPORT_ISSUE, issue },
      (res) => {
        if (res?.success) console.log('[Orchestra] Imported:', res.taskId)
        else console.warn('[Orchestra] Import failed:', res?.error)
      },
    )
  })
}

function removeHelper(): void {
  container?.remove()
  container = null
  currentIssue = null
}

// -- URL change detection -------------------------------------------------

let lastUrl = window.location.href

function checkUrl(): void {
  const issue = detectIssue(window.location.href)
  if (issue) {
    if (currentIssue?.issueId === issue.issueId) return
    currentIssue = issue
    removeHelper()
    renderButton(issue)
  } else if (currentIssue) {
    removeHelper()
  }
}

function startUrlWatcher(): void {
  window.addEventListener('popstate', checkUrl)
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href
      checkUrl()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

// -- Message listener -----------------------------------------------------

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === CONTENT_MESSAGES.PING) {
    sendResponse({ ok: true })
    return true
  }
  return false
})

// -- Init -----------------------------------------------------------------

checkUrl()
startUrlWatcher()
console.log('[Orchestra] Content script loaded')
