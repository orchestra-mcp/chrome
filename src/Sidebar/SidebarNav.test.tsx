import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarNav } from './SidebarNav';
import type { SidebarEntry } from '../types/sidebar';

describe('SidebarNav', () => {
  const mockOnEntryClick = vi.fn();

  beforeEach(() => {
    mockOnEntryClick.mockClear();
  });

  it('renders empty navigation', () => {
    render(<SidebarNav entries={[]} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toBeEmptyDOMElement();
  });

  it('renders single entry', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Test Entry',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    expect(screen.getByText('Test Entry')).toBeInTheDocument();
  });

  it('renders entry with icon', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Files',
        icon: '\uD83D\uDCC1',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    expect(screen.getByText('\uD83D\uDCC1')).toBeInTheDocument();
  });

  it('renders entry with badge', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Notifications',
        order: 1,
        badge: 5,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render badge when value is 0', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'No Badge',
        order: 1,
        badge: 0,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    const badges = screen.queryByText('0');
    expect(badges).not.toBeInTheDocument();
  });

  it('highlights active entry', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Active Entry',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} activeId="entry-1" />);
    const button = screen.getByRole('button', { name: /active entry/i });
    expect(button).toHaveClass('chrome-sidebar-nav__entry--active');
  });

  it('does not highlight inactive entry', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Inactive Entry',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} activeId="other-entry" />);
    const button = screen.getByRole('button', { name: /inactive entry/i });
    expect(button).toHaveClass('chrome-sidebar-nav__entry');
    expect(button).not.toHaveClass('chrome-sidebar-nav__entry--active');
  });

  it('calls onEntryClick when entry is clicked', async () => {
    const user = userEvent.setup();
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Clickable Entry',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} onEntryClick={mockOnEntryClick} />);
    const button = screen.getByRole('button', { name: /clickable entry/i });

    await user.click(button);

    expect(mockOnEntryClick).toHaveBeenCalledTimes(1);
    expect(mockOnEntryClick).toHaveBeenCalledWith(entries[0]);
  });

  it('sorts entries by order field', () => {
    const entries: SidebarEntry[] = [
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
    ];

    render(<SidebarNav entries={entries} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('First');
    expect(buttons[1]).toHaveTextContent('Second');
    expect(buttons[2]).toHaveTextContent('Third');
  });

  it('renders nested sections', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'parent',
        title: 'Parent Entry',
        order: 1,
        collapsible: true,
        plugin_id: 'test',
        sections: [
          {
            id: 'child',
            title: 'Child Entry',
            order: 1,
            collapsible: false,
            plugin_id: 'test',
          },
        ],
      },
    ];

    render(<SidebarNav entries={entries} />);

    expect(screen.getByText('Parent Entry')).toBeInTheDocument();
    expect(screen.getByText('Child Entry')).toBeInTheDocument();
  });

  it('toggles collapsible sections', async () => {
    const user = userEvent.setup();
    const entries: SidebarEntry[] = [
      {
        id: 'parent',
        title: 'Collapsible Parent',
        order: 1,
        collapsible: true,
        plugin_id: 'test',
        sections: [
          {
            id: 'child',
            title: 'Hidden Child',
            order: 1,
            collapsible: false,
            plugin_id: 'test',
          },
        ],
      },
    ];

    render(<SidebarNav entries={entries} />);

    const parentButton = screen.getByRole('button', { name: /collapsible parent/i });

    // Initially expanded
    expect(screen.getByText('Hidden Child')).toBeInTheDocument();

    // Click to collapse
    await user.click(parentButton);

    // Child should be hidden
    expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();

    // Click to expand again
    await user.click(parentButton);

    // Child should be visible
    expect(screen.getByText('Hidden Child')).toBeInTheDocument();
  });

  it('shows chevron icon for collapsible entries', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'collapsible',
        title: 'Collapsible',
        order: 1,
        collapsible: true,
        plugin_id: 'test',
        sections: [
          {
            id: 'child',
            title: 'Child',
            order: 1,
            collapsible: false,
            plugin_id: 'test',
          },
        ],
      },
    ];

    const { container } = render(<SidebarNav entries={entries} />);

    // Check for SVG chevron (ChevronDownIcon when expanded)
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it('does not show chevron for non-collapsible entries', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'non-collapsible',
        title: 'Non-Collapsible',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    const { container } = render(<SidebarNav entries={entries} />);

    // Should not have chevron SVG
    const chevron = container.querySelector('svg');
    expect(chevron).not.toBeInTheDocument();
  });

  it('applies correct indentation to nested entries', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'parent',
        title: 'Parent',
        order: 1,
        collapsible: true,
        plugin_id: 'test',
        sections: [
          {
            id: 'child',
            title: 'Child',
            order: 1,
            collapsible: false,
            plugin_id: 'test',
          },
        ],
      },
    ];

    render(<SidebarNav entries={entries} />);

    const childButton = screen.getByRole('button', { name: /^child$/i });

    // Check for increased padding-left
    expect(childButton).toHaveStyle({ paddingLeft: '28px' }); // depth 1: 1*12 + 16
  });

  it('handles entries without sections', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'no-sections',
        title: 'No Sections',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    expect(screen.getByText('No Sections')).toBeInTheDocument();
  });

  it('renders multiple top-level entries', () => {
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Entry 1',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
      {
        id: 'entry-2',
        title: 'Entry 2',
        order: 2,
        collapsible: false,
        plugin_id: 'test',
      },
      {
        id: 'entry-3',
        title: 'Entry 3',
        order: 3,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);

    expect(screen.getByText('Entry 1')).toBeInTheDocument();
    expect(screen.getByText('Entry 2')).toBeInTheDocument();
    expect(screen.getByText('Entry 3')).toBeInTheDocument();
  });

  it('handles undefined onEntryClick gracefully', async () => {
    const user = userEvent.setup();
    const entries: SidebarEntry[] = [
      {
        id: 'entry-1',
        title: 'Entry Without Handler',
        order: 1,
        collapsible: false,
        plugin_id: 'test',
      },
    ];

    render(<SidebarNav entries={entries} />);
    const button = screen.getByRole('button', { name: /entry without handler/i });

    // Should not throw
    await expect(user.click(button)).resolves.not.toThrow();
  });
});
