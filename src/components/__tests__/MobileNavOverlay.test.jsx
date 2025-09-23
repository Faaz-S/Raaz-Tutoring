import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MobileNavOverlay from '../MobileNavOverlay';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockLinks = [
  { to: '/', label: 'Home' },
  { to: '/grades-7-9', label: 'Grades 7-9' },
  { to: '/grades-10-12', label: 'Grades 10-12' },
  { to: '/about', label: 'About' },
];

const MobileNavWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('MobileNavOverlay', () => {
  it('should not render when isOpen is false', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={false} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile navigation menu')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    mockLinks.forEach(link => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('should call onClose when backdrop is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    const backdrop = screen.getByRole('dialog').previousSibling;
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when navigation link is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation menu');

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    // Check that links have menuitem role
    mockLinks.forEach(link => {
      const linkElement = screen.getByText(link.label);
      expect(linkElement).toHaveAttribute('role', 'menuitem');
    });
  });

  it('should have proper touch target sizes', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    mockLinks.forEach(link => {
      const linkElement = screen.getByText(link.label);
      expect(linkElement).toHaveClass('min-h-[44px]');
    });
  });

  it('should apply custom className', () => {
    const mockOnClose = vi.fn();
    const customClass = 'custom-overlay';
    render(
      <MobileNavWrapper>
        <MobileNavOverlay 
          isOpen={true} 
          onClose={mockOnClose} 
          links={mockLinks} 
          className={customClass}
        />
      </MobileNavWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(customClass);
  });

  it('should have proper z-index layering', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    const backdrop = screen.getByRole('dialog').previousSibling;
    const dialog = screen.getByRole('dialog');

    expect(backdrop).toHaveClass('z-40');
    expect(dialog).toHaveClass('z-50');
  });

  it('should have backdrop blur effect', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={mockLinks} />
      </MobileNavWrapper>
    );

    const backdrop = screen.getByRole('dialog').previousSibling;
    expect(backdrop).toHaveClass('backdrop-blur-sm');
  });

  it('should handle empty links array', () => {
    const mockOnClose = vi.fn();
    render(
      <MobileNavWrapper>
        <MobileNavOverlay isOpen={true} onClose={mockOnClose} links={[]} />
      </MobileNavWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});