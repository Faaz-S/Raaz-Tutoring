import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessibilityControls from '../AccessibilityControls';

// Mock hooks
vi.mock('../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    preferences: {
      highContrast: false,
      reducedMotion: false,
      darkMode: false,
      zoomLevel: 100,
      highZoom: false
    },
    accessibilityMode: {
      highContrast: false,
      zoomOptimized: false,
      motionReduced: false
    },
    toggleHighContrast: vi.fn(),
    isHighContrast: false,
    isHighZoom: false,
    isReducedMotion: false
  })
}));

vi.mock('../../hooks/useScreenReader', () => ({
  useScreenReader: () => ({
    announce: vi.fn(),
    getButtonAria: (config) => ({
      'aria-label': config.label,
      'aria-expanded': config.expanded?.toString(),
      'aria-controls': config.controls,
      'aria-pressed': config.pressed?.toString()
    })
  })
}));

describe('AccessibilityControls', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render toggle button', () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open controls panel when toggle button is clicked', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    
    await user.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /accessibility controls panel/i })).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(toggleButton).toHaveAttribute('aria-label', 'Close accessibility controls');
    });
  });

  it('should close controls panel when toggle button is clicked again', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    
    // Open panel
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close panel
    await user.click(toggleButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should display accessibility status information', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Zoom Level:')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Reduced Motion:')).toBeInTheDocument();
      expect(screen.getAllByText('Disabled')).toHaveLength(2); // Both Reduced Motion and Dark Mode
      expect(screen.getByText('Dark Mode:')).toBeInTheDocument();
    });
  });

  it('should have high contrast toggle button', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      const highContrastButton = screen.getByRole('button', { name: /enable high contrast mode/i });
      expect(highContrastButton).toBeInTheDocument();
      expect(highContrastButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('should close panel with close button', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      const closeButtons = screen.getAllByRole('button', { name: /close accessibility controls/i });
      expect(closeButtons).toHaveLength(2); // Toggle button and close button
    });
    
    const closeButtons = screen.getAllByRole('button', { name: /close accessibility controls/i });
    const closeButton = closeButtons.find(btn => btn.textContent === 'Close');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      const panel = screen.getByRole('dialog');
      expect(panel).toHaveAttribute('aria-modal', 'false');
      expect(panel).toHaveAttribute('aria-label', 'Accessibility controls panel');
      expect(panel).toHaveAttribute('id', 'accessibility-panel');
    });
  });

  it('should have minimum touch target sizes', () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    
    expect(toggleButton).toHaveClass('min-h-[44px]');
    expect(toggleButton).toHaveClass('min-w-[44px]');
  });

  it('should have proper focus management', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    
    // Focus should be on toggle button initially
    await user.tab();
    expect(toggleButton).toHaveFocus();
    
    // Open panel
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should display help text', async () => {
    render(<AccessibilityControls />);
    
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText(/these settings help improve accessibility/i)).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    render(<AccessibilityControls />);
    
    // Tab to toggle button
    await user.tab();
    const toggleButton = screen.getByRole('button', { name: /open accessibility controls/i });
    expect(toggleButton).toHaveFocus();
    
    // Open with Enter key
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Tab through controls
    await user.tab();
    const highContrastButton = screen.getByRole('button', { name: /enable high contrast mode/i });
    expect(highContrastButton).toHaveFocus();
    
    await user.tab();
    const closeButtons = screen.getAllByRole('button', { name: /close accessibility controls/i });
    const closeButton = closeButtons.find(btn => btn.textContent === 'Close');
    expect(closeButton).toHaveFocus();
  });

  it('should apply custom className', () => {
    const { container } = render(<AccessibilityControls className="custom-class" />);
    
    const controlsContainer = container.querySelector('.accessibility-controls');
    expect(controlsContainer).toHaveClass('custom-class');
  });
});