"use client";

import { useState } from 'react';
import { SettingsIcon } from '@orchestra-mcp/icons';
import type { SettingsState } from '../types/settings';
import { SettingsGroup } from './SettingsGroup';
import './Settings.css';

export interface SettingsPanelProps {
  state: SettingsState;
  values: Record<string, string | number | boolean | string[]>;
  onChange: (key: string, value: string | number | boolean | string[]) => void;
  syncing?: boolean;
}

export function SettingsPanel({ state, values, onChange, syncing = false }: SettingsPanelProps) {
  const [syncingKey, setSyncingKey] = useState<string | null>(null);

  const handleChange = (key: string, value: string | number | boolean | string[]) => {
    setSyncingKey(key);
    onChange(key, value);
    setTimeout(() => setSyncingKey(null), 300);
  };

  return (
    <div className="chrome-settings">
      <div className="chrome-settings__header">
        <h2 className="chrome-settings__title">Settings</h2>
        <span
          className="chrome-settings__sync"
          style={{ opacity: syncing || syncingKey ? 1 : 0 }}
        >
          Syncing...
        </span>
      </div>

      <div className="chrome-settings__content">
        {state.groups.length === 0 ? (
          <EmptyState />
        ) : (
          state.groups.map((group) => {
            const groupSettings = state.settings.filter((s) => s.group === group.id);
            return (
              <SettingsGroup
                key={group.id}
                group={group}
                settings={groupSettings}
                values={values}
                onChange={handleChange}
                disabled={syncingKey !== null}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="chrome-settings__empty">
      <div className="chrome-settings__empty-icon">
        <SettingsIcon size={48} color="var(--color-fg-muted)" />
      </div>
      <p className="chrome-settings__empty-title">No settings available</p>
      <p className="chrome-settings__empty-desc">
        Plugin settings will appear here once plugins are loaded
      </p>
    </div>
  );
}
