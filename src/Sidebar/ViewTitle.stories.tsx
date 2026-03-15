import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ViewTitle } from './ViewTitle';
import type { SidebarAction } from '../types/sidebar';

const meta = {
  title: 'Chrome/Sidebar/ViewTitle',
  component: ViewTitle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '312px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ViewTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Explorer',
    actions: [],
    onAction: fn(),
    onSearch: fn(),
    hasSearch: false,
  },
};

const searchActions: SidebarAction[] = [
  { id: 'case', icon: 'bx-font', tooltip: 'Match Case', action: 'search.case' },
  { id: 'regex', icon: 'bx-code-alt', tooltip: 'Use Regex', action: 'search.regex' },
];

export const WithActions: Story = {
  args: {
    title: 'Search',
    actions: searchActions,
    onAction: fn(),
    onSearch: fn(),
    hasSearch: false,
  },
};

export const WithSearch: Story = {
  args: {
    title: 'Explorer',
    actions: [],
    onAction: fn(),
    onSearch: fn(),
    hasSearch: true,
  },
};
