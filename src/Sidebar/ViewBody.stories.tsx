import type { Meta, StoryObj } from '@storybook/react';
import { ViewBody } from './ViewBody';

const meta = {
  title: 'Chrome/Sidebar/ViewBody',
  component: ViewBody,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '312px', height: '360px', backgroundColor: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ViewBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explorer: Story = {
  args: {
    activeViewId: 'explorer',
    searchQuery: '',
  },
};

export const Search: Story = {
  args: {
    activeViewId: 'search',
    searchQuery: 'useEffect',
  },
};

export const Extensions: Story = {
  args: {
    activeViewId: 'extensions',
    searchQuery: '',
  },
};

export const Settings: Story = {
  args: {
    activeViewId: 'settings',
    searchQuery: '',
  },
};

export const SettingsWithContent: Story = {
  args: {
    activeViewId: 'settings',
    searchQuery: '',
    settingsContent: (
      <div style={{ padding: '1rem', color: 'var(--color-fg)' }}>
        <h3 style={{ color: 'var(--color-fg-bright)', marginBottom: '0.5rem' }}>Custom Settings</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-fg-muted)' }}>
          Settings panel content rendered via settingsContent prop
        </p>
      </div>
    ),
  },
};
