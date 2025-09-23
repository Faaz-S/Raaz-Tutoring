import { useEffect, useRef, useCallback } from 'react';
import { 
  trapFocus, 
  createFocusRestorer, 
  handleArrowNavigation,
  announceToScreenReader 
} from '../utils/focusManagement';

/**
 * Hook for managing keyboard navigation in components
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation utilities and refs
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    trapFocusWhenActive = false,
    restoreFocusOnClose = false,
    announceStateChanges = false,
    enableArrowNavigation = false,
    arrowNavigationOptions = {}
  } = options;

  const containerRef = useRef(null);
  const triggerElementRef = useRef(null);
  const focusRestorer = useRef(null);
  const cleanupFocusTrap = useRef(null);
  const currentFocusIndex = useRef(0);

  // Store the element that triggered the component (for focus restoration)
  const setTriggerElement = useCallback((element) => {
    triggerElementRef.current = element || document.activeElement;
    if (restoreFocusOnClose) {
      focusRestorer.current = createFocusRestorer(triggerElementRef.current);
    }
  }, [restoreFocusOnClose]);

  // Activate focus trap
  const activateFocusTrap = useCallback(() => {
    if (trapFocusWhenActive && containerRef.current) {
      cleanupFocusTrap.current = trapFocus(containerRef.current, true);
    }
  }, [trapFocusWhenActive]);

  // Deactivate focus trap
  const deactivateFocusTrap = useCallback(() => {
    if (cleanupFocusTrap.current) {
      cleanupFocusTrap.current();
      cleanupFocusTrap.current = null;
    }
  }, []);

  // Restore focus to trigger element
  const restoreFocus = useCallback(() => {
    if (focusRestorer.current) {
      focusRestorer.current();
    }
  }, []);

  // Handle keyboard events for arrow navigation
  const handleKeyDown = useCallback((event) => {
    if (!enableArrowNavigation || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const items = Array.from(focusableElements).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    const newIndex = handleArrowNavigation(
      event, 
      items, 
      currentIndex, 
      arrowNavigationOptions
    );

    currentFocusIndex.current = newIndex;
  }, [enableArrowNavigation, arrowNavigationOptions]);

  // Announce state changes to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    if (announceStateChanges) {
      announceToScreenReader(message, priority);
    }
  }, [announceStateChanges]);

  // Handle Escape key to close/deactivate
  const handleEscape = useCallback((callback) => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivateFocusTrap();
    };
  }, [deactivateFocusTrap]);

  return {
    containerRef,
    setTriggerElement,
    activateFocusTrap,
    deactivateFocusTrap,
    restoreFocus,
    handleKeyDown,
    handleEscape,
    announce,
    currentFocusIndex: currentFocusIndex.current
  };
};

/**
 * Hook for managing roving tabindex in lists/menus
 * @param {Array} items - Array of items to navigate
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation state and handlers
 */
export const useRovingTabIndex = (items = [], options = {}) => {
  const { 
    defaultIndex = 0,
    loop = true,
    orientation = 'vertical'
  } = options;

  const currentIndex = useRef(defaultIndex);
  const itemRefs = useRef([]);

  // Update tabindex for all items
  const updateTabIndex = useCallback((activeIndex) => {
    itemRefs.current.forEach((ref, index) => {
      if (ref.current) {
        ref.current.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
    currentIndex.current = activeIndex;
  }, []);

  // Move focus to specific index
  const focusItem = useCallback((index) => {
    if (index >= 0 && index < items.length && itemRefs.current[index]?.current) {
      updateTabIndex(index);
      itemRefs.current[index].current.focus();
    }
  }, [items.length, updateTabIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    let newIndex = currentIndex.current;

    const isVertical = orientation === 'vertical';
    const isHorizontal = orientation === 'horizontal';

    if ((isVertical && (key === 'ArrowDown' || key === 'ArrowUp')) ||
        (isHorizontal && (key === 'ArrowLeft' || key === 'ArrowRight'))) {
      
      event.preventDefault();
      
      if ((isVertical && key === 'ArrowDown') || (isHorizontal && key === 'ArrowRight')) {
        newIndex = currentIndex.current < items.length - 1 
          ? currentIndex.current + 1 
          : (loop ? 0 : currentIndex.current);
      } else {
        newIndex = currentIndex.current > 0 
          ? currentIndex.current - 1 
          : (loop ? items.length - 1 : currentIndex.current);
      }
      
      focusItem(newIndex);
    } else if (key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (key === 'End') {
      event.preventDefault();
      focusItem(items.length - 1);
    }
  }, [items.length, loop, orientation, focusItem]);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = items.map((_, index) => itemRefs.current[index] || { current: null });
  }, [items.length]);

  // Set initial tabindex
  useEffect(() => {
    updateTabIndex(defaultIndex);
  }, [defaultIndex, updateTabIndex]);

  return {
    itemRefs,
    currentIndex: currentIndex.current,
    focusItem,
    handleKeyDown,
    updateTabIndex
  };
};