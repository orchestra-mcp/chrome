import type { Setting } from '../types/settings';

export interface SettingInputProps {
  setting: Setting;
  value: string | number | boolean | string[];
  onChange: (key: string, value: string | number | boolean | string[]) => void;
  disabled?: boolean;
}

export function SettingInput({ setting, value, onChange, disabled }: SettingInputProps) {
  const handleChange = (newValue: string | number | boolean | string[]) => {
    onChange(setting.key, newValue);
  };

  const renderInput = () => {
    switch (setting.type) {
      case 'string':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.placeholder}
            disabled={disabled}
            className="chrome-setting__input"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={Number(value || 0)}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="chrome-setting__input"
          />
        );

      case 'boolean':
        return (
          <label className="chrome-setting__checkbox-label">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
              className="chrome-setting__checkbox"
            />
            <span className="chrome-setting__checkbox-text">{setting.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="chrome-setting__select"
          >
            {setting.options?.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        return <MultiSelectInput setting={setting} value={value} onChange={handleChange} disabled={disabled} />;

      case 'color':
        return <ColorInput value={value} onChange={handleChange} disabled={disabled} />;

      case 'range':
        return <RangeInput setting={setting} value={value} onChange={handleChange} disabled={disabled} />;

      default:
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="chrome-setting__input"
          />
        );
    }
  };

  return (
    <div className="chrome-setting">
      {setting.type !== 'boolean' && (
        <label className="chrome-setting__label">
          {setting.label}
          {setting.validation?.required && (
            <span className="chrome-setting__required">*</span>
          )}
        </label>
      )}
      {renderInput()}
      {setting.description && (
        <p className="chrome-setting__desc">{setting.description}</p>
      )}
    </div>
  );
}

function MultiSelectInput({
  setting,
  value,
  onChange,
  disabled,
}: {
  setting: Setting;
  value: string | number | boolean | string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const values = Array.isArray(value) ? value : [];
  return (
    <div className="chrome-setting__multi-group">
      {setting.options?.map((option) => {
        const isSelected = values.includes(String(option.value));
        return (
          <label key={String(option.value)} className="chrome-setting__checkbox-label">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                const newValues = e.target.checked
                  ? [...values, String(option.value)]
                  : values.filter((v) => v !== String(option.value));
                onChange(newValues);
              }}
              disabled={disabled}
              className="chrome-setting__checkbox"
            />
            <span className="chrome-setting__checkbox-text">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
  disabled,
}: {
  value: string | number | boolean | string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const colorValue = String(value || '#000000');
  return (
    <div className="chrome-setting__color-row">
      <input
        type="color"
        value={colorValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="chrome-setting__color-picker"
      />
      <input
        type="text"
        value={colorValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="chrome-setting__input"
        style={{ flex: 1 }}
      />
    </div>
  );
}

function RangeInput({
  setting,
  value,
  onChange,
  disabled,
}: {
  setting: Setting;
  value: string | number | boolean | string[];
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const numValue = Number(value || 0);
  return (
    <div className="chrome-setting__range-row">
      <input
        type="range"
        min={setting.validation?.min || 0}
        max={setting.validation?.max || 100}
        step={setting.validation?.step || 1}
        value={numValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="chrome-setting__range"
      />
      <span className="chrome-setting__range-value">{numValue}</span>
    </div>
  );
}
