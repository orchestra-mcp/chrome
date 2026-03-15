"use client";

'use client';

import { useState, type FC } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@orchestra-mcp/icons';
import type { SidebarEntry } from '../types/sidebar';

export interface SidebarNavProps {
  entries: SidebarEntry[];
  activeId?: string;
  onEntryClick?: (entry: SidebarEntry) => void;
}

export const SidebarNav: FC<SidebarNavProps> = ({
  entries,
  activeId,
  onEntryClick,
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sorted = [...entries].sort((a, b) => a.order - b.order);

  const renderEntry = (entry: SidebarEntry, depth = 0) => {
    const isActive = entry.id === activeId;
    const isCollapsed = collapsed.has(entry.id);
    const hasChildren = entry.sections && entry.sections.length > 0;

    const entryClass = isActive
      ? 'chrome-sidebar-nav__entry chrome-sidebar-nav__entry--active'
      : 'chrome-sidebar-nav__entry';

    return (
      <div key={entry.id}>
        <button
          onClick={() => {
            if (entry.collapsible && hasChildren) {
              toggleCollapse(entry.id);
            }
            onEntryClick?.(entry);
          }}
          className={entryClass}
          style={{ paddingLeft: `${depth * 12 + 16}px` }}
        >
          <div className="chrome-sidebar-nav__entry-left">
            {entry.icon && <span>{entry.icon}</span>}
            <span>{entry.title}</span>
            {entry.badge !== undefined && entry.badge > 0 && (
              <span className="chrome-sidebar-nav__entry-badge">
                {entry.badge}
              </span>
            )}
          </div>

          {entry.collapsible && hasChildren && (
            <span>
              {isCollapsed ? (
                <ChevronRightIcon size={16} />
              ) : (
                <ChevronDownIcon size={16} />
              )}
            </span>
          )}
        </button>

        {hasChildren && !isCollapsed && (
          <div>
            {entry.sections!.map((child) => renderEntry(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="chrome-sidebar-nav">{sorted.map((e) => renderEntry(e))}</nav>
  );
};
