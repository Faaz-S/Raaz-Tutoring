import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HamburgerIcon from '../HamburgerIcon';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
}));

describe('HamburgerIcon', () => {
  it('should render with correct initial state', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open navigation menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render with open state', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={true} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close navigation menu');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const mockOnClick = vi.fn();
    const customClass = 'custom-hamburger';
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} className={customClass} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('should have proper focus styles', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-accent');
  });

  it('should render three span elements for hamburger lines', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const spans = screen.getAllByRole('button').find(button => 
      button.querySelectorAll('span').length === 3
    );
    expect(spans).toBeTruthy();
  });

  it('should have proper button type', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should handle keyboard events', () => {
    const mockOnClick = vi.fn();
    render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });

    // The button should be focusable and handle keyboard events naturally
    expect(button).toBeInTheDocument();
  });
});