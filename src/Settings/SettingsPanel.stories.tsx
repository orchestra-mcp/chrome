import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { SettingsPanel } from './SettingsPanel';
import type { SettingsState } from '../types/settings';

const meta = {
  title: 'Chrome/Settings/SettingsPanel',
  component: SettingsPanel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleState: SettingsState = {
  groups: [
    { id: 'general', label: 'General', order: 1, collapsible: true },
    { id: 'editor', label: 'Editor', description: 'Editor settings', order: 2, icon: 'E', collapsible: true },
  ],
  settings: [
    {
      key: 'general.apiUrl',
      label: 'API URL',
      description: 'Base URL for the API',
      placeholder: 'https://api.orchestra.dev',
      type: 'string',
      default: '',
      group: 'general',
      order: 1,
      plugin_id: 'core',
    },
    {
      key: 'general.sync',
      label: 'Auto Sync',
      description: 'Automatically sync settings with the desktop app',
      type: 'boolean',
      default: true,
      group: 'general',
      order: 2,
      plugin_id: 'core',
    },
    {
      key: 'editor.fontSize',
      label: 'Font Size',
      type: 'range',
      default: 14,
      group: 'editor',
      order: 1,
      validation: { min: 8, max: 32, step: 1 },
      plugin_id: 'core',
    },
    {
      key: 'editor.theme',
      label: 'Color Theme',
      type: 'select',
      default: 'dark',
      group: 'editor',
      order: 2,
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Matrix', value: 'matrix' },
      ],
      plugin_id: 'core',
    },
  ],
};

export const WithSettings: Story = {
  args: {
    state: sampleState,
    values: {
      'general.apiUrl': 'https://api.orchestra.dev',
      'general.sync': true,
      'editor.fontSize': 14,
      'editor.theme': 'dark',
    },
    onChange: fn(),
  },
};

export const Empty: Story = {
  args: {
    state: { groups: [], settings: [] },
    values: {},
    onChange: fn(),
  },
};

export const Syncing: Story = {
  args: {
    state: sampleState,
    values: {
      'general.apiUrl': 'https://api.orchestra.dev',
      'general.sync': true,
      'editor.fontSize': 14,
      'editor.theme': 'dark',
    },
    onChange: fn(),
    syncing: true,
  },
};
