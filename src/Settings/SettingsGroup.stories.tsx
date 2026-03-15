import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { SettingsGroup } from './SettingsGroup';
import type { SettingGroup, Setting } from '../types/settings';

const meta = {
  title: 'Chrome/Settings/SettingsGroup',
  component: SettingsGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const editorGroup: SettingGroup = {
  id: 'editor',
  label: 'Editor',
  description: 'Editor appearance and behavior settings',
  order: 1,
  collapsible: true,
};

const editorSettings: Setting[] = [
  {
    key: 'editor.fontSize',
    label: 'Font Size',
    description: 'Font size in pixels',
    type: 'number',
    default: 14,
    group: 'editor',
    order: 1,
    plugin_id: 'core',
  },
  {
    key: 'editor.wordWrap',
    label: 'Word Wrap',
    type: 'boolean',
    default: true,
    group: 'editor',
    order: 2,
    plugin_id: 'core',
  },
];

export const Default: Story = {
  args: {
    group: editorGroup,
    settings: editorSettings,
    values: { 'editor.fontSize': 14, 'editor.wordWrap': true },
    onChange: fn(),
  },
};

export const Collapsed: Story = {
  args: {
    group: { ...editorGroup, collapsed: true },
    settings: editorSettings,
    values: { 'editor.fontSize': 14, 'editor.wordWrap': true },
    onChange: fn(),
  },
};

export const Empty: Story = {
  args: {
    group: { ...editorGroup, label: 'Empty Group' },
    settings: [],
    values: {},
    onChange: fn(),
  },
};
