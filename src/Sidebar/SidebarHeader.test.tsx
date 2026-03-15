import { render, screen } from '@testing-library/react';
import { SidebarHeader } from './SidebarHeader';

vi.mock('@orchestra-mcp/icons', () => ({
  OrchestraLogo: (props: any) => <svg data-testid="orchestra-logo" {...props} />,
}));

describe('SidebarHeader', () => {
  it('renders Orchestra branding text', () => {
    render(<SidebarHeader connected={false} />);
    expect(screen.getByText('Orchestra')).toBeInTheDocument();
  });

  it('renders the Orchestra logo', () => {
    render(<SidebarHeader connected={false} />);
    expect(screen.getByTestId('orchestra-logo')).toBeInTheDocument();
  });

  it('shows connected indicator title when connected', () => {
    render(<SidebarHeader connected={true} />);
    expect(screen.getByTitle('Connected to desktop')).toBeInTheDocument();
  });

  it('shows disconnected indicator title when not connected', () => {
    render(<SidebarHeader connected={false} />);
    expect(screen.getByTitle('Disconnected')).toBeInTheDocument();
  });

  it('applies connected class to indicator when connected', () => {
    render(<SidebarHeader connected={true} />);
    const dot = screen.getByTitle('Connected to desktop');
    expect(dot).toHaveClass('chrome-sidebar-header__status--connected');
  });

  it('applies disconnected class to indicator when disconnected', () => {
    render(<SidebarHeader connected={false} />);
    const dot = screen.getByTitle('Disconnected');
    expect(dot).toHaveClass('chrome-sidebar-header__status--disconnected');
  });

  it('has correct container class', () => {
    const { container } = render(<SidebarHeader connected={false} />);
    const wrapper = container.querySelector('.chrome-sidebar-header');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders dot indicator element', () => {
    const { container } = render(<SidebarHeader connected={true} />);
    const dot = container.querySelector('.chrome-sidebar-header__status');
    expect(dot).toBeInTheDocument();
  });
});
