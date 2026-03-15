import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Sidebar } from './Sidebar';
import type { SidebarState } from '../types/sidebar';

const meta = {
  title: 'Chrome/Sidebar/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px', height: '600px', border: '1px solid var(--color-border)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleState: SidebarState = {
  entries: [
    { id: 'files', title: 'Files', icon: '?', order: 1, collapsible: false, plugin_id: 'core' },
    { id: 'search', title: 'Search', order: 2, collapsible: false, plugin_id: 'core' },
    { id: 'git', title: 'Git', badge: 3, order: 3, collapsible: false, plugin_id: 'core' },
  ],
  active: 'files',
};

export const Default: Story = {
  args: {
    connected: false,
  },
};

export const Connected: Story = {
  args: {
    connected: true,
    initialState: sampleState,
    notificationsCount: 5,
  },
};

export const Disconnected: Story = {
  args: {
    connected: false,
    initialState: sampleState,
  },
};

export const Syncing: Story = {
  args: {
    connected: true,
    syncing: true,
    initialState: sampleState,
  },
};

export const WithQuickAction: Story = {
  args: {
    connected: true,
    initialState: sampleState,
    onQuickAction: fn(),
    notificationsCount: 2,
  },
};

export const WithNestedNavigation: Story = {
  args: {
    connected: true,
    initialState: {
      entries: [
        {
          id: 'src',
          title: 'src',
          icon: '?',
          order: 1,
          collapsible: true,
          plugin_id: 'core',
          sections: [
            { id: 'components', title: 'components', order: 1, collapsible: false, plugin_id: 'core' },
            { id: 'hooks', title: 'hooks', order: 2, collapsible: false, plugin_id: 'core' },
          ],
        },
        { id: 'package-json', title: 'package.json', order: 2, collapsible: false, plugin_id: 'core' },
      ],
      active: 'components',
    },
  },
};
