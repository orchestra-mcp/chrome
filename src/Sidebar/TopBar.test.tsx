import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders Orchestra branding', () => {
    render(<TopBar connected={false} />);
    expect(screen.getByText('Orchestra')).toBeInTheDocument();
  });

  it('shows connected status indicator when connected', () => {
    render(<TopBar connected={true} />);
    const indicator = screen.getByTitle('Connected');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('chrome-sidebar-header__status--connected');
  });

  it('shows disconnected status indicator when not connected', () => {
    render(<TopBar connected={false} />);
    const indicator = screen.getByTitle('Disconnected');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('chrome-sidebar-header__status--disconnected');
  });

  it('renders quick action button when handler provided', () => {
    const mockHandler = vi.fn();
    render(<TopBar connected={false} onQuickAction={mockHandler} />);
    expect(screen.getByRole('button', { name: 'Quick actions' })).toBeInTheDocument();
  });

  it('does not render quick action button when no handler', () => {
    render(<TopBar connected={false} />);
    expect(screen.queryByRole('button', { name: 'Quick actions' })).not.toBeInTheDocument();
  });

  it('calls onQuickAction when button clicked', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();
    render(<TopBar connected={false} onQuickAction={mockHandler} />);

    const button = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(button);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('renders Orchestra logo', () => {
    const { container } = render(<TopBar connected={false} />);
    // OrchestraLogo renders an SVG
    const logo = container.querySelector('svg');
    expect(logo).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<TopBar connected={false} />);
    const topBar = container.querySelector('.chrome-topbar');
    expect(topBar).toBeInTheDocument();
  });
});
