import { useState, useEffect, useMemo } from 'react';
import {
  getCurrentBreakpoint,
  getDeviceType,
  isMobile,
  isTablet,
  isDesktop,
  debounce,
  getResponsiveValue,
} from '../utils/responsive';

/**
 * Custom hook for responsive breakpoint detection and screen size tracking
 * @param {number} debounceMs - Debounce delay for resize events (default: 150ms)
 * @returns {Object} Responsive state and utilities
 */
export const useResponsive = (debounceMs = 150) => {
  // Initialize state with current window dimensions
  const [state, setState] = useState(() => {
    // Handle SSR by providing default values
    if (typeof window === 'undefined') {
      return {
        width: 1024, // Default to desktop width for SSR
        height: 768,
        breakpoint: 'desktop',
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      breakpoint: getCurrentBreakpoint(width),
      deviceType: getDeviceType(width),
      isMobile: isMobile(width),
      isTablet: isTablet(width),
      isDesktop: isDesktop(width),
      orientation: width > height ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') return;

    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        width,
        height,
        breakpoint: getCurrentBreakpoint(width),
        deviceType: getDeviceType(width),
        isMobile: isMobile(width),
        isTablet: isTablet(width),
        isDesktop: isDesktop(width),
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    // Create debounced resize handler
    const debouncedUpdate = debounce(updateState, debounceMs);

    // Add event listener
    window.addEventListener('resize', debouncedUpdate);

    // Update state immediately in case of hydration mismatch
    updateState();

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [debounceMs]);

  return state;
};

/**
 * Hook for tracking specific breakpoint matches
 * @param {string} targetBreakpoint - Breakpoint to track
 * @returns {boolean} Whether current breakpoint matches target
 */
export const useBreakpoint = (targetBreakpoint) => {
  const { breakpoint } = useResponsive();
  return breakpoint === targetBreakpoint;
};

/**
 * Hook for tracking mobile state specifically
 * @returns {boolean} Whether current screen is mobile
 */
export const useMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * Hook for tracking tablet state specifically
 * @returns {boolean} Whether current screen is tablet
 */
export const useTablet = () => {
  const { isTablet } = useResponsive();
  return isTablet;
};

/**
 * Hook for tracking desktop state specifically
 * @returns {boolean} Whether current screen is desktop
 */
export const useDesktop = () => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

/**
 * Hook for getting responsive values based on current breakpoint
 * @param {Object} values - Object with breakpoint keys and values
 * @returns {*} Value for current breakpoint
 */
export const useResponsiveValue = (values) => {
  const { width } = useResponsive();
  
  return useMemo(() => {
    return getResponsiveValue(width, values);
  }, [width, values]);
};