import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';
import MobileNavOverlay from '../MobileNavOverlay';
import HamburgerIcon from '../HamburgerIcon';
import SkipNavigation from '../SkipNavigation';
import { 
  runAccessibilityTests, 
  testKeyboardNavigation,
  generateAccessibilityReport 
} from '../../utils/accessibilityTesting';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}));

// Mock hooks
vi.mock('../../hooks/useAnimationOptimization', () => ({
  useAnimationOptimization: () => ({
    optimizeMotionProps: (props) => props,
    shouldAnimate: false,
    reducedMotion: true
  })
}));

vi.mock('../OptimizedMotion', () => ({
  createResponsiveVariants: (variants) => variants,
  OptimizedMotionDiv: ({ children, ...props }) => <div {...props}>{children}</div>
}));

vi.mock('../../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: () => ({
    containerRef: { current: null },
    setTriggerElement: vi.fn(),
    activateFocusTrap: vi.fn(),
    deactivateFocusTrap: vi.fn(),
    restoreFocus: vi.fn(),
    handleKeyDown: vi.fn(),
    handleEscape: vi.fn(() => vi.fn()),
    announce: vi.fn(),
    currentFocusIndex: 0
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock window.getComputedStyle for accessibility tests
    Object.defineProperty(window, 'getComputedStyle', {
      value: vi.fn(() => ({
        outline: '2px solid blue',
        boxShadow: 'none',
        border: 'none',
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(255, 255, 255)',
        display: 'block',
        visibility: 'visible'
      }))
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SkipNavigation', () => {
    it('should pass accessibility tests', () => {
      render(<SkipNavigation />);
      
      const skipLinks = screen.getAllByRole('link');
      
      skipLinks.forEach(link => {
        const results = runAccessibilityTests(link, {
          requiredAriaAttributes: [],
          checkSemantic: true,
          expectedRole: 'link'
        });
        
        expect(results.passed).toBe(true);
      });
    });

    it('should be keyboard navigable', async () => {
      render(<SkipNavigation />);
      
      const firstLink = screen.getByText('Skip to main content');
      
      // Test Tab navigation
      await user.tab();
      expect(firstLink).toHaveFocus();
      
      // Test Enter key
      await user.keyboard('{Enter}');
      // Should not throw error
    });

    it('should have proper ARIA labels', () => {
      render(<SkipNavigation />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toMatch(/^#/);
      });
    });
  });

  describe('HamburgerIcon', () => {
    it('should pass accessibility tests', () => {
      render(<HamburgerIcon isOpen={false} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      const results = runAccessibilityTests(button, {
        requiredAriaAttributes: ['aria-label', 'aria-expanded'],
        checkSemantic: true,
        expectedRole: 'button'
      });
      
      expect(results.tests.ariaAttributes.passed).toBe(true);
      expect(results.tests.keyboardAccessibility.passed).toBe(true);
    });

    it('should have proper ARIA attributes', () => {
      render(<HamburgerIcon isOpen={false} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label', 'Open navigation menu');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should update ARIA attributes when open', () => {
      const { rerender } = render(<HamburgerIcon isOpen={false} onClick={vi.fn()} />);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Open navigation menu');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      
      rerender(<HamburgerIcon isOpen={true} onClick={vi.fn()} />);
      
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close navigation menu');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be keyboard accessible', async () => {
      const mockOnClick = vi.fn();
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      
      // Test keyboard activation
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalled();
      
      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('should meet minimum touch target size', () => {
      render(<HamburgerIcon isOpen={false} onClick={vi.fn()} />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });
  });

  describe('MobileNavOverlay', () => {
    const mockLinks = [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' }
    ];

    it('should pass accessibility tests when open', () => {
      renderWithRouter(
        <MobileNavOverlay 
          isOpen={true} 
          onClose={vi.fn()} 
          links={mockLinks} 
        />
      );
      
      const dialog = screen.getByRole('dialog');
      const results = runAccessibilityTests(dialog, {
        requiredAriaAttributes: ['aria-modal', 'aria-label'],
        checkSemantic: true,
        expectedRole: 'dialog'
      });
      
      expect(results.tests.ariaAttributes.passed).toBe(true);
    });

    it('should have proper dialog attributes', () => {
      renderWithRouter(
        <MobileNavOverlay 
          isOpen={true} 
          onClose={vi.fn()} 
          links={mockLinks} 
        />
      );
      
      const dialog = screen.getByRole('dialog');
      
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation menu');
      expect(dialog).toHaveAttribute('role', 'dialog');
    });

    it('should have accessible navigation structure', () => {
      renderWithRouter(
        <MobileNavOverlay 
          isOpen={true} 
          onClose={vi.fn()} 
          links={mockLinks} 
        />
      );
      
      const navigation = screen.getByRole('navigation');
      const menu = screen.getByRole('menu');
      const menuItems = screen.getAllByRole('menuitem');
      
      expect(navigation).toHaveAttribute('aria-label', 'Mobile navigation links');
      expect(menu).toBeInTheDocument();
      expect(menuItems).toHaveLength(mockLinks.length);
      
      menuItems.forEach((item, index) => {
        expect(item).toHaveAttribute('role', 'menuitem');
        expect(item).toHaveAttribute('tabindex', '0');
        expect(item).toHaveTextContent(mockLinks[index].label);
      });
    });

    it('should be keyboard navigable', async () => {
      const mockOnClose = vi.fn();
      renderWithRouter(
        <MobileNavOverlay 
          isOpen={true} 
          onClose={mockOnClose} 
          links={mockLinks} 
        />
      );
      
      const menuItems = screen.getAllByRole('menuitem');
      
      // Test Tab navigation through menu items
      await user.tab();
      expect(menuItems[0]).toHaveFocus();
      
      await user.tab();
      expect(menuItems[1]).toHaveFocus();
      
      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle backdrop click', async () => {
      const mockOnClose = vi.fn();
      renderWithRouter(
        <MobileNavOverlay 
          isOpen={true} 
          onClose={mockOnClose} 
          links={mockLinks} 
        />
      );
      
      const backdrop = screen.getByRole('dialog').previousSibling;
      
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Navbar', () => {
    it('should pass accessibility tests', () => {
      renderWithRouter(<Navbar />);
      
      const navigation = screen.getByRole('navigation');
      const results = runAccessibilityTests(navigation, {
        requiredAriaAttributes: ['aria-label'],
        checkSemantic: true,
        expectedRole: 'navigation'
      });
      
      expect(results.tests.ariaAttributes.passed).toBe(true);
    });

    it('should have proper navigation structure', () => {
      renderWithRouter(<Navbar />);
      
      const navigation = screen.getByRole('navigation');
      const menubar = screen.getByRole('menubar');
      const menuItems = screen.getAllByRole('menuitem');
      
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
      expect(navigation).toHaveAttribute('id', 'navigation');
      expect(menubar).toBeInTheDocument();
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should have accessible logo link', () => {
      renderWithRouter(<Navbar />);
      
      const logoLink = screen.getByLabelText('Raaz Tutoring - Go to homepage');
      
      expect(logoLink).toHaveAttribute('href', '/');
      expect(logoLink).toHaveClass('focus:outline-none');
      expect(logoLink).toHaveClass('focus:ring-2');
    });

    it('should be keyboard navigable', async () => {
      renderWithRouter(<Navbar />);
      
      const logoLink = screen.getByLabelText('Raaz Tutoring - Go to homepage');
      const menuItems = screen.getAllByRole('menuitem');
      
      // Test Tab navigation
      await user.tab();
      expect(logoLink).toHaveFocus();
      
      await user.tab();
      expect(menuItems[0]).toHaveFocus();
    });

    it('should handle mobile menu toggle', async () => {
      renderWithRouter(<Navbar />);
      
      const hamburgerButton = screen.getByRole('button');
      
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(hamburgerButton);
      
      await waitFor(() => {
        expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Comprehensive Accessibility Report', () => {
    it('should generate accessibility report for all interactive elements', () => {
      renderWithRouter(
        <div>
          <SkipNavigation />
          <Navbar />
        </div>
      );
      
      const interactiveElements = screen.getAllByRole(/button|link|menuitem/);
      const report = generateAccessibilityReport(interactiveElements);
      
      expect(report.totalElements).toBeGreaterThan(0);
      expect(report.passRate).toBeDefined();
      expect(report.results).toHaveLength(interactiveElements.length);
      expect(report.summary.commonIssues).toBeDefined();
    });

    it('should test keyboard navigation for entire navigation system', async () => {
      const { container } = renderWithRouter(<Navbar />);
      
      const results = await testKeyboardNavigation(container, {
        keys: ['Tab', 'Enter', 'Escape'],
        expectFocusable: true
      });
      
      expect(results.focusableCount).toBeGreaterThan(0);
      expect(results.passed).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus order in navigation', async () => {
      renderWithRouter(<Navbar />);
      
      const focusableElements = screen.getAllByRole(/button|link|menuitem/);
      
      // Test sequential focus
      for (let i = 0; i < Math.min(3, focusableElements.length); i++) {
        await user.tab();
        expect(document.activeElement).toBe(focusableElements[i]);
      }
    });

    it('should handle focus restoration after mobile menu close', async () => {
      renderWithRouter(<Navbar />);
      
      const hamburgerButton = screen.getByRole('button');
      
      // Open mobile menu
      await user.click(hamburgerButton);
      
      // Close mobile menu (simulate escape key)
      await user.keyboard('{Escape}');
      
      // Focus should return to hamburger button
      await waitFor(() => {
        expect(hamburgerButton).toHaveFocus();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce mobile menu state changes', async () => {
      renderWithRouter(<Navbar />);
      
      const hamburgerButton = screen.getByRole('button');
      
      // Check initial state
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Open navigation menu');
      
      // Open menu
      await user.click(hamburgerButton);
      
      await waitFor(() => {
        expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
        expect(hamburgerButton).toHaveAttribute('aria-label', 'Close navigation menu');
      });
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Navbar />);
      
      // Logo should be properly marked up (not as heading since it's a link)
      const logoLink = screen.getByLabelText('Raaz Tutoring - Go to homepage');
      expect(logoLink).toBeInTheDocument();
      
      // Navigation should have proper landmark
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });
  });
});