'use client';

import { type FC } from 'react';

export interface StatusBarProps {
  connected?: boolean;
  pluginCount?: number;
  syncing?: boolean;
}

export const StatusBar: FC<StatusBarProps> = ({
  connected = false,
  pluginCount = 0,
  syncing = false,
}) => {
  return (
    <div className="chrome-statusbar">
      <div className="chrome-statusbar__left">
        <div className="chrome-statusbar__connection">
          <div
            className={`chrome-statusbar__dot ${
              connected
                ? 'chrome-sidebar-header__status--connected'
                : 'chrome-sidebar-header__status--disconnected'
            }`}
          />
          <span>{connected ? 'Connected' : 'Offline'}</span>
        </div>
        {pluginCount > 0 && (
          <span className="chrome-statusbar__plugins">
            {pluginCount} plugin{pluginCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {syncing && <span className="chrome-statusbar__sync">Syncing...</span>}
    </div>
  );
};
