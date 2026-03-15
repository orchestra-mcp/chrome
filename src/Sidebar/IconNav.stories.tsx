import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { IconNav } from './IconNav';
import { DEFAULT_VIEWS } from './defaultViews';
import type { SidebarView } from '../types/sidebar';

const meta = {
  title: 'Chrome/Sidebar/IconNav',
  component: IconNav,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '400px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    views: DEFAULT_VIEWS,
    activeId: 'explorer',
    onSelect: fn(),
  },
};

const viewsWithBadges: SidebarView[] = DEFAULT_VIEWS.map((v) => {
  if (v.id === 'extensions') return { ...v, badge: '3' };
  if (v.id === 'search') return { ...v, badge: '!' };
  return v;
});

export const WithBadges: Story = {
  args: {
    views: viewsWithBadges,
    activeId: 'explorer',
    onSelect: fn(),
  },
};

export const SettingsActive: Story = {
  args: {
    views: DEFAULT_VIEWS,
    activeId: 'settings',
    onSelect: fn(),
  },
};
