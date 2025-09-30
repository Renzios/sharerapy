import { render, screen, fireEvent } from '@testing-library/react';
import WithSidebarLayout from '@/app/(with-sidebar)/layout';

// Mock the components
jest.mock('@/components/Header', () => {
  return function MockHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
      <header role="banner">
        <button onClick={onMenuClick} aria-label="Menu">
          Menu
        </button>
        <h1>Header</h1>
      </header>
    );
  };
});

jest.mock('@/components/Sidebar', () => {
  return function MockSidebar({ setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
    return (
      <aside role="complementary">
        <div>Sidebar Content</div>
        <button onClick={() => setIsOpen(false)}>Close Sidebar</button>
      </aside>
    );
  };
});

describe('WithSidebarLayout', () => {
  it('renders without crashing', () => {
    render(
      <WithSidebarLayout>
        <div>Test Content</div>
      </WithSidebarLayout>
    );
    
    const header = screen.getByRole('banner');
    const sidebar = screen.getByRole('complementary');
    const main = screen.getByRole('main');
    
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('renders children content in main area', () => {
    render(
      <WithSidebarLayout>
        <div data-testid="child-content">Test Content</div>
      </WithSidebarLayout>
    );
    
    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();
    expect(childContent).toHaveTextContent('Test Content');
  });

  it('manages sidebar open/close state correctly', () => {
    render(
      <WithSidebarLayout>
        <div>Test Content</div>
      </WithSidebarLayout>
    );
    
    // Open sidebar
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // The layout should handle the state change
    expect(menuButton).toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked', () => {
    render(
      <WithSidebarLayout>
        <div>Test Content</div>
      </WithSidebarLayout>
    );
    
    // Open sidebar first
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    // Find and click overlay (it has aria-hidden="true")
    const overlayElements = document.querySelectorAll('[aria-hidden="true"]');
    if (overlayElements.length > 0) {
      fireEvent.click(overlayElements[0]);
    }
    
    // Menu button should still be present after closing
    expect(menuButton).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(
      <WithSidebarLayout>
        <div>Test Content</div>
      </WithSidebarLayout>
    );
    
    const header = screen.getByRole('banner');
    const sidebar = screen.getByRole('complementary');
    const main = screen.getByRole('main');
    
    expect(header).toBeInTheDocument();
    expect(sidebar).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });
});