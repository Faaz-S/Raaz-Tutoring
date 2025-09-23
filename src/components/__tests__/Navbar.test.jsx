import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Navbar from '../Navbar';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock child components
vi.mock('../HamburgerIcon', () => ({
  default: ({ isOpen, onClick, className }) => (
    <button 
      onClick={onClick} 
      className={className}
      data-testid="hamburger-icon"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
    >
      Hamburger {isOpen ? 'Open' : 'Closed'}
    </button>
  ),
}));

vi.mock('../MobileNavOverlay', () => ({
  default: ({ isOpen, onClose, links }) => (
    isOpen ? (
      <div data-testid="mobile-nav-overlay" role="dialog">
        <div onClick={onClose} data-testid="backdrop">Backdrop</div>
        {links.map(link => (
          <a key={link.to} href={link.to} onClick={onClose}>
            {link.label}
          </a>
        ))}
      </div>
    ) : null
  ),
}));

const NavbarWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Navbar Mobile Menu State Management', () => {
  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up body overflow style after each test
    document.body.style.overflow = 'unset';
  });

  it('should initialize with mobile menu closed', () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    // Mobile menu should not be visible initially
    expect(document.body.style.overflow).toBe('unset');
  });

  it('should toggle mobile menu state when hamburger is clicked', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');
    
    // Initially menu should be closed
    expect(screen.queryByTestId('mobile-nav-overlay')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('unset');

    // Click to open menu
    fireEvent.click(hamburgerButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-nav-overlay')).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
    });

    // Click to close menu
    fireEvent.click(hamburgerButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-nav-overlay')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  it('should close mobile menu when clicking outside', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');
    
    // Open the menu first
    fireEvent.click(hamburgerButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-nav-overlay')).toBeInTheDocument();
    });

    // Click on backdrop to close
    const backdrop = screen.getByTestId('backdrop');
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByTestId('mobile-nav-overlay')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  it('should prevent body scroll when mobile menu is open', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');

    // Initially body should be scrollable
    expect(document.body.style.overflow).toBe('unset');

    // Open menu
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    // Close menu
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  it('should handle touch events for mobile devices', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    // Test touch events
    fireEvent.touchStart(outsideElement);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
    });

    document.body.removeChild(outsideElement);
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    unmount();

    // Verify cleanup happens
    expect(removeEventListenerSpy).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});

describe('Navbar Mobile Integration', () => {
  beforeEach(() => {
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('should render hamburger icon on mobile and hide desktop navigation', () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    // Hamburger should be visible (in mobile container)
    expect(screen.getByTestId('hamburger-icon')).toBeInTheDocument();

    // Desktop navigation should have md:flex class (hidden on mobile)
    const desktopNav = screen.getByText('Home').closest('.hidden.md\\:flex');
    expect(desktopNav).toBeInTheDocument();
  });

  it('should show all navigation links in mobile overlay', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      const overlay = screen.getByTestId('mobile-nav-overlay');
      expect(overlay).toBeInTheDocument();
      
      // Check that all navigation links are present in the overlay
      expect(screen.getAllByText('Home')).toHaveLength(2); // Desktop + Mobile
      expect(screen.getAllByText('Grades 7-9')).toHaveLength(2);
      expect(screen.getAllByText('Grades 10-12')).toHaveLength(2);
      expect(screen.getAllByText('About')).toHaveLength(2);
    });
  });

  it('should close mobile menu when navigation link is clicked', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');
    
    // Open menu
    fireEvent.click(hamburgerButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mobile-nav-overlay')).toBeInTheDocument();
    });

    // Click on a navigation link in the mobile overlay
    const mobileOverlay = screen.getByTestId('mobile-nav-overlay');
    const aboutLink = mobileOverlay.querySelector('a[href="/about"]');
    fireEvent.click(aboutLink);

    await waitFor(() => {
      expect(screen.queryByTestId('mobile-nav-overlay')).not.toBeInTheDocument();
    });
  });

  it('should maintain proper ARIA states for hamburger icon', async () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    const hamburgerButton = screen.getByTestId('hamburger-icon');
    
    // Initially closed
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open navigation menu');

    // Open menu
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Close navigation menu');
    });

    // Close menu
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Open navigation menu');
    });
  });

  it('should handle responsive breakpoint transitions', () => {
    render(
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
    );

    // Mobile container should have md:hidden class
    const mobileContainer = screen.getByTestId('hamburger-icon').closest('.md\\:hidden');
    expect(mobileContainer).toBeInTheDocument();

    // Desktop navigation should have hidden md:flex classes
    const desktopNav = screen.getByText('Home').closest('.hidden.md\\:flex');
    expect(desktopNav).toBeInTheDocument();
  });
});