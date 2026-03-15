"use client";

'use client';

import { useState, type FC } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { SidebarAction } from '../types/sidebar';

export interface ViewTitleProps {
  title: string;
  actions: SidebarAction[];
  onAction: (actionId: string) => void;
  onSearch: (query: string) => void;
  hasSearch: boolean;
}

export const ViewTitle: FC<ViewTitleProps> = ({
  title,
  actions,
  onAction,
  onSearch,
  hasSearch,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearchToggle = () => {
    if (searchOpen) {
      setQuery('');
      onSearch('');
    }
    setSearchOpen(!searchOpen);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="chrome-view-title">
      <div className="chrome-view-title__row">
        <h2 className="chrome-view-title__label">{title}</h2>
        <div className="chrome-view-title__actions">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="chrome-view-title__action-btn"
              title={action.tooltip}
              aria-label={action.tooltip}
            >
              <BoxIcon name={action.icon} size={14} />
            </button>
          ))}
          {hasSearch && (
            <button
              onClick={handleSearchToggle}
              className={`chrome-view-title__action-btn${searchOpen ? ' chrome-view-title__action-btn--active' : ''}`}
              title="Toggle search"
              aria-label="Toggle search"
            >
              <BoxIcon name="bx-search" size={14} />
            </button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="chrome-view-title__search">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search..."
            autoFocus
            className="chrome-view-title__search-input"
          />
        </div>
      )}
    </div>
  );
};
