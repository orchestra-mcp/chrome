import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { SettingInput } from './SettingInput';
import type { Setting } from '../types/settings';

const meta = {
  title: 'Chrome/Settings/SettingInput',
  component: SettingInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const stringSetting: Setting = {
  key: 'api.url',
  label: 'API URL',
  description: 'Base URL for the Orchestra API',
  placeholder: 'https://api.orchestra.dev',
  type: 'string',
  default: '',
  group: 'general',
  order: 1,
  plugin_id: 'core',
};

export const StringInput: Story = {
  args: {
    setting: stringSetting,
    value: 'https://api.orchestra.dev',
    onChange: fn(),
  },
};

const boolSetting: Setting = {
  key: 'editor.wordWrap',
  label: 'Word Wrap',
  description: 'Enable word wrapping in the editor',
  type: 'boolean',
  default: true,
  group: 'editor',
  order: 1,
  plugin_id: 'core',
};

export const BooleanInput: Story = {
  args: {
    setting: boolSetting,
    value: true,
    onChange: fn(),
  },
};

const selectSetting: Setting = {
  key: 'editor.theme',
  label: 'Theme',
  description: 'Select the editor color theme',
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
};

export const SelectInput: Story = {
  args: {
    setting: selectSetting,
    value: 'dark',
    onChange: fn(),
  },
};

const rangeSetting: Setting = {
  key: 'editor.fontSize',
  label: 'Font Size',
  description: 'Editor font size in pixels',
  type: 'range',
  default: 14,
  group: 'editor',
  order: 3,
  validation: { min: 8, max: 32, step: 1 },
  plugin_id: 'core',
};

export const RangeInput: Story = {
  args: {
    setting: rangeSetting,
    value: 14,
    onChange: fn(),
  },
};

const colorSetting: Setting = {
  key: 'ui.accentColor',
  label: 'Accent Color',
  description: 'Primary accent color for the UI',
  type: 'color',
  default: '#6366f1',
  group: 'ui',
  order: 1,
  plugin_id: 'core',
};

export const ColorInput: Story = {
  args: {
    setting: colorSetting,
    value: '#6366f1',
    onChange: fn(),
  },
};
