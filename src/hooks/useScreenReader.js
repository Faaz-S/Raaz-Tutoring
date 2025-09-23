import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  announceToScreenReader, 
  announceNavigation, 
  announceModalState,
  announceLayoutChange,
  generateNavigationAria,
  generateInteractiveAria
} from '../utils/screenReader';
import { useResponsive } from './useResponsive';

/**
 * Hook for screen reader optimizations
 * @param {Object} options - Configuration options
 * @returns {Object} Screen reader utilities
 */
export const useScreenReader = (options = {}) => {
  const {
    announceRouteChanges = true,
    announceLayoutChanges = true,
    announceModalChanges = true
  } = options;

  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  const previousBreakpoint = useRef(breakpoint);

  // Announce route changes
  useEffect(() => {
    if (announceRouteChanges && location.pathname !== previousLocation.current) {
      const fromPath = previousLocation.current;
      const toPath = location.pathname;
      
      // Convert paths to readable names
      const getPageName = (path) => {
        const routes = {
          '/': 'Home',
          '/about': 'About',
          '/grades-7-9': 'Grades 7 to 9',
          '/grades-10-12': 'Grades 10 to 12'
        };
        return routes[path] || path.replace('/', '').replace('-', ' ');
      };

      const fromName = getPageName(fromPath);
      const toName = getPageName(toPath);

      announceNavigation(fromName, toName);
      previousLocation.current = location.pathname;
    }
  }, [location.pathname, announceRouteChanges]);

  // Announce layout changes
  useEffect(() => {
    if (announceLayoutChanges && breakpoint !== previousBreakpoint.current) {
      announceLayoutChange(breakpoint, previousBreakpoint.current);
      previousBreakpoint.current = breakpoint;
    }
  }, [breakpoint, announceLayoutChanges]);

  // Announce function
  const announce = useCallback((message, priority = 'polite', delay = 1000) => {
    announceToScreenReader(message, priority, delay);
  }, []);

  // Announce modal state changes
  const announceModal = useCallback((action, modalName) => {
    if (announceModalChanges) {
      announceModalState(action, modalName);
    }
  }, [announceModalChanges]);

  // Generate navigation ARIA attributes
  const getNavigationAria = useCallback((menuType = 'main', isOpen = false) => {
    return generateNavigationAria(isMobile, isOpen, menuType);
  }, [isMobile]);

  // Generate interactive element ARIA attributes
  const getInteractiveAria = useCallback((element) => {
    return generateInteractiveAria(element);
  }, []);

  // Create accessible button attributes
  const getButtonAria = useCallback((config) => {
    const {
      label,
      expanded,
      controls,
      describedBy,
      pressed,
      disabled
    } = config;

    return getInteractiveAria({
      role: 'button',
      label,
      expanded,
      controls,
      describedBy,
      checked: pressed,
      disabled
    });
  }, [getInteractiveAria]);

  // Create accessible link attributes
  const getLinkAria = useCallback((config) => {
    const {
      label,
      current,
      describedBy,
      external
    } = config;

    const attrs = getInteractiveAria({
      role: 'link',
      label,
      current,
      describedBy
    });

    if (external) {
      attrs['aria-label'] = `${label} (opens in new window)`;
    }

    return attrs;
  }, [getInteractiveAria]);

  // Create accessible form field attributes
  const getFormFieldAria = useCallback((config) => {
    const {
      label,
      required,
      invalid,
      describedBy,
      type = 'textbox'
    } = config;

    return getInteractiveAria({
      role: type,
      label,
      required,
      invalid,
      describedBy
    });
  }, [getInteractiveAria]);

  // Announce form validation
  const announceFormValidation = useCallback((isValid, errors = []) => {
    if (isValid) {
      announce('Form submitted successfully', 'polite');
    } else {
      const errorCount = errors.length;
      const message = `Form has ${errorCount} error${errorCount !== 1 ? 's' : ''}. ${errors.join('. ')}`;
      announce(message, 'assertive');
    }
  }, [announce]);

  // Announce loading states
  const announceLoading = useCallback((isLoading, content = 'content') => {
    const message = isLoading ? `Loading ${content}` : `${content} loaded`;
    announce(message, 'polite');
  }, [announce]);

  // Create status message for screen readers
  const createStatusMessage = useCallback((status, context = '') => {
    const messages = {
      loading: `Loading${context ? ` ${context}` : ''}`,
      loaded: `${context || 'Content'} loaded`,
      error: `Error${context ? ` loading ${context}` : ''}`,
      success: `${context || 'Action'} completed successfully`,
      warning: `Warning${context ? ` about ${context}` : ''}`,
      info: `Information${context ? ` about ${context}` : ''}`
    };

    return messages[status] || status;
  }, []);

  // Announce status changes
  const announceStatus = useCallback((status, context = '', priority = 'polite') => {
    const message = createStatusMessage(status, context);
    announce(message, priority);
  }, [announce, createStatusMessage]);

  return {
    // Core announcement functions
    announce,
    announceModal,
    announceFormValidation,
    announceLoading,
    announceStatus,

    // ARIA attribute generators
    getNavigationAria,
    getInteractiveAria,
    getButtonAria,
    getLinkAria,
    getFormFieldAria,

    // Utility functions
    createStatusMessage,

    // Current responsive state for conditional announcements
    isMobile,
    isTablet,
    isDesktop,
    breakpoint
  };
};

/**
 * Hook for managing live regions
 * @param {string} id - Live region ID
 * @param {string} priority - 'polite' or 'assertive'
 * @returns {Object} Live region utilities
 */
export const useLiveRegion = (id = 'live-region', priority = 'polite') => {
  const liveRegionRef = useRef(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    let liveRegion = document.getElementById(id);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = id;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    liveRegionRef.current = liveRegion;

    return () => {
      // Clean up live region on unmount
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
      }
    };
  }, [id, priority]);

  const announce = useCallback((message, delay = 1000) => {
    if (liveRegionRef.current) {
      // Clear existing message
      liveRegionRef.current.textContent = '';
      
      // Set new message after brief delay to ensure screen readers pick it up
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
          
          // Clear message after delay
          setTimeout(() => {
            if (liveRegionRef.current) {
              liveRegionRef.current.textContent = '';
            }
          }, delay);
        }
      }, 100);
    }
  }, []);

  return {
    announce,
    liveRegionRef
  };
};

/**
 * Hook for managing focus announcements
 * @returns {Object} Focus announcement utilities
 */
export const useFocusAnnouncements = () => {
  const { announce } = useScreenReader();

  const announceFocus = useCallback((element, customMessage) => {
    if (!element) return;

    let message = customMessage;
    
    if (!message) {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const textContent = element.textContent?.trim();
      
      const elementType = role || tagName;
      const elementLabel = ariaLabel || textContent || 'unlabeled element';
      
      message = `Focused on ${elementType}: ${elementLabel}`;
    }

    announce(message, 'polite', 500);
  }, [announce]);

  const announceSelection = useCallback((selectedItems, totalItems, context = 'items') => {
    const count = Array.isArray(selectedItems) ? selectedItems.length : selectedItems;
    const message = `${count} of ${totalItems} ${context} selected`;
    announce(message, 'polite');
  }, [announce]);

  return {
    announceFocus,
    announceSelection
  };
};