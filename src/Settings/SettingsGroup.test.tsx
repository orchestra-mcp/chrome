import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsGroup } from './SettingsGroup';
import type { SettingGroup, Setting } from '../types/settings';

const mockGroup: SettingGroup = {
  id: 'general',
  label: 'General',
  description: 'General settings',
  order: 1,
  collapsible: false,
};

const mockSettings: Setting[] = [
  {
    key: 'theme',
    label: 'Theme',
    type: 'string',
    default: 'dark',
    group: 'general',
    order: 1,
    plugin_id: 'core',
  },
  {
    key: 'fontSize',
    label: 'Font Size',
    type: 'number',
    default: 14,
    group: 'general',
    order: 2,
    plugin_id: 'core',
  },
];

describe('SettingsGroup', () => {
  it('renders the group title', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders the group description', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('General settings')).toBeInTheDocument();
  });

  it('renders child setting inputs', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
  });

  it('shows empty state message when no settings provided', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={[]}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('No settings in this group')).toBeInTheDocument();
  });

  it('renders group icon when provided', () => {
    const groupWithIcon: SettingGroup = { ...mockGroup, icon: '?' };
    render(
      <SettingsGroup
        group={groupWithIcon}
        settings={[]}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('does not render chevron for non-collapsible group', () => {
    const { container } = render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders chevron for collapsible group', () => {
    const collapsibleGroup: SettingGroup = { ...mockGroup, collapsible: true };
    const { container } = render(
      <SettingsGroup
        group={collapsibleGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('collapses and hides settings when header is clicked on collapsible group', async () => {
    const user = userEvent.setup();
    const collapsibleGroup: SettingGroup = { ...mockGroup, collapsible: true };
    render(
      <SettingsGroup
        group={collapsibleGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Theme')).toBeInTheDocument();

    // Click the header to collapse — component removes content from DOM
    await user.click(screen.getByText('General'));
    expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  });

  it('starts collapsed when group.collapsed is true', () => {
    const collapsedGroup: SettingGroup = { ...mockGroup, collapsible: true, collapsed: true };
    render(
      <SettingsGroup
        group={collapsedGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
      />
    );
    // Content is not rendered when collapsed
    expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  });

  it('passes values to child settings', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{ theme: 'light' }}
        onChange={vi.fn()}
      />
    );
    const input = screen.getAllByRole('textbox')[0];
    expect(input).toHaveValue('light');
  });

  it('disables all settings when disabled prop is true', () => {
    render(
      <SettingsGroup
        group={mockGroup}
        settings={mockSettings}
        values={{}}
        onChange={vi.fn()}
        disabled={true}
      />
    );
    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeDisabled();
  });
});
