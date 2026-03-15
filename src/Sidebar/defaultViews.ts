import type { SidebarView } from '../types/sidebar';

/**
 * Default built-in sidebar views.
 * These are rendered when no plugins have registered custom views.
 */
export const DEFAULT_VIEWS: SidebarView[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    icon: 'bx-folder',
    order: 1,
    visible: true,
    actions: [
      {
        id: 'new-file',
        icon: 'bx-file-blank',
        tooltip: 'New File',
        action: 'explorer.newFile',
      },
      {
        id: 'new-folder',
        icon: 'bx-folder-plus',
        tooltip: 'New Folder',
        action: 'explorer.newFolder',
      },
      {
        id: 'refresh',
        icon: 'bx-refresh',
        tooltip: 'Refresh',
        action: 'explorer.refresh',
      },
    ],
    hasSearch: true,
  },
  {
    id: 'search',
    title: 'Search',
    icon: 'bx-search',
    order: 2,
    visible: true,
    actions: [],
    hasSearch: false,
  },
  {
    id: 'extensions',
    title: 'Extensions',
    icon: 'bx-extension',
    order: 3,
    visible: true,
    actions: [
      {
        id: 'refresh-ext',
        icon: 'bx-refresh',
        tooltip: 'Refresh Extensions',
        action: 'extensions.refresh',
      },
    ],
    hasSearch: true,
  },
  {
    id: 'voice',
    title: 'Recordings',
    icon: 'bx-microphone',
    order: 4,
    visible: true,
    actions: [],
    hasSearch: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'bx-cog',
    order: 99,
    visible: true,
    actions: [],
    hasSearch: false,
  },
];
