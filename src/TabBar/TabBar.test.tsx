import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from './TabBar';
import type { ManagedTab } from '../types/tabs';

const TAB_1: ManagedTab = {
  chromeTabId: 101,
  url: 'https://github.com',
  title: 'GitHub',
  favIconUrl: 'https://github.com/favicon.ico',
  pluginId: 'core',
  pinned: false,
  active: true,
};

const TAB_2: ManagedTab = {
  chromeTabId: 102,
  url: 'https://docs.google.com',
  title: 'Google Docs',
  pluginId: 'core',
  pinned: false,
  active: false,
};

const PINNED_TAB: ManagedTab = {
  chromeTabId: 201,
  url: 'https://gmail.com',
  title: 'Gmail',
  pluginId: 'core',
  pinned: true,
  active: false,
};

describe('TabBar', () => {
  it('renders empty state when no tabs are provided', () => {
    render(<TabBar tabs={[]} onActivate={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('No managed tabs')).toBeInTheDocument();
  });

  it('renders tab buttons when tabs are provided', () => {
    render(<TabBar tabs={[TAB_1, TAB_2]} onActivate={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Google Docs')).toBeInTheDocument();
  });

  it('renders with tablist role', () => {
    render(<TabBar tabs={[TAB_1]} onActivate={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected=true', () => {
    render(<TabBar tabs={[TAB_1, TAB_2]} activeTabId={101} onActivate={vi.fn()} onClose={vi.fn()} />);
    const activeTab = screen.getByRole('tab', { name: /GitHub/i });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks inactive tabs with aria-selected=false', () => {
    render(<TabBar tabs={[TAB_1, TAB_2]} activeTabId={101} onActivate={vi.fn()} onClose={vi.fn()} />);
    const inactiveTab = screen.getByRole('tab', { name: /Google Docs/i });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onActivate with the tab id when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<TabBar tabs={[TAB_1, TAB_2]} onActivate={onActivate} onClose={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: /Google Docs/i }));
    expect(onActivate).toHaveBeenCalledWith(102);
  });

  it('calls onClose with the tab id when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TabBar tabs={[TAB_1, TAB_2]} onActivate={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByLabelText(`Close ${TAB_1.title}`));
    expect(onClose).toHaveBeenCalledWith(101);
  });

  it('does not call onActivate when close is clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<TabBar tabs={[TAB_1]} onActivate={onActivate} onClose={vi.fn()} />);

    await user.click(screen.getByLabelText(`Close ${TAB_1.title}`));
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('renders favicon image when favIconUrl is provided', () => {
    const { container } = render(<TabBar tabs={[TAB_1]} onActivate={vi.fn()} onClose={vi.fn()} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', TAB_1.favIconUrl);
  });

  it('does not render favicon image when favIconUrl is absent', () => {
    const { container } = render(<TabBar tabs={[TAB_2]} onActivate={vi.fn()} onClose={vi.fn()} />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('does not show close button for pinned tab', () => {
    render(<TabBar tabs={[PINNED_TAB]} onActivate={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByLabelText(`Close ${PINNED_TAB.title}`)).not.toBeInTheDocument();
  });

  it('applies active class to active tab', () => {
    const { container } = render(
      <TabBar tabs={[TAB_1, TAB_2]} activeTabId={101} onActivate={vi.fn()} onClose={vi.fn()} />
    );
    const activeTab = container.querySelector('.tabbar-tab--active');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab).toHaveTextContent('GitHub');
  });

  it('applies pinned class to pinned tab', () => {
    const { container } = render(
      <TabBar tabs={[PINNED_TAB, TAB_1]} onActivate={vi.fn()} onClose={vi.fn()} />
    );
    expect(container.querySelector('.tabbar-tab--pinned')).toBeInTheDocument();
  });
});
