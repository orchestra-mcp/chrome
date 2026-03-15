'use client';

import { type FC } from 'react';
import { OrchestraLogo } from '@orchestra-mcp/icons';

export interface SidebarHeaderProps {
  connected: boolean;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ connected }) => {
  const statusClass = connected
    ? 'chrome-sidebar-header__status--connected'
    : 'chrome-sidebar-header__status--disconnected';

  return (
    <div className="chrome-sidebar-header">
      <OrchestraLogo size={16} color="var(--color-accent)" />
      <span className="chrome-sidebar-header__brand">Orchestra</span>
      <div
        className={`chrome-sidebar-header__status ${statusClass}`}
        title={connected ? 'Connected to desktop' : 'Disconnected'}
      />
    </div>
  );
};
