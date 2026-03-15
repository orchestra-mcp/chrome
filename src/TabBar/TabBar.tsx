import type { ManagedTab } from '../types/tabs';
import './TabBar.css';

export interface TabBarProps {
  /** Managed Chrome browser tabs. */
  tabs: ManagedTab[];
  /** Currently active Chrome tab ID. */
  activeTabId?: number;
  /** Called when a tab is clicked to activate it. */
  onActivate: (chromeTabId: number) => void;
  /** Called when a tab's close button is clicked. */
  onClose: (chromeTabId: number) => void;
}

/**
 * Compact tab bar showing managed Chrome browser tabs.
 *
 * Displays favicon, title, and close button for each tab.
 * Designed for the 400px Chrome side panel width.
 */
export function TabBar({ tabs, activeTabId, onActivate, onClose }: TabBarProps) {
  if (tabs.length === 0) {
    return (
      <div className="tabbar tabbar--empty">
        <span className="tabbar-empty-label">No managed tabs</span>
      </div>
    );
  }

  return (
    <div className="tabbar" role="tablist" aria-label="Managed browser tabs">
      {tabs.map((tab) => {
        const isActive = tab.chromeTabId === activeTabId;

        return (
          <button
            key={tab.chromeTabId}
            role="tab"
            aria-selected={isActive}
            className={`tabbar-tab ${isActive ? 'tabbar-tab--active' : ''}${tab.pinned ? ' tabbar-tab--pinned' : ''}`}
            onClick={() => onActivate(tab.chromeTabId)}
            title={tab.url}
          >
            {tab.favIconUrl && (
              <span className="tabbar-tab-icon">
                <img src={tab.favIconUrl} alt="" width={14} height={14} />
              </span>
            )}
            <span className="tabbar-tab-label">
              {tab.pinned ? '' : tab.title || tab.url}
            </span>
            {!tab.pinned && (
              <span
                role="button"
                aria-label={`Close ${tab.title}`}
                className="tabbar-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.chromeTabId);
                }}
              >
                &times;
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
