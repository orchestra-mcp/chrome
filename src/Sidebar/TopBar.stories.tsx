import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TopBar } from './TopBar';

const meta = {
  title: 'Chrome/Sidebar/TopBar',
  component: TopBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px', backgroundColor: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: {
    connected: true,
  },
};

export const Disconnected: Story = {
  args: {
    connected: false,
  },
};

export const WithQuickAction: Story = {
  args: {
    connected: true,
    onQuickAction: fn(),
  },
};

export const DisconnectedWithAction: Story = {
  args: {
    connected: false,
    onQuickAction: fn(),
  },
};
