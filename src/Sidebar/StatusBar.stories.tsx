import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from './StatusBar';

const meta = {
  title: 'Chrome/Sidebar/StatusBar',
  component: StatusBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: {
    connected: true,
    pluginCount: 5,
    syncing: false,
  },
};

export const Disconnected: Story = {
  args: {
    connected: false,
    pluginCount: 0,
    syncing: false,
  },
};

export const Syncing: Story = {
  args: {
    connected: true,
    pluginCount: 3,
    syncing: true,
  },
};
