import { useState, useEffect, Suspense, lazy } from 'react'
import type { FC } from 'react'
import { pluginViews } from '@/generated/plugin-views'
import type { PluginView } from '@/generated/plugin-views'
import { LayoutDashboard, Plug } from 'lucide-react'

// -- Types ----------------------------------------------------------------

type ViewId = string

interface ActivityItemProps {
  icon: React.ReactNode
  active: boolean
  label: string
  onClick: () => void
}

// -- Built-in views -------------------------------------------------------

const HomeView: FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
    <LayoutDashboard className="h-10 w-10" />
    <p className="text-sm">Select a view from the activity bar</p>
  </div>
)

// -- Activity bar item ----------------------------------------------------

function ActivityItem({ icon, active, label, onClick }: ActivityItemProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-zinc-800 text-zinc-100'
          : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300'
      }`}
    >
      {active && (
        <div className="absolute left-0.5 h-4 w-[2px] rounded-full bg-blue-500" />
      )}
      {icon}
    </button>
  )
}

// -- Lazy loader for plugin components ------------------------------------

const lazyCache = new Map<string, FC>()

function getPluginComponent(view: PluginView): FC {
  if (lazyCache.has(view.id)) return lazyCache.get(view.id)!
  const LazyComponent = lazy(async () => ({ default: view.component }))
  const Wrapper: FC = () => (
    <Suspense fallback={<ViewLoading />}>
      <LazyComponent />
    </Suspense>
  )
  lazyCache.set(view.id, Wrapper)
  return Wrapper
}

function ViewLoading() {
  return (
    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
      Loading...
    </div>
  )
}

// -- Main app shell -------------------------------------------------------

export function App() {
  const [activeView, setActiveView] = useState<ViewId>('home')
  const [connected, setConnected] = useState(false)

  // Connect port so background knows sidepanel is open
  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'sidepanel' })
    return () => port.disconnect()
  }, [])

  // Ping backend to check connection
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch('http://localhost:8080/api/health')
        setConnected(res.ok)
      } catch {
        setConnected(false)
      }
    }
    checkConnection()
    const interval = setInterval(checkConnection, 15_000)
    return () => clearInterval(interval)
  }, [])

  // Resolve active view component
  const activePlugin = pluginViews.find((v) => v.id === activeView)
  const ActiveComponent = activePlugin
    ? getPluginComponent(activePlugin)
    : HomeView

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Activity bar */}
      <div className="flex w-11 shrink-0 flex-col items-center border-r border-zinc-800 bg-zinc-900 pt-2 gap-1">
        <ActivityItem
          icon={<LayoutDashboard className="h-[18px] w-[18px]" />}
          active={activeView === 'home'}
          label="Home"
          onClick={() => setActiveView('home')}
        />

        {pluginViews.map((view) => (
          <ActivityItem
            key={view.id}
            icon={<Plug className="h-[18px] w-[18px]" />}
            active={activeView === view.id}
            label={view.label}
            onClick={() => setActiveView(view.id)}
          />
        ))}

        <div className="flex-1" />

        {/* Connection indicator */}
        <div className="mb-3 flex items-center justify-center">
          <div
            className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}
            title={connected ? 'Connected' : 'Offline'}
          />
        </div>
      </div>

      {/* Sidebar panel content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <ActiveComponent />
        </div>

        {/* Status bar */}
        <div className="flex h-5 items-center border-t border-zinc-800 bg-zinc-900 px-2 text-[10px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            <span>{connected ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="flex-1" />
          <span>Orchestra</span>
        </div>
      </div>
    </div>
  )
}
