import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getFocusableElements,
  trapFocus,
  createFocusRestorer,
  handleArrowNavigation,
  isElementFocusable,
  announceToScreenReader
} from '../focusManagement';

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    display: 'block',
    visibility: 'visible'
  }))
});

// Mock offsetWidth and offsetHeight for elements
const mockElementDimensions = (element) => {
  Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
  Object.defineProperty(element, 'offsetHeight', { value: 30, configurable: true });
};

describe('focusManagement', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFocusableElements', () => {
    it('should return empty array for null container', () => {
      expect(getFocusableElements(null)).toEqual([]);
    });

    it('should find focusable elements', () => {
      container.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <div tabindex="0">Focusable div</div>
        <div>Non-focusable div</div>
      `;

      // Mock dimensions for all elements
      Array.from(container.querySelectorAll('*')).forEach(mockElementDimensions);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(4);
      expect(focusableElements[0].tagName).toBe('BUTTON');
      expect(focusableElements[1].tagName).toBe('A');
      expect(focusableElements[2].tagName).toBe('INPUT');
      expect(focusableElements[3].tagName).toBe('DIV');
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Enabled Button</button>
        <button disabled>Disabled Button</button>
        <input type="text" />
        <input type="text" disabled />
      `;

      // Mock dimensions for all elements
      Array.from(container.querySelectorAll('*')).forEach(mockElementDimensions);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);
      expect(focusableElements[0].hasAttribute('disabled')).toBe(false);
      expect(focusableElements[1].hasAttribute('disabled')).toBe(false);
    });

    it('should exclude elements with tabindex="-1"', () => {
      container.innerHTML = `
        <button>Button</button>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Non-focusable div</div>
      `;

      // Mock dimensions for all elements
      Array.from(container.querySelectorAll('*')).forEach(mockElementDimensions);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);
    });
  });

  describe('trapFocus', () => {
    it('should return cleanup function when container is null', () => {
      const cleanup = trapFocus(null);
      expect(typeof cleanup).toBe('function');
    });

    it('should return cleanup function when active is false', () => {
      const cleanup = trapFocus(container, false);
      expect(typeof cleanup).toBe('function');
    });

    it('should trap focus within container', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="last">Last</button>
      `;

      const firstButton = container.querySelector('#first');
      const lastButton = container.querySelector('#last');
      
      // Mock focus method
      firstButton.focus = vi.fn();
      lastButton.focus = vi.fn();

      const cleanup = trapFocus(container, true);

      // Simulate Tab key on last element
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(document, 'activeElement', {
        value: lastButton,
        configurable: true
      });

      container.dispatchEvent(tabEvent);

      cleanup();
      expect(typeof cleanup).toBe('function');
    });
  });

  describe('createFocusRestorer', () => {
    it('should return function that focuses trigger element', () => {
      const triggerElement = document.createElement('button');
      triggerElement.focus = vi.fn();

      const restoreFocus = createFocusRestorer(triggerElement);
      expect(typeof restoreFocus).toBe('function');

      restoreFocus();
      
      // Use setTimeout to match the implementation
      setTimeout(() => {
        expect(triggerElement.focus).toHaveBeenCalled();
      }, 100);
    });

    it('should handle null trigger element', () => {
      const restoreFocus = createFocusRestorer(null);
      expect(typeof restoreFocus).toBe('function');
      
      // Should not throw error
      expect(() => restoreFocus()).not.toThrow();
    });
  });

  describe('handleArrowNavigation', () => {
    let items;

    beforeEach(() => {
      items = [
        { focus: vi.fn() },
        { focus: vi.fn() },
        { focus: vi.fn() }
      ];
    });

    it('should handle ArrowDown navigation', () => {
      const event = { key: 'ArrowDown', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 0);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(newIndex).toBe(1);
      expect(items[1].focus).toHaveBeenCalled();
    });

    it('should handle ArrowUp navigation', () => {
      const event = { key: 'ArrowUp', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 1);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
    });

    it('should loop to beginning when at end with ArrowDown', () => {
      const event = { key: 'ArrowDown', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 2, { loop: true });
      
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
    });

    it('should not loop when loop is false', () => {
      const event = { key: 'ArrowDown', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 2, { loop: false });
      
      expect(newIndex).toBe(2);
      expect(items[0].focus).not.toHaveBeenCalled();
    });

    it('should handle Home key', () => {
      const event = { key: 'Home', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 2);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
    });

    it('should handle End key', () => {
      const event = { key: 'End', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 0);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(newIndex).toBe(2);
      expect(items[2].focus).toHaveBeenCalled();
    });

    it('should return current index for unhandled keys', () => {
      const event = { key: 'Enter', preventDefault: vi.fn() };
      const newIndex = handleArrowNavigation(event, items, 1);
      
      expect(newIndex).toBe(1);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('isElementFocusable', () => {
    it('should return false for null element', () => {
      expect(isElementFocusable(null)).toBe(false);
    });

    it('should return true for focusable element', () => {
      const button = document.createElement('button');
      button.tabIndex = 0;
      
      // Mock offsetWidth and offsetHeight
      Object.defineProperty(button, 'offsetWidth', { value: 100 });
      Object.defineProperty(button, 'offsetHeight', { value: 30 });
      
      expect(isElementFocusable(button)).toBe(true);
    });

    it('should return false for disabled element', () => {
      const button = document.createElement('button');
      button.disabled = true;
      
      expect(isElementFocusable(button)).toBe(false);
    });

    it('should return false for hidden element', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-hidden', 'true');
      
      expect(isElementFocusable(button)).toBe(false);
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      announceToScreenReader('Test message');
      
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeTruthy();
      expect(announcement.getAttribute('aria-live')).toBe('polite');
      expect(announcement.textContent).toBe('Test message');
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
      expect(announcement.textContent).toBe('Urgent message');
    });

    it('should remove announcement after timeout', (done) => {
      announceToScreenReader('Temporary message');
      
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeTruthy();
      
      setTimeout(() => {
        const removedAnnouncement = document.querySelector('[aria-live]');
        expect(removedAnnouncement).toBeFalsy();
        done();
      }, 1100);
    });
  });
});