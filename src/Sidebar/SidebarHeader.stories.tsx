import type { Meta, StoryObj } from '@storybook/react';
import { SidebarHeader } from './SidebarHeader';

const meta = {
  title: 'Chrome/Sidebar/SidebarHeader',
  component: SidebarHeader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { connected: true },
};

export const Disconnected: Story = {
  args: { connected: false },
};
