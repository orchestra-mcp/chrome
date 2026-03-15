"use client";

'use client';

import { useState, type FC, type ReactNode } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';

export interface ViewBodyProps {
  activeViewId: string;
  searchQuery: string;
  settingsContent?: ReactNode;
  voiceContent?: ReactNode;
}

export const ViewBody: FC<ViewBodyProps> = ({
  activeViewId,
  searchQuery,
  settingsContent,
  voiceContent,
}) => {
  switch (activeViewId) {
    case 'explorer':
      return <ExplorerView />;
    case 'search':
      return <SearchView query={searchQuery} />;
    case 'extensions':
      return <ExtensionsView />;
    case 'settings':
      return settingsContent ? <>{settingsContent}</> : <SettingsPlaceholder />;
    case 'voice':
      return voiceContent ? <>{voiceContent}</> : <VoicePlaceholder />;
    default:
      return <PlaceholderView viewId={activeViewId} />;
  }
};

const ExplorerView: FC = () => (
  <div className="chrome-view-body__placeholder">
    <BoxIcon name="bx-folder-open" size={40} color="var(--color-fg-dim)" />
    <p className="chrome-view-body__placeholder-title">No workspace open</p>
    <p className="chrome-view-body__placeholder-desc">
      Open a project in the desktop app to browse files
    </p>
  </div>
);

const SearchView: FC<{ query: string }> = ({ query }) => {
  const [localQuery, setLocalQuery] = useState(query);

  return (
    <div className="chrome-view-body" style={{ padding: '12px' }}>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Search files, symbols, text..."
        className="chrome-view-body__search-input"
      />
      <div className="chrome-view-body__placeholder">
        <BoxIcon name="bx-search" size={40} color="var(--color-fg-dim)" />
        <p className="chrome-view-body__placeholder-title">
          {localQuery ? 'No results found' : 'Type to search'}
        </p>
      </div>
    </div>
  );
};

const ExtensionsView: FC = () => (
  <div className="chrome-view-body__placeholder">
    <BoxIcon name="bx-extension" size={40} color="var(--color-fg-dim)" />
    <p className="chrome-view-body__placeholder-title">Marketplace coming soon</p>
    <p className="chrome-view-body__placeholder-desc">
      Browse and install extensions for Orchestra
    </p>
  </div>
);

const SettingsPlaceholder: FC = () => (
  <div className="chrome-view-body__placeholder">
    <BoxIcon name="bx-cog" size={40} color="var(--color-fg-dim)" />
    <p className="chrome-view-body__placeholder-title">Settings</p>
    <p className="chrome-view-body__placeholder-desc">
      Connect to the desktop app to manage settings
    </p>
  </div>
);

const VoicePlaceholder: FC = () => (
  <div className="chrome-view-body__placeholder">
    <BoxIcon name="bx-microphone" size={40} color="var(--color-fg-dim)" />
    <p className="chrome-view-body__placeholder-title">No recordings yet</p>
    <p className="chrome-view-body__placeholder-desc">
      Start a recording on Google Meet, Zoom, or Teams
    </p>
  </div>
);

const PlaceholderView: FC<{ viewId: string }> = ({ viewId }) => (
  <div className="chrome-view-body__placeholder">
    <BoxIcon name="bx-loader-alt" size={40} color="var(--color-fg-dim)" />
    <p className="chrome-view-body__placeholder-title">
      View &quot;{viewId}&quot; is loading
    </p>
  </div>
);
