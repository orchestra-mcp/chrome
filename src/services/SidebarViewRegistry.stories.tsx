import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect, type FC } from 'react';
import { IconNav } from '../Sidebar/IconNav';
import { SidebarHeader } from '../Sidebar/SidebarHeader';
import { ViewTitle } from '../Sidebar/ViewTitle';
import { StatusBar } from '../Sidebar/StatusBar';
import { BoxIcon } from '@orchestra-mcp/icons';
import { sidebarViewRegistry } from './SidebarViewRegistry';
import { useSidebarViews, _resetActiveId } from '../hooks/useSidebarViews';
import { DEFAULT_VIEWS } from '../Sidebar/defaultViews';
import type { SidebarView } from '../types/sidebar';

/**
 * Interactive demo that shows the SidebarViewRegistry driving
 * a live sidebar via the useSidebarViews hook.
 *
 * Buttons below the sidebar let you register/unregister plugin
 * views and update badges in real time.
 */
const RegistryDemo: FC = () => {
  const { views, activeId, setActive, activeView } = useSidebarViews();
  const [log, setLog] = useState<string[]>([]);

  // Reset registry + active id when story mounts
  useEffect(() => {
    _resetActiveId();
    sidebarViewRegistry.clear();
    for (const view of DEFAULT_VIEWS) {
      sidebarViewRegistry.register(view);
    }
  }, []);

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));
  };

  const pluginView: SidebarView = {
    id: 'git',
    title: 'Source Control',
    icon: 'bx-git-branch',
    order: 4,
    visible: true,
    actions: [
      { id: 'git-refresh', icon: 'bx-refresh', tooltip: 'Refresh', action: 'git.refresh' },
    ],
    hasSearch: false,
  };

  const handleRegister = () => {
    if (sidebarViewRegistry.has('git')) {
      addLog('git view already registered');
      return;
    }
    sidebarViewRegistry.register(pluginView);
    addLog('Registered "Source Control" view');
  };

  const handleUnregister = () => {
    if (!sidebarViewRegistry.has('git')) {
      addLog('git view not registered');
      return;
    }
    sidebarViewRegistry.unregister('git');
    addLog('Unregistered "Source Control" view');
  };

  const handleBadge = () => {
    const current = sidebarViewRegistry.get('extensions')?.badge;
    const next = current ? undefined : '3';
    sidebarViewRegistry.updateBadge('extensions', next);
    addLog(next ? 'Set extensions badge to 3' : 'Cleared extensions badge');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar preview */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <IconNav views={views} activeId={activeId} onSelect={setActive} />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <SidebarHeader connected />

          {activeView && (
            <ViewTitle
              title={activeView.title}
              actions={activeView.actions}
              onAction={(a) => addLog(`Action: ${a}`)}
              onSearch={() => {}}
              hasSearch={activeView.hasSearch}
            />
          )}

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-fg-muted)',
            }}
          >
            {activeView ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <BoxIcon name={activeView.icon} size={40} color="var(--color-fg-dim)" />
                <p style={{ marginTop: '12px', fontSize: '14px' }}>
                  {activeView.title} view
                </p>
                <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-fg-dim)' }}>
                  id: {activeView.id} | order: {activeView.order}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '14px' }}>No active view</p>
            )}
          </div>

          <StatusBar connected pluginCount={views.length} />
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-alt)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <StoryButton onClick={handleRegister}>Register git view</StoryButton>
          <StoryButton onClick={handleUnregister}>Unregister git view</StoryButton>
          <StoryButton onClick={handleBadge}>Toggle extensions badge</StoryButton>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-fg-dim)', fontFamily: 'monospace' }}>
          {log.length === 0 ? 'Click a button above to interact with the registry' : null}
          {log.map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StoryButton: FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '4px 10px',
      fontSize: '12px',
      border: '1px solid var(--color-border)',
      borderRadius: '4px',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

const meta = {
  title: 'Chrome/Services/SidebarViewRegistry',
  component: RegistryDemo,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '650px', border: '1px solid var(--color-border)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegistryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
