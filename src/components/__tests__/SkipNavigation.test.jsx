import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkipNavigation from '../SkipNavigation';

describe('SkipNavigation', () => {
  it('should render skip navigation links', () => {
    render(<SkipNavigation />);
    
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
    expect(screen.getByText('Skip to contact form')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<SkipNavigation />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    const navigationLink = screen.getByText('Skip to navigation');
    const contactLink = screen.getByText('Skip to contact form');
    
    expect(mainContentLink).toHaveAttribute('href', '#main-content');
    expect(navigationLink).toHaveAttribute('href', '#navigation');
    expect(contactLink).toHaveAttribute('href', '#contact');
  });

  it('should be initially hidden with sr-only class', () => {
    render(<SkipNavigation />);
    
    const container = screen.getByText('Skip to main content').parentElement;
    expect(container).toHaveClass('sr-only');
  });

  it('should show links when focused', () => {
    render(<SkipNavigation />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    
    // Focus the link
    fireEvent.focus(mainContentLink);
    
    // Check that the transform style is applied
    expect(mainContentLink.style.transform).toBe('translateY(0)');
  });

  it('should hide links when focus is lost', () => {
    render(<SkipNavigation />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    
    // Focus then blur the link
    fireEvent.focus(mainContentLink);
    fireEvent.blur(mainContentLink);
    
    // Check that the transform style is reset
    expect(mainContentLink.style.transform).toBe('translateY(-100%)');
  });

  it('should have proper accessibility attributes', () => {
    render(<SkipNavigation />);
    
    const links = screen.getAllByRole('link');
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.getAttribute('href')).toMatch(/^#/);
    });
  });

  it('should have minimum touch target size', () => {
    render(<SkipNavigation />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    
    expect(mainContentLink).toHaveClass('min-h-[44px]');
  });

  it('should have proper focus styles', () => {
    render(<SkipNavigation />);
    
    const mainContentLink = screen.getByText('Skip to main content');
    
    expect(mainContentLink).toHaveClass('focus:outline-none');
    expect(mainContentLink).toHaveClass('focus:ring-2');
    expect(mainContentLink).toHaveClass('focus:ring-white');
  });
});