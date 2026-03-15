"use client";

import { useState } from 'react';
import { ChevronDownIcon } from '@orchestra-mcp/icons';
import type { SettingGroup, Setting } from '../types/settings';
import { SettingInput } from './SettingInput';

export interface SettingsGroupProps {
  group: SettingGroup;
  settings: Setting[];
  values: Record<string, string | number | boolean | string[]>;
  onChange: (key: string, value: string | number | boolean | string[]) => void;
  disabled?: boolean;
}

export function SettingsGroup({ group, settings, values, onChange, disabled }: SettingsGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(group.collapsed ?? false);

  const headerClass = [
    'chrome-settings-group__header',
    group.collapsible ? 'chrome-settings-group__header--collapsible' : '',
    !isCollapsed ? 'chrome-settings-group__header--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const chevronClass = [
    'chrome-settings-group__chevron',
    !isCollapsed ? 'chrome-settings-group__chevron--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleHeaderClick = () => {
    if (group.collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="chrome-settings-group">
      <div className={headerClass} onClick={handleHeaderClick}>
        <div style={{ flex: 1 }}>
          <h3 className="chrome-settings-group__title">
            {group.icon && <span>{group.icon}</span>}
            {group.label}
          </h3>
          {group.description && (
            <p className="chrome-settings-group__desc">{group.description}</p>
          )}
        </div>
        {group.collapsible && (
          <span className={chevronClass}>
            <ChevronDownIcon size={20} />
          </span>
        )}
      </div>
      {!isCollapsed && (
        <div className="chrome-settings-group__body">
          {settings.length === 0 ? (
            <p className="chrome-settings-group__empty">No settings in this group</p>
          ) : (
            settings.map((setting) => (
              <SettingInput
                key={setting.key}
                setting={setting}
                value={values[setting.key] ?? setting.default}
                onChange={onChange}
                disabled={disabled}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
