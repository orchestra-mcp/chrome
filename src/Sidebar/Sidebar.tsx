"use client";

'use client';

import { useState, type FC } from 'react';
import type { SidebarState, SidebarEntry, SidebarUpdate } from '../types/sidebar';
import { TopBar } from './TopBar';
import { SidebarNav } from './SidebarNav';
import { StatusBar } from './StatusBar';
import './Sidebar.css';

export interface SidebarProps {
  initialState?: SidebarState;
  connected?: boolean;
  pluginStatus?: string;
  notificationsCount?: number;
  syncing?: boolean;
  onUpdate?: (state: SidebarState) => void;
  onAction?: (action: string, entryId: string, pluginId: string) => void;
  onQuickAction?: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
  initialState,
  connected = false,
  notificationsCount,
  syncing,
  onAction,
  onQuickAction,
}) => {
  const [state, setState] = useState<SidebarState>(
    initialState || { entries: [] },
  );

  const handleMessage = (message: SidebarUpdate) => {
    if (message.type === 'sidebar.update') {
      setState(message.payload);
    }
  };

  const handleEntryClick = (entry: SidebarEntry) => {
    if (entry.action) {
      onAction?.(entry.action, entry.id, entry.plugin_id);
    }
  };

  return (
    <div className="chrome-sidebar">
      <TopBar connected={connected} onQuickAction={onQuickAction} />
      <SidebarNav
        entries={state.entries}
        activeId={state.active}
        onEntryClick={handleEntryClick}
      />
      <StatusBar
        connected={connected}
        pluginCount={notificationsCount}
        syncing={syncing}
      />
    </div>
  );
};
