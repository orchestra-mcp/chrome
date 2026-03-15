import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders empty status bar', () => {
    const { container } = render(<StatusBar />);
    expect(container.querySelector('.chrome-statusbar')).toBeInTheDocument();
  });

  it('displays plugin count when provided', () => {
    render(<StatusBar pluginCount={3} />);
    expect(screen.getByText('3 plugins')).toBeInTheDocument();
  });

  it('displays singular plugin text for count of 1', () => {
    render(<StatusBar pluginCount={1} />);
    expect(screen.getByText('1 plugin')).toBeInTheDocument();
  });

  it('does not display plugin count when 0', () => {
    render(<StatusBar pluginCount={0} />);
    expect(screen.queryByText(/plugin/)).not.toBeInTheDocument();
  });

  it('does not display plugin count when not provided', () => {
    render(<StatusBar />);
    expect(screen.queryByText(/plugin/)).not.toBeInTheDocument();
  });

  it('shows connected status when connected', () => {
    render(<StatusBar connected={true} />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows offline status when disconnected', () => {
    render(<StatusBar connected={false} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows offline status by default', () => {
    render(<StatusBar />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows sync indicator when syncing', () => {
    render(<StatusBar syncing={true} />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('does not show sync indicator when not syncing', () => {
    render(<StatusBar syncing={false} />);
    expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();
  });

  it('does not show sync indicator by default', () => {
    render(<StatusBar />);
    expect(screen.queryByText('Syncing...')).not.toBeInTheDocument();
  });

  it('has correct layout styling', () => {
    const { container } = render(<StatusBar />);
    const statusBar = container.firstChild;
    expect(statusBar).toHaveClass('chrome-statusbar');
  });

  it('renders all props together', () => {
    render(<StatusBar connected={true} pluginCount={3} syncing={true} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('3 plugins')).toBeInTheDocument();
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('connected indicator dot uses connected class when connected', () => {
    const { container } = render(<StatusBar connected={true} />);
    const dot = container.querySelector('.chrome-statusbar__dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('chrome-sidebar-header__status--connected');
  });

  it('connected indicator dot uses disconnected class when offline', () => {
    const { container } = render(<StatusBar connected={false} />);
    const dot = container.querySelector('.chrome-statusbar__dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('chrome-sidebar-header__status--disconnected');
  });

  it('syncing text has sync class', () => {
    render(<StatusBar syncing={true} />);
    const syncText = screen.getByText('Syncing...');
    expect(syncText).toHaveClass('chrome-statusbar__sync');
  });

  it('plugin count text has plugins class', () => {
    render(<StatusBar pluginCount={2} />);
    const pluginText = screen.getByText('2 plugins');
    expect(pluginText).toHaveClass('chrome-statusbar__plugins');
  });
});
