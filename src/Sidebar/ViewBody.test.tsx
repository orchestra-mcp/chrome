import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewBody } from './ViewBody';

vi.mock('@orchestra-mcp/icons', () => ({
  BoxIcon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />,
}));

describe('ViewBody', () => {
  it('renders explorer view for activeViewId=explorer', () => {
    render(<ViewBody activeViewId="explorer" searchQuery="" />);
    expect(screen.getByText('No workspace open')).toBeInTheDocument();
  });

  it('renders search view for activeViewId=search', () => {
    render(<ViewBody activeViewId="search" searchQuery="" />);
    expect(screen.getByPlaceholderText('Search files, symbols, text...')).toBeInTheDocument();
  });

  it('renders extensions view for activeViewId=extensions', () => {
    render(<ViewBody activeViewId="extensions" searchQuery="" />);
    expect(screen.getByText('Marketplace coming soon')).toBeInTheDocument();
  });

  it('renders settings placeholder for activeViewId=settings without content', () => {
    render(<ViewBody activeViewId="settings" searchQuery="" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/Connect to the desktop app/)).toBeInTheDocument();
  });

  it('renders custom settingsContent when provided', () => {
    render(
      <ViewBody
        activeViewId="settings"
        searchQuery=""
        settingsContent={<div>Custom Settings Content</div>}
      />
    );
    expect(screen.getByText('Custom Settings Content')).toBeInTheDocument();
  });

  it('renders placeholder view for unknown activeViewId', () => {
    render(<ViewBody activeViewId="unknown-view" searchQuery="" />);
    expect(screen.getByText(/View "unknown-view" is loading/)).toBeInTheDocument();
  });

  it('search view initialises input with searchQuery prop', () => {
    render(<ViewBody activeViewId="search" searchQuery="myQuery" />);
    const input = screen.getByPlaceholderText('Search files, symbols, text...');
    expect(input).toHaveValue('myQuery');
  });

  it('search view shows no results text when query is entered', async () => {
    const user = userEvent.setup();
    render(<ViewBody activeViewId="search" searchQuery="" />);
    const input = screen.getByPlaceholderText('Search files, symbols, text...');
    await user.type(input, 'hello');
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('search view shows type-to-search hint when query is empty', () => {
    render(<ViewBody activeViewId="search" searchQuery="" />);
    expect(screen.getByText('Type to search')).toBeInTheDocument();
  });

  it('explorer view renders hint text', () => {
    render(<ViewBody activeViewId="explorer" searchQuery="" />);
    expect(screen.getByText(/Open a project/)).toBeInTheDocument();
  });
});
