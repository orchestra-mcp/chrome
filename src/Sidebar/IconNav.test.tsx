import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconNav } from './IconNav';
import type { SidebarView } from '../types/sidebar';

vi.mock('@orchestra-mcp/icons', () => ({
  BoxIcon: ({ name, size }: { name: string; size?: number }) => (
    <svg data-testid={`icon-${name}`} data-size={size} />
  ),
}));

const MOCK_VIEWS: SidebarView[] = [
  { id: 'explorer', title: 'Explorer', icon: 'bx-folder', order: 1, visible: true, actions: [], hasSearch: true },
  { id: 'search', title: 'Search', icon: 'bx-search', order: 2, visible: true, actions: [], hasSearch: false },
  { id: 'settings', title: 'Settings', icon: 'bx-cog', order: 99, visible: true, actions: [], hasSearch: false },
];

describe('IconNav', () => {
  it('renders a navigation element', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders icon buttons for each visible non-settings view', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.getByTitle('Explorer')).toBeInTheDocument();
    expect(screen.getByTitle('Search')).toBeInTheDocument();
  });

  it('pins settings view separately at bottom', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('marks active view with aria-current=page', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    const explorerBtn = screen.getByLabelText('Explorer');
    expect(explorerBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive views', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    const searchBtn = screen.getByLabelText('Search');
    expect(searchBtn).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the view id when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={onSelect} />);

    await user.click(screen.getByLabelText('Search'));

    expect(onSelect).toHaveBeenCalledWith('search');
  });

  it('applies active class to active icon button', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="search" onSelect={vi.fn()} />);
    const searchBtn = screen.getByLabelText('Search');
    expect(searchBtn).toHaveClass('chrome-icon-nav__btn--active');
  });

  it('does not apply active class to inactive icon buttons', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    const searchBtn = screen.getByLabelText('Search');
    expect(searchBtn).not.toHaveClass('chrome-icon-nav__btn--active');
    expect(searchBtn).toHaveClass('chrome-icon-nav__btn');
  });

  it('renders badge when view has a badge value', () => {
    const views: SidebarView[] = [
      { ...MOCK_VIEWS[1], badge: '3' },
      ...MOCK_VIEWS.slice(0, 1),
      MOCK_VIEWS[2],
    ];
    render(<IconNav views={views} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render badge when view has no badge', () => {
    render(<IconNav views={MOCK_VIEWS} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('filters out non-visible views', () => {
    const views: SidebarView[] = [
      ...MOCK_VIEWS.slice(0, 2),
      { id: 'hidden', title: 'Hidden', icon: 'bx-hide', order: 3, visible: false, actions: [], hasSearch: false },
      MOCK_VIEWS[2],
    ];
    render(<IconNav views={views} activeId="explorer" onSelect={vi.fn()} />);
    expect(screen.queryByTitle('Hidden')).not.toBeInTheDocument();
  });

  it('sorts top views by order field', () => {
    const unordered: SidebarView[] = [
      { id: 'b', title: 'B View', icon: 'bx-b', order: 2, visible: true, actions: [], hasSearch: false },
      { id: 'a', title: 'A View', icon: 'bx-a', order: 1, visible: true, actions: [], hasSearch: false },
    ];
    render(<IconNav views={unordered} activeId="a" onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('title', 'A View');
    expect(buttons[1]).toHaveAttribute('title', 'B View');
  });
});
