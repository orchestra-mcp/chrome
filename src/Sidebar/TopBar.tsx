'use client';

import { type FC } from 'react';
import { OrchestraLogo, MenuIcon } from '@orchestra-mcp/icons';
import { Button } from '@orchestra-mcp/ui';

export interface TopBarProps {
  connected: boolean;
  onQuickAction?: () => void;
}

export const TopBar: FC<TopBarProps> = ({ connected, onQuickAction }) => {
  const statusClass = connected
    ? 'chrome-sidebar-header__status--connected'
    : 'chrome-sidebar-header__status--disconnected';

  return (
    <div className="chrome-topbar">
      <div className="chrome-topbar__left">
        <OrchestraLogo size={24} color="var(--color-accent)" />
        <h1 className="chrome-topbar__title">Orchestra</h1>
      </div>
      <div className="chrome-topbar__right">
        <div
          className={`chrome-topbar__status ${statusClass}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
        {onQuickAction && (
          <Button
            variant="ghost"
            color="gray"
            size="xs"
            iconOnly
            ariaLabel="Quick actions"
            iconLeft={<MenuIcon size={16} />}
            onClick={onQuickAction}
          />
        )}
      </div>
    </div>
  );
};
