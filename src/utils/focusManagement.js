/**
 * Focus management utilities for keyboard navigation
 */

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - The container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  if (!container) return [];

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'iframe',
    'object',
    'embed',
    'area[href]',
    'summary',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="slider"]',
    '[role="spinbutton"]',
    '[role="textbox"]'
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      // Filter out elements that are not actually focusable
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('aria-hidden') &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });
};

/**
 * Trap focus within a container (useful for modals, mobile menus)
 * @param {HTMLElement} container - The container to trap focus within
 * @param {boolean} active - Whether focus trap is active
 * @returns {Function} Cleanup function to remove event listeners
 */
export const trapFocus = (container, active = true) => {
  if (!container || !active) return () => {};

  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus the first element when trap is activated
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Manage focus restoration when returning from modal/overlay
 * @param {HTMLElement} triggerElement - Element that triggered the modal
 * @returns {Function} Function to restore focus
 */
export const createFocusRestorer = (triggerElement) => {
  return () => {
    if (triggerElement && typeof triggerElement.focus === 'function') {
      // Use setTimeout to ensure the modal is fully closed before restoring focus
      setTimeout(() => {
        triggerElement.focus();
      }, 100);
    }
  };
};

/**
 * Handle keyboard navigation for arrow keys in lists/menus
 * @param {KeyboardEvent} event - The keyboard event
 * @param {HTMLElement[]} items - Array of navigable items
 * @param {number} currentIndex - Current focused item index
 * @param {Object} options - Configuration options
 * @returns {number} New focused item index
 */
export const handleArrowNavigation = (event, items, currentIndex, options = {}) => {
  const {
    vertical = true,
    horizontal = false,
    loop = true,
    preventDefault = true
  } = options;

  if (!items || items.length === 0) return currentIndex;

  let newIndex = currentIndex;
  const maxIndex = items.length - 1;

  switch (event.key) {
    case 'ArrowDown':
      if (vertical) {
        if (preventDefault) event.preventDefault();
        newIndex = currentIndex < maxIndex ? currentIndex + 1 : (loop ? 0 : currentIndex);
      }
      break;
    case 'ArrowUp':
      if (vertical) {
        if (preventDefault) event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? maxIndex : currentIndex);
      }
      break;
    case 'ArrowRight':
      if (horizontal) {
        if (preventDefault) event.preventDefault();
        newIndex = currentIndex < maxIndex ? currentIndex + 1 : (loop ? 0 : currentIndex);
      }
      break;
    case 'ArrowLeft':
      if (horizontal) {
        if (preventDefault) event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? maxIndex : currentIndex);
      }
      break;
    case 'Home':
      if (preventDefault) event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      if (preventDefault) event.preventDefault();
      newIndex = maxIndex;
      break;
  }

  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }

  return newIndex;
};

/**
 * Check if an element is currently visible and focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether the element is focusable
 */
export const isElementFocusable = (element) => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    !element.hasAttribute('disabled') &&
    !element.hasAttribute('aria-hidden') &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    element.tabIndex >= 0
  );
};

/**
 * Announce text to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Announcement priority ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};