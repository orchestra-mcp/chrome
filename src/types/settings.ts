/**
 * Settings types matching Go backend structure.
 */

export type SettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'color'
  | 'range';

export interface SettingOption {
  label: string;
  value: string | number;
  description?: string;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  custom?: string;
}

export interface Setting {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: SettingType;
  default: string | number | boolean | string[];
  value?: string | number | boolean | string[];
  group: string;
  order: number;
  options?: SettingOption[];
  validation?: SettingValidation;
  disabled?: boolean;
  hidden?: boolean;
  plugin_id: string;
}

export interface SettingGroup {
  id: string;
  label: string;
  description?: string;
  order: number;
  icon?: string;
  collapsible: boolean;
  collapsed?: boolean;
}

export interface SettingsState {
  groups: SettingGroup[];
  settings: Setting[];
}

export interface SettingsUpdate {
  type: 'settings.update';
  payload: SettingsState;
}

export interface SettingChange {
  type: 'setting.change';
  payload: {
    key: string;
    value: string | number | boolean | string[];
    plugin_id: string;
  };
}
