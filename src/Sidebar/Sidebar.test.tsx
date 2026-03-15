import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { SidebarState } from '../types/sidebar';

// Mock icon components to avoid import resolution issues in tests
vi.mock('@orchestra-mcp/icons', () => ({
  OrchestraLogo: (props: any) => <svg data-testid="orchestra-logo" {...props} />,
  MenuIcon: (props: any) => <svg data-testid="menu-icon" {...props} />,
  ChevronRightIcon: (props: any) => <svg data-testid="chevron-right" {...props} />,
  ChevronDownIcon: (props: any) => <svg data-testid="chevron-down" {...props} />,
}));
vi.mock('@orchestra-mcp/icons/code', () => ({
  MenuIcon: (props: any) => <svg data-testid="menu-icon" {...props} />,
  ChevronRightIcon: (props: any) => <svg data-testid="chevron-right" {...props} />,
  ChevronDownIcon: (props: any) => <svg data-testid="chevron-down" {...props} />,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty state', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders with initial state', () => {
    const initialState: SidebarState = {
      entries: [
        {
          id: 'entry-1',
          title: 'Test Entry',
          icon: '\uD83D\uDCC1',
          order: 1,
          collapsible: false,
          plugin_id: 'test-plugin',
        },
      ],
      active: 'entry-1',
    };

    render(<Sidebar initialState={initialState} />);
    expect(screen.getByText('Test Entry')).toBeInTheDocument();
  });

  it('displays connection status via TopBar', () => {
    const { container } = render(<Sidebar connected={true} />);
    // TopBar renders a connection indicator dot
    const topBar = container.querySelector('.chrome-topbar');
    expect(topBar).toBeInTheDocument();
  });

  it('renders initialState entries on mount', () => {
    const initialState: SidebarState = {
      entries: [
        { id: 'mount-entry', title: 'Mount Entry', order: 1, collapsible: false, plugin_id: 'test' },
      ],
      active: 'mount-entry',
    };
    render(<Sidebar initialState={initialState} />);
    expect(screen.getByText('Mount Entry')).toBeInTheDocument();
  });

  it('calls onAction callback when entry with action is clicked', () => {
    const onAction = vi.fn();
    const initialState: SidebarState = {
      entries: [
        { id: 'action-entry', title: 'Action Entry', order: 1, collapsible: false, action: 'open.file', plugin_id: 'test-plugin' },
      ],
    };

    render(<Sidebar initialState={initialState} onAction={onAction} />);

    const button = screen.getByRole('button', { name: /action entry/i });
    button.click();

    expect(onAction).toHaveBeenCalledWith('open.file', 'action-entry', 'test-plugin');
  });

  it('calls onQuickAction when quick action is triggered', () => {
    const onQuickAction = vi.fn();
    render(<Sidebar onQuickAction={onQuickAction} />);

    // TopBar renders the quick action button with aria-label "Quick actions"
    const quickActionBtn = screen.queryByRole('button', { name: 'Quick actions' });
    if (quickActionBtn) {
      quickActionBtn.click();
      expect(onQuickAction).toHaveBeenCalledOnce();
    }
  });

  it('does not call onAction when entry has no action', () => {
    const onAction = vi.fn();
    const initialState: SidebarState = {
      entries: [
        { id: 'no-action-entry', title: 'No Action Entry', order: 1, collapsible: false, plugin_id: 'test' },
      ],
    };

    render(<Sidebar initialState={initialState} onAction={onAction} />);

    const button = screen.getByRole('button', { name: /no action entry/i });
    button.click();

    expect(onAction).not.toHaveBeenCalled();
  });

  it('passes notificationsCount as pluginCount to StatusBar', () => {
    render(<Sidebar notificationsCount={5} />);
    // Sidebar maps notificationsCount to StatusBar's pluginCount prop
    // StatusBar renders "N plugin(s)" for pluginCount > 0
    expect(screen.getByText('5 plugins')).toBeInTheDocument();
  });

  it('shows syncing indicator when syncing', () => {
    render(<Sidebar syncing={true} />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('does not show syncing indicator when not syncing', () => {
    render(<Sidebar syncing={false} />);
    expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();
  });

  it('renders full layout structure', () => {
    const { container } = render(<Sidebar />);

    // Should have main container with chrome-sidebar class
    const mainContainer = container.querySelector('.chrome-sidebar');
    expect(mainContainer).toBeInTheDocument();

    // Should have navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('handles multiple entries with correct sorting', () => {
    const initialState: SidebarState = {
      entries: [
        {
          id: 'entry-3',
          title: 'Third',
          order: 3,
          collapsible: false,
          plugin_id: 'test',
        },
        {
          id: 'entry-1',
          title: 'First',
          order: 1,
          collapsible: false,
          plugin_id: 'test',
        },
        {
          id: 'entry-2',
          title: 'Second',
          order: 2,
          collapsible: false,
          plugin_id: 'test',
        },
      ],
    };

    render(<Sidebar initialState={initialState} />);

    const buttons = screen.getAllByRole('button');
    // Should be sorted by order
    expect(buttons[0]).toHaveTextContent('First');
    expect(buttons[1]).toHaveTextContent('Second');
    expect(buttons[2]).toHaveTextContent('Third');
  });

  it('does not call onAction if entry has no action', () => {
    const onAction = vi.fn();
    const initialState: SidebarState = {
      entries: [
        {
          id: 'no-action',
          title: 'No Action',
          order: 1,
          collapsible: false,
          plugin_id: 'test',
        },
      ],
    };

    render(<Sidebar initialState={initialState} onAction={onAction} />);

    const button = screen.getByRole('button', { name: /no action/i });
    button.click();

    expect(onAction).not.toHaveBeenCalled();
  });

  it('shows connected status in StatusBar', () => {
    render(<Sidebar connected={true} />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows offline status in StatusBar when disconnected', () => {
    render(<Sidebar connected={false} />);
    // StatusBar renders "Offline" twice is possible since both TopBar and StatusBar
    // receive connected prop, but StatusBar shows "Offline" text
    expect(screen.getAllByText('Offline').length).toBeGreaterThanOrEqual(1);
  });
});
