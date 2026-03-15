import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TabBar } from './TabBar';
import type { ManagedTab } from '../types/tabs';

const meta = {
  title: 'Chrome/Navigation/TabBar',
  component: TabBar,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', backgroundColor: '#1e1e1e' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ------------------------------------------------------------------
// Empty
// ------------------------------------------------------------------

export const Empty: Story = {
  args: {
    tabs: [],
    activeTabId: undefined,
    onActivate: fn(),
    onClose: fn(),
  },
};

// ------------------------------------------------------------------
// With Tabs
// ------------------------------------------------------------------

const sampleTabs: ManagedTab[] = [
  {
    chromeTabId: 101,
    url: 'https://github.com',
    title: 'GitHub',
    favIconUrl: 'https://github.com/favicon.ico',
    pluginId: 'core',
    pinned: false,
    active: true,
  },
  {
    chromeTabId: 102,
    url: 'https://docs.google.com',
    title: 'Google Docs',
    favIconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    pluginId: 'core',
    pinned: false,
    active: false,
  },
  {
    chromeTabId: 103,
    url: 'https://stackoverflow.com',
    title: 'Stack Overflow',
    pluginId: 'core',
    pinned: false,
    active: false,
  },
];

export const WithTabs: Story = {
  args: {
    tabs: sampleTabs,
    activeTabId: 101,
    onActivate: fn(),
    onClose: fn(),
  },
};

// ------------------------------------------------------------------
// With Pinned Tab
// ------------------------------------------------------------------

const tabsWithPinned: ManagedTab[] = [
  {
    chromeTabId: 201,
    url: 'https://gmail.com',
    title: 'Gmail',
    favIconUrl: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
    pluginId: 'core',
    pinned: true,
    active: false,
  },
  {
    chromeTabId: 202,
    url: 'https://github.com/pulls',
    title: 'Pull Requests',
    favIconUrl: 'https://github.com/favicon.ico',
    pluginId: 'core',
    pinned: false,
    active: true,
  },
];

export const WithPinnedTab: Story = {
  args: {
    tabs: tabsWithPinned,
    activeTabId: 202,
    onActivate: fn(),
    onClose: fn(),
  },
};

// ------------------------------------------------------------------
// Many Tabs (overflow)
// ------------------------------------------------------------------

const manyTabs: ManagedTab[] = Array.from({ length: 10 }, (_, i) => ({
  chromeTabId: 300 + i,
  url: `https://example-${i}.com`,
  title: `Tab ${i + 1}`,
  pluginId: 'core',
  pinned: false,
  active: i === 3,
}));

export const ManyTabs: Story = {
  args: {
    tabs: manyTabs,
    activeTabId: 303,
    onActivate: fn(),
    onClose: fn(),
  },
};
