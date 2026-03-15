'use client';

import { type FC } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { SidebarView } from '../types/sidebar';

export interface IconNavProps {
  views: SidebarView[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const IconNav: FC<IconNavProps> = ({ views, activeId, onSelect }) => {
  const topViews = views
    .filter((v) => v.visible && v.id !== 'settings')
    .sort((a, b) => a.order - b.order);

  const settingsView = views.find((v) => v.id === 'settings');

  return (
    <nav className="chrome-icon-nav">
      <div className="chrome-icon-nav__top">
        {topViews.map((view) => (
          <IconNavButton
            key={view.id}
            view={view}
            isActive={view.id === activeId}
            onClick={() => onSelect(view.id)}
          />
        ))}
      </div>

      {settingsView && (
        <div className="chrome-icon-nav__bottom">
          <div className="chrome-icon-nav__divider" />
          <IconNavButton
            view={settingsView}
            isActive={settingsView.id === activeId}
            onClick={() => onSelect(settingsView.id)}
          />
        </div>
      )}
    </nav>
  );
};

interface IconNavButtonProps {
  view: SidebarView;
  isActive: boolean;
  onClick: () => void;
}

const IconNavButton: FC<IconNavButtonProps> = ({ view, isActive, onClick }) => {
  const btnClass = isActive
    ? 'chrome-icon-nav__btn chrome-icon-nav__btn--active'
    : 'chrome-icon-nav__btn';

  return (
    <button
      onClick={onClick}
      className={btnClass}
      title={view.title}
      aria-label={view.title}
      aria-current={isActive ? 'page' : undefined}
    >
      <BoxIcon name={view.icon} size={20} />
      {view.badge && (
        <span className="chrome-icon-nav__badge">{view.badge}</span>
      )}
    </button>
  );
};
