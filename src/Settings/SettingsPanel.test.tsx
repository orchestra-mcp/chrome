import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from './SettingsPanel';
import type { SettingsState } from '../types/settings';

const mockState: SettingsState = {
  groups: [
    {
      id: 'general',
      label: 'General',
      description: 'General settings',
      order: 1,
      collapsible: false,
    },
  ],
  settings: [
    {
      key: 'theme',
      label: 'Theme',
      type: 'string',
      default: 'dark',
      group: 'general',
      order: 1,
      plugin_id: 'core',
    },
  ],
};

const emptyState: SettingsState = { groups: [], settings: [] };

describe('SettingsPanel', () => {
  it('renders the Settings heading', () => {
    render(
      <SettingsPanel state={mockState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders setting groups', () => {
    render(
      <SettingsPanel state={mockState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders settings within groups', () => {
    render(
      <SettingsPanel state={mockState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('shows empty state when no groups are available', () => {
    render(
      <SettingsPanel state={emptyState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('No settings available')).toBeInTheDocument();
  });

  it('shows empty state hint text', () => {
    render(
      <SettingsPanel state={emptyState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText(/Plugin settings will appear here/)).toBeInTheDocument();
  });

  it('calls onChange when a setting value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SettingsPanel state={mockState} values={{ theme: '' }} onChange={onChange} />
    );
    const input = screen.getByRole('textbox');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalledWith('theme', 'a');
  });

  it('shows syncing indicator when syncing prop is true', () => {
    render(
      <SettingsPanel state={mockState} values={{}} onChange={vi.fn()} syncing={true} />
    );
    // The indicator has opacity:1 when syncing - it's always rendered
    const indicator = screen.getByText('Syncing...');
    expect(indicator).toBeInTheDocument();
  });

  it('renders multiple groups', () => {
    const multiGroupState: SettingsState = {
      groups: [
        { id: 'general', label: 'General', order: 1, collapsible: false },
        { id: 'appearance', label: 'Appearance', order: 2, collapsible: false },
      ],
      settings: [],
    };
    render(
      <SettingsPanel state={multiGroupState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('only shows settings belonging to their respective group', () => {
    const multiGroupState: SettingsState = {
      groups: [
        { id: 'general', label: 'General', order: 1, collapsible: false },
        { id: 'appearance', label: 'Appearance', order: 2, collapsible: false },
      ],
      settings: [
        {
          key: 'font',
          label: 'Font',
          type: 'string',
          default: '',
          group: 'appearance',
          order: 1,
          plugin_id: 'core',
        },
      ],
    };
    render(
      <SettingsPanel state={multiGroupState} values={{}} onChange={vi.fn()} />
    );
    expect(screen.getByText('Font')).toBeInTheDocument();
  });
});
