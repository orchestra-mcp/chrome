import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingInput } from './SettingInput';
import type { Setting } from '../types/settings';

const baseSetting: Setting = {
  key: 'test.key',
  label: 'Test Label',
  type: 'string',
  default: '',
  group: 'general',
  order: 1,
  plugin_id: 'test-plugin',
};

describe('SettingInput', () => {
  it('renders the label for string type', () => {
    render(<SettingInput setting={baseSetting} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders a text input for string type', () => {
    render(<SettingInput setting={baseSetting} value="hello" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('hello');
  });

  it('calls onChange with the new string value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SettingInput setting={baseSetting} value="" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('test.key', 'a');
  });

  it('renders a number input for number type', () => {
    const setting: Setting = { ...baseSetting, type: 'number', default: 0 };
    render(<SettingInput setting={setting} value={42} onChange={vi.fn()} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(42);
  });

  it('renders a checkbox for boolean type', () => {
    const setting: Setting = { ...baseSetting, type: 'boolean', default: false };
    render(<SettingInput setting={setting} value={false} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange with boolean value when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const setting: Setting = { ...baseSetting, type: 'boolean', default: false };
    render(<SettingInput setting={setting} value={false} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith('test.key', true);
  });

  it('renders a select for select type', () => {
    const setting: Setting = {
      ...baseSetting,
      type: 'select',
      default: 'a',
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ],
    };
    render(<SettingInput setting={setting} value="a" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('calls onChange with selected value for select type', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const setting: Setting = {
      ...baseSetting,
      type: 'select',
      default: 'a',
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ],
    };
    render(<SettingInput setting={setting} value="a" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalledWith('test.key', 'b');
  });

  it('renders description text when provided', () => {
    const setting: Setting = { ...baseSetting, description: 'Helpful description' };
    render(<SettingInput setting={setting} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Helpful description')).toBeInTheDocument();
  });

  it('shows required asterisk when validation.required is true', () => {
    const setting: Setting = { ...baseSetting, validation: { required: true } };
    render(<SettingInput setting={setting} value="" onChange={vi.fn()} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<SettingInput setting={baseSetting} value="" onChange={vi.fn()} disabled={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders placeholder text for string type', () => {
    const setting: Setting = { ...baseSetting, placeholder: 'Enter value here' };
    render(<SettingInput setting={setting} value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Enter value here')).toBeInTheDocument();
  });
});
