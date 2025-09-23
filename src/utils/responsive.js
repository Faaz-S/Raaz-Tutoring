/**
 * Responsive utility functions and constants
 * Provides breakpoint definitions and utility functions for responsive calculations
 */

// Breakpoint definitions matching Tailwind CSS defaults
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
};

// Breakpoint names for easier reference
export const BREAKPOINT_NAMES = {
  MOBILE: 'mobile',
  TABLET: 'tablet', 
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'largeDesktop',
};

/**
 * Get the current breakpoint name based on window width
 * @param {number} width - Current window width
 * @returns {string} Current breakpoint name
 */
export const getCurrentBreakpoint = (width) => {
  if (width >= BREAKPOINTS.largeDesktop) return BREAKPOINT_NAMES.LARGE_DESKTOP;
  if (width >= BREAKPOINTS.desktop) return BREAKPOINT_NAMES.DESKTOP;
  if (width >= BREAKPOINTS.tablet) return BREAKPOINT_NAMES.TABLET;
  return BREAKPOINT_NAMES.MOBILE;
};

/**
 * Check if current width matches a specific breakpoint
 * @param {number} width - Current window width
 * @param {string} breakpoint - Breakpoint name to check
 * @returns {boolean} Whether width matches the breakpoint
 */
export const isBreakpoint = (width, breakpoint) => {
  return getCurrentBreakpoint(width) === breakpoint;
};

/**
 * Check if current width is mobile
 * @param {number} width - Current window width
 * @returns {boolean} Whether width is mobile
 */
export const isMobile = (width) => {
  return width < BREAKPOINTS.tablet;
};

/**
 * Check if current width is tablet
 * @param {number} width - Current window width
 * @returns {boolean} Whether width is tablet
 */
export const isTablet = (width) => {
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
};

/**
 * Check if current width is desktop or larger
 * @param {number} width - Current window width
 * @returns {boolean} Whether width is desktop or larger
 */
export const isDesktop = (width) => {
  return width >= BREAKPOINTS.desktop;
};

/**
 * Get device type based on width
 * @param {number} width - Current window width
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = (width) => {
  if (isMobile(width)) return 'mobile';
  if (isTablet(width)) return 'tablet';
  return 'desktop';
};

/**
 * Calculate responsive value based on breakpoint
 * @param {number} width - Current window width
 * @param {Object} values - Object with breakpoint keys and values
 * @returns {*} Value for current breakpoint
 */
export const getResponsiveValue = (width, values) => {
  const breakpoint = getCurrentBreakpoint(width);
  
  // Return exact match if available
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }
  
  // Fallback logic: find the closest smaller breakpoint
  const breakpointOrder = [
    BREAKPOINT_NAMES.LARGE_DESKTOP,
    BREAKPOINT_NAMES.DESKTOP,
    BREAKPOINT_NAMES.TABLET,
    BREAKPOINT_NAMES.MOBILE,
  ];
  
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const fallbackBreakpoint = breakpointOrder[i];
    if (values[fallbackBreakpoint] !== undefined) {
      return values[fallbackBreakpoint];
    }
  }
  
  // Return first available value as last resort
  return Object.values(values)[0];
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};