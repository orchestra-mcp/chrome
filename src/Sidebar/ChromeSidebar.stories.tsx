import type { Meta, StoryObj } from '@storybook/react';
import { useState, type FC } from 'react';
import { IconNav } from './IconNav';
import { SidebarHeader } from './SidebarHeader';
import { ViewTitle } from './ViewTitle';
import { StatusBar } from './StatusBar';
import { ViewBody } from './ViewBody';
import { DEFAULT_VIEWS } from './defaultViews';
import './Sidebar.css';

/**
 * Full sidebar composition showing all sub-components together.
 * Uses IconNav + SidebarHeader + ViewTitle + ViewBody + StatusBar.
 */
const ChromeSidebar: FC<{ connected: boolean }> = ({ connected }) => {
  const [activeId, setActiveId] = useState('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const activeView = DEFAULT_VIEWS.find((v) => v.id === activeId) ?? DEFAULT_VIEWS[0];

  return (
    <div className="chrome-sidebar">
      <SidebarHeader connected={connected} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <IconNav
          views={DEFAULT_VIEWS}
          activeId={activeId}
          onSelect={setActiveId}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <ViewTitle
            title={activeView.title}
            actions={activeView.actions}
            onAction={() => {}}
            onSearch={setSearchQuery}
            hasSearch={activeView.hasSearch}
          />

          <div className="chrome-view-body">
            <ViewBody
              activeViewId={activeId}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>

      <StatusBar connected={connected} pluginCount={connected ? 5 : 0} />
    </div>
  );
};

const meta = {
  title: 'Chrome/Composed/FullSidebar',
  component: ChromeSidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '600px', border: '1px solid var(--color-border)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChromeSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { connected: true },
};

export const Disconnected: Story = {
  args: { connected: false },
};
