import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewTitle } from './ViewTitle';
import type { SidebarAction } from '../types/sidebar';

vi.mock('@orchestra-mcp/icons', () => ({
  BoxIcon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />,
}));

const MOCK_ACTIONS: SidebarAction[] = [
  { id: 'new-file', icon: 'bx-file-blank', tooltip: 'New File', action: 'explorer.newFile' },
  { id: 'refresh', icon: 'bx-refresh', tooltip: 'Refresh', action: 'explorer.refresh' },
];

describe('ViewTitle', () => {
  it('renders the title text', () => {
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={false}
      />
    );
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  it('renders action buttons with tooltips', () => {
    render(
      <ViewTitle
        title="Explorer"
        actions={MOCK_ACTIONS}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={false}
      />
    );
    expect(screen.getByLabelText('New File')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
  });

  it('calls onAction with action id when action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <ViewTitle
        title="Explorer"
        actions={MOCK_ACTIONS}
        onAction={onAction}
        onSearch={vi.fn()}
        hasSearch={false}
      />
    );

    await user.click(screen.getByLabelText('New File'));
    expect(onAction).toHaveBeenCalledWith('new-file');
  });

  it('shows search toggle button when hasSearch is true', () => {
    render(
      <ViewTitle
        title="Search"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={true}
      />
    );
    expect(screen.getByLabelText('Toggle search')).toBeInTheDocument();
  });

  it('hides search toggle button when hasSearch is false', () => {
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={false}
      />
    );
    expect(screen.queryByLabelText('Toggle search')).not.toBeInTheDocument();
  });

  it('shows search input when search toggle is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={true}
      />
    );

    await user.click(screen.getByLabelText('Toggle search'));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('hides search input after second toggle click', async () => {
    const user = userEvent.setup();
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={true}
      />
    );

    await user.click(screen.getByLabelText('Toggle search'));
    await user.click(screen.getByLabelText('Toggle search'));
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('calls onSearch when typing in the search input', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={onSearch}
        hasSearch={true}
      />
    );

    await user.click(screen.getByLabelText('Toggle search'));
    await user.type(screen.getByPlaceholderText('Search...'), 'hello');
    expect(onSearch).toHaveBeenCalledWith('hello');
  });

  it('calls onSearch with empty string when search is closed', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <ViewTitle
        title="Explorer"
        actions={[]}
        onAction={vi.fn()}
        onSearch={onSearch}
        hasSearch={true}
      />
    );

    await user.click(screen.getByLabelText('Toggle search'));
    await user.type(screen.getByPlaceholderText('Search...'), 'text');
    await user.click(screen.getByLabelText('Toggle search'));
    expect(onSearch).toHaveBeenLastCalledWith('');
  });

  it('renders no action buttons when actions array is empty', () => {
    render(
      <ViewTitle
        title="Settings"
        actions={[]}
        onAction={vi.fn()}
        onSearch={vi.fn()}
        hasSearch={false}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
