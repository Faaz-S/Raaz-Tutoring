import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FAQ from '../FAQ';

describe('FAQ Component', () => {
  it('renders all FAQ items', () => {
    render(<FAQ />);
    
    // Check for some key FAQ questions
    expect(screen.getByText('What grades do you tutor?')).toBeInTheDocument();
    expect(screen.getByText('How do I schedule a session?')).toBeInTheDocument();
    expect(screen.getByText('Do you offer online tutoring?')).toBeInTheDocument();
    expect(screen.getByText('How much does a tutoring session cost?')).toBeInTheDocument();
  });

  it('applies responsive spacing classes', () => {
    render(<FAQ />);
    
    const container = screen.getByText('What grades do you tutor?').closest('div');
    expect(container).toHaveClass('space-y-3', 'md:space-y-4');
  });

  it('ensures FAQ items have minimum touch target size', () => {
    render(<FAQ />);
    
    const summaryElements = document.querySelectorAll('summary');
    summaryElements.forEach(summary => {
      expect(summary).toHaveClass('min-h-[44px]');
    });
  });

  it('applies responsive typography classes', () => {
    render(<FAQ />);
    
    const summaryElements = document.querySelectorAll('summary');
    summaryElements.forEach(summary => {
      expect(summary).toHaveClass('text-sm', 'md:text-base');
    });
  });

  it('has proper hover and focus states for touch devices', () => {
    render(<FAQ />);
    
    const summaryElements = document.querySelectorAll('summary');
    summaryElements.forEach(summary => {
      expect(summary).toHaveClass('hover:bg-gray-50', 'transition-colors');
    });
  });

  it('expands and collapses FAQ items when clicked', () => {
    render(<FAQ />);
    
    const firstQuestion = screen.getByText('What grades do you tutor?');
    
    // Click to expand
    fireEvent.click(firstQuestion);
    
    // Now the answer should be visible
    expect(screen.getByText('We offer tutoring from Grades 7 through 12 [including AP/IB] in math')).toBeInTheDocument();
  });

  it('handles touch events properly', () => {
    render(<FAQ />);
    
    const firstQuestion = screen.getByText('What grades do you tutor?');
    
    // Simulate touch events
    fireEvent.touchStart(firstQuestion);
    fireEvent.touchEnd(firstQuestion);
    fireEvent.click(firstQuestion);
    
    // Answer should be visible after touch interaction
    expect(screen.getByText('We offer tutoring from Grades 7 through 12 [including AP/IB] in math')).toBeInTheDocument();
  });

  it('displays expand/collapse indicator', () => {
    render(<FAQ />);
    
    const expandIndicators = screen.getAllByText('+');
    expect(expandIndicators.length).toBeGreaterThan(0);
    
    expandIndicators.forEach(indicator => {
      expect(indicator).toHaveClass('text-blue-600', 'text-lg', 'md:text-xl');
    });
  });

  it('applies proper padding for mobile and desktop', () => {
    render(<FAQ />);
    
    const summaryElements = document.querySelectorAll('summary');
    summaryElements.forEach(summary => {
      expect(summary).toHaveClass('p-4', 'md:p-5');
    });
  });

  it('ensures text is readable with proper line height', () => {
    render(<FAQ />);
    
    const summaryElements = document.querySelectorAll('summary');
    summaryElements.forEach(summary => {
      expect(summary).toHaveClass('leading-relaxed');
    });
  });

  it('handles long text properly without overflow', () => {
    render(<FAQ />);
    
    // Find a longer FAQ item
    const longQuestion = screen.getByText('How much does a tutoring session cost?');
    fireEvent.click(longQuestion);
    
    const longAnswer = screen.getByText(/Pricing varies depending on the subject and specialization/);
    expect(longAnswer).toHaveClass('leading-relaxed');
  });
});