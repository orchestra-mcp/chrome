import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { SidebarNav } from './SidebarNav';
import type { SidebarEntry } from '../types/sidebar';

const meta = {
  title: 'Chrome/Sidebar/SidebarNav',
  component: SidebarNav,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px', height: '400px', backgroundColor: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseEntries: SidebarEntry[] = [
  { id: 'files', title: 'Files', icon: '?', order: 1, collapsible: false, plugin_id: 'core' },
  { id: 'search', title: 'Search', icon: '?', order: 2, collapsible: false, plugin_id: 'core' },
  { id: 'git', title: 'Git', order: 3, collapsible: false, plugin_id: 'core' },
];

export const Empty: Story = {
  args: {
    entries: [],
    onEntryClick: fn(),
  },
};

export const Default: Story = {
  args: {
    entries: baseEntries,
    onEntryClick: fn(),
  },
};

export const WithActiveItem: Story = {
  args: {
    entries: baseEntries,
    activeId: 'files',
    onEntryClick: fn(),
  },
};

export const WithBadges: Story = {
  args: {
    entries: [
      { id: 'files', title: 'Files', icon: '?', order: 1, badge: 3, collapsible: false, plugin_id: 'core' },
      { id: 'search', title: 'Search', order: 2, badge: 12, collapsible: false, plugin_id: 'core' },
      { id: 'git', title: 'Git', order: 3, collapsible: false, plugin_id: 'core' },
    ],
    onEntryClick: fn(),
  },
};

export const WithNestedSections: Story = {
  args: {
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
          { id: 'utils', title: 'utils', order: 3, collapsible: false, plugin_id: 'core' },
        ],
      },
      { id: 'package-json', title: 'package.json', order: 2, collapsible: false, plugin_id: 'core' },
    ],
    onEntryClick: fn(),
  },
};

export const ManyItems: Story = {
  args: {
    entries: Array.from({ length: 15 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i + 1}`,
      order: i,
      collapsible: false,
      plugin_id: 'core',
    })),
    activeId: 'item-4',
    onEntryClick: fn(),
  },
};
