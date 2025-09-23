import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createLiveRegion,
  announceToScreenReader,
  announceNavigation,
  announceModalState,
  announceFormValidation,
  announceLoadingState,
  createElementDescription,
  generateNavigationAria,
  generateInteractiveAria,
  createHeadingHierarchy,
  generateSkipLinks,
  createAccessibleTable,
  announceLayoutChange,
  createAccessibleFormField
} from '../screenReader';

describe('screenReader utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  describe('createLiveRegion', () => {
    it('should create a live region element', () => {
      const liveRegion = createLiveRegion();
      
      expect(liveRegion).toBeInstanceOf(HTMLElement);
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
      expect(liveRegion.className).toBe('sr-only');
    });

    it('should return existing live region if it exists', () => {
      const firstRegion = createLiveRegion('test-region');
      const secondRegion = createLiveRegion('test-region');
      
      expect(firstRegion).toBe(secondRegion);
    });

    it('should create assertive live region', () => {
      const liveRegion = createLiveRegion('assertive-region', 'assertive');
      
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('announceToScreenReader', () => {
    it('should create live region and announce message', () => {
      announceToScreenReader('Test message');
      
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion).toBeTruthy();
      
      // Fast-forward timers to trigger the announcement
      vi.advanceTimersByTime(100);
      expect(liveRegion.textContent).toBe('Test message');
      
      // Fast-forward to clear the message
      vi.advanceTimersByTime(1000);
      expect(liveRegion.textContent).toBe('');
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      
      const liveRegion = document.getElementById('sr-live-assertive');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
    });

    it('should support custom delay', () => {
      announceToScreenReader('Custom delay message', 'polite', 2000);
      
      const liveRegion = document.getElementById('sr-live-polite');
      
      vi.advanceTimersByTime(100);
      expect(liveRegion.textContent).toBe('Custom delay message');
      
      vi.advanceTimersByTime(1999);
      expect(liveRegion.textContent).toBe('Custom delay message');
      
      vi.advanceTimersByTime(1);
      expect(liveRegion.textContent).toBe('');
    });
  });

  describe('announceNavigation', () => {
    it('should announce navigation changes', () => {
      announceNavigation('Home', 'About');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('Navigated from Home to About');
    });
  });

  describe('announceModalState', () => {
    it('should announce modal state changes', () => {
      announceModalState('opened', 'Settings dialog');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-assertive');
      expect(liveRegion.textContent).toBe('Settings dialog opened');
    });
  });

  describe('announceFormValidation', () => {
    it('should announce successful form submission', () => {
      announceFormValidation(true);
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('Form submitted successfully');
    });

    it('should announce form errors', () => {
      const errors = ['Name is required', 'Email is invalid'];
      announceFormValidation(false, errors);
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-assertive');
      expect(liveRegion.textContent).toBe('Form has 2 errors. Name is required. Email is invalid');
    });

    it('should handle single error', () => {
      const errors = ['Name is required'];
      announceFormValidation(false, errors);
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-assertive');
      expect(liveRegion.textContent).toBe('Form has 1 error. Name is required');
    });
  });

  describe('announceLoadingState', () => {
    it('should announce loading start', () => {
      announceLoadingState(true, 'user data');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('Loading user data');
    });

    it('should announce loading complete', () => {
      announceLoadingState(false, 'user data');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('user data loaded');
    });

    it('should use default content name', () => {
      announceLoadingState(true);
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('Loading content');
    });
  });

  describe('createElementDescription', () => {
    it('should create basic element description', () => {
      const element = { label: 'Submit button', type: 'button' };
      const description = createElementDescription(element);
      
      expect(description).toBe('Submit button button');
    });

    it('should include state information', () => {
      const element = { 
        label: 'Menu toggle', 
        type: 'button', 
        state: 'expanded' 
      };
      const description = createElementDescription(element);
      
      expect(description).toBe('Menu toggle button, expanded');
    });

    it('should include position information', () => {
      const element = { 
        label: 'Item', 
        type: 'listitem', 
        position: 2, 
        total: 5 
      };
      const description = createElementDescription(element);
      
      expect(description).toBe('Item listitem, 2 of 5');
    });

    it('should handle empty element', () => {
      const description = createElementDescription({});
      expect(description).toBe('');
    });
  });

  describe('generateNavigationAria', () => {
    it('should generate desktop navigation ARIA', () => {
      const aria = generateNavigationAria(false);
      
      expect(aria).toEqual({
        role: 'navigation',
        'aria-label': 'main navigation'
      });
    });

    it('should generate mobile navigation ARIA', () => {
      const aria = generateNavigationAria(true, true, 'mobile');
      
      expect(aria).toEqual({
        role: 'navigation',
        'aria-label': 'mobile navigation menu',
        'aria-expanded': 'true',
        'aria-hidden': 'false'
      });
    });

    it('should generate closed mobile navigation ARIA', () => {
      const aria = generateNavigationAria(true, false, 'mobile');
      
      expect(aria).toEqual({
        role: 'navigation',
        'aria-label': 'mobile navigation menu',
        'aria-expanded': 'false',
        'aria-hidden': 'true'
      });
    });
  });

  describe('generateInteractiveAria', () => {
    it('should generate basic ARIA attributes', () => {
      const element = {
        role: 'button',
        label: 'Submit form',
        expanded: true,
        disabled: false
      };
      
      const aria = generateInteractiveAria(element);
      
      expect(aria).toEqual({
        role: 'button',
        'aria-label': 'Submit form',
        'aria-expanded': 'true',
        'aria-disabled': 'false'
      });
    });

    it('should handle all ARIA attributes', () => {
      const element = {
        role: 'checkbox',
        label: 'Accept terms',
        checked: true,
        required: true,
        invalid: false,
        describedBy: 'terms-help'
      };
      
      const aria = generateInteractiveAria(element);
      
      expect(aria).toEqual({
        role: 'checkbox',
        'aria-label': 'Accept terms',
        'aria-checked': 'true',
        'aria-required': 'true',
        'aria-invalid': 'false',
        'aria-describedby': 'terms-help'
      });
    });

    it('should omit undefined attributes', () => {
      const element = {
        role: 'button',
        label: 'Click me'
      };
      
      const aria = generateInteractiveAria(element);
      
      expect(aria).toEqual({
        role: 'button',
        'aria-label': 'Click me'
      });
    });
  });

  describe('createHeadingHierarchy', () => {
    it('should create proper heading hierarchy', () => {
      const headings = [
        { level: 1, text: 'Main Title', id: 'main' },
        { level: 2, text: 'Subtitle' },
        { level: 3, text: 'Section' }
      ];
      
      const html = createHeadingHierarchy(headings);
      
      expect(html).toBe(
        '<h1 id="main">Main Title</h1>\n<h2>Subtitle</h2>\n<h3>Section</h3>'
      );
    });

    it('should clamp heading levels', () => {
      const headings = [
        { level: 0, text: 'Invalid low' },
        { level: 7, text: 'Invalid high' }
      ];
      
      const html = createHeadingHierarchy(headings);
      
      expect(html).toBe('<h1>Invalid low</h1>\n<h6>Invalid high</h6>');
    });
  });

  describe('generateSkipLinks', () => {
    it('should generate skip links HTML', () => {
      const targets = [
        { href: '#main', label: 'Skip to main content' },
        { href: '#nav', label: 'Skip to navigation' }
      ];
      
      const html = generateSkipLinks(targets);
      
      expect(html).toBe(
        '<a href="#main" class="sr-only focus:not-sr-only skip-nav">Skip to main content</a>\n' +
        '<a href="#nav" class="sr-only focus:not-sr-only skip-nav">Skip to navigation</a>'
      );
    });
  });

  describe('createAccessibleTable', () => {
    it('should create accessible table structure', () => {
      const table = {
        caption: 'User data',
        summary: 'Table showing user information',
        headers: true,
        scope: 'col'
      };
      
      const result = createAccessibleTable(table);
      
      expect(result.attrs).toEqual({
        role: 'table',
        'aria-describedby': 'table-summary'
      });
      
      expect(result.structure.caption).toBe('<caption>User data</caption>');
      expect(result.structure.summary).toBe('<div id="table-summary" class="sr-only">Table showing user information</div>');
      expect(result.structure.headerAttrs).toEqual({ scope: 'col' });
    });
  });

  describe('announceLayoutChange', () => {
    it('should announce layout changes', () => {
      announceLayoutChange('mobile', 'desktop');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion.textContent).toBe('Layout changed to mobile view');
    });

    it('should not announce if breakpoint is the same', () => {
      announceLayoutChange('mobile', 'mobile');
      
      vi.advanceTimersByTime(100);
      const liveRegion = document.getElementById('sr-live-polite');
      expect(liveRegion?.textContent || '').toBe('');
    });
  });

  describe('createAccessibleFormField', () => {
    it('should create accessible form field with help text', () => {
      const field = {
        id: 'email',
        label: 'Email address',
        required: true,
        invalid: false,
        helpText: 'Enter your email address'
      };
      
      const result = createAccessibleFormField(field);
      
      expect(result.attrs).toEqual({
        'aria-label': 'Email address',
        'aria-required': 'true',
        'aria-invalid': 'false',
        'aria-describedby': 'email-help'
      });
      
      expect(result.descriptions).toBe('<div id="email-help" class="sr-only">Enter your email address</div>');
    });

    it('should create accessible form field with error', () => {
      const field = {
        id: 'email',
        label: 'Email address',
        required: true,
        invalid: true,
        errorMessage: 'Please enter a valid email'
      };
      
      const result = createAccessibleFormField(field);
      
      expect(result.attrs).toEqual({
        'aria-label': 'Email address',
        'aria-required': 'true',
        'aria-invalid': 'true',
        'aria-describedby': 'email-error'
      });
      
      expect(result.descriptions).toBe('<div id="email-error" class="sr-only" role="alert">Please enter a valid email</div>');
    });

    it('should handle both help text and error', () => {
      const field = {
        id: 'email',
        label: 'Email address',
        required: true,
        invalid: true,
        errorMessage: 'Please enter a valid email',
        helpText: 'Enter your email address'
      };
      
      const result = createAccessibleFormField(field);
      
      expect(result.attrs['aria-describedby']).toBe('email-help email-error');
      expect(result.descriptions).toContain('email-help');
      expect(result.descriptions).toContain('email-error');
    });
  });
});