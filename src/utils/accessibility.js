/**
 * Accessibility utilities for zoom and contrast support
 */

/**
 * Check if user prefers high contrast
 * @returns {boolean} Whether high contrast is preferred
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers dark color scheme
 * @returns {boolean} Whether dark mode is preferred
 */
export const prefersDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Get current zoom level (approximation)
 * @returns {number} Zoom level as a percentage
 */
export const getZoomLevel = () => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = screen.width;
  const windowWidth = window.innerWidth;
  
  // This is an approximation - exact zoom detection is not always possible
  return Math.round((screenWidth / windowWidth) * devicePixelRatio * 100);
};

/**
 * Check if zoom level is at or above 200%
 * @returns {boolean} Whether zoom is at high level
 */
export const isHighZoom = () => {
  return getZoomLevel() >= 200;
};

/**
 * Calculate color contrast ratio between two colors
 * @param {string} color1 - First color (hex, rgb, or named)
 * @param {string} color2 - Second color (hex, rgb, or named)
 * @returns {number} Contrast ratio (1-21)
 */
export const calculateContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    // Convert color to RGB values
    const rgb = getRGBValues(color);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Extract RGB values from color string
 * @param {string} color - Color string
 * @returns {Array|null} RGB values [r, g, b] or null if invalid
 */
const getRGBValues = (color) => {
  // Create a temporary element to get computed color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  
  const computedColor = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  // Parse rgb() or rgba() format
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  
  return null;
};

/**
 * Check if color combination meets WCAG contrast requirements
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {Object} Contrast check results
 */
export const checkContrastCompliance = (foreground, background, level = 'AA', size = 'normal') => {
  const ratio = calculateContrastRatio(foreground, background);
  
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  };
  
  const required = requirements[level][size];
  const passes = ratio >= required;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    required,
    passes,
    level,
    size
  };
};

/**
 * Generate high contrast color variants
 * @param {Object} colors - Original color palette
 * @returns {Object} High contrast color variants
 */
export const generateHighContrastColors = (colors) => {
  return {
    ...colors,
    // Ensure maximum contrast for text
    text: '#000000',
    textInverse: '#ffffff',
    background: '#ffffff',
    backgroundInverse: '#000000',
    
    // High contrast borders
    border: '#000000',
    borderLight: '#666666',
    
    // High contrast interactive elements
    primary: '#0000ff',
    primaryHover: '#000080',
    secondary: '#800080',
    secondaryHover: '#400040',
    
    // High contrast status colors
    success: '#008000',
    warning: '#ff8c00',
    error: '#ff0000',
    info: '#0000ff'
  };
};

/**
 * Apply high contrast styles to document
 */
export const applyHighContrastMode = () => {
  const highContrastStyles = `
    /* High contrast mode overrides */
    .high-contrast {
      --text-color: #000000 !important;
      --bg-color: #ffffff !important;
      --border-color: #000000 !important;
      --link-color: #0000ff !important;
      --button-bg: #ffffff !important;
      --button-text: #000000 !important;
      --button-border: #000000 !important;
    }
    
    .high-contrast * {
      background-color: var(--bg-color) !important;
      color: var(--text-color) !important;
      border-color: var(--border-color) !important;
    }
    
    .high-contrast a {
      color: var(--link-color) !important;
      text-decoration: underline !important;
    }
    
    .high-contrast button,
    .high-contrast input,
    .high-contrast select,
    .high-contrast textarea {
      background-color: var(--button-bg) !important;
      color: var(--button-text) !important;
      border: 2px solid var(--button-border) !important;
    }
    
    .high-contrast img {
      filter: contrast(150%) !important;
    }
  `;
  
  let styleSheet = document.getElementById('high-contrast-styles');
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'high-contrast-styles';
    document.head.appendChild(styleSheet);
  }
  
  styleSheet.textContent = highContrastStyles;
  document.documentElement.classList.add('high-contrast');
};

/**
 * Remove high contrast styles from document
 */
export const removeHighContrastMode = () => {
  document.documentElement.classList.remove('high-contrast');
  const styleSheet = document.getElementById('high-contrast-styles');
  if (styleSheet) {
    styleSheet.remove();
  }
};

/**
 * Check if element remains usable at high zoom levels
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Zoom usability results
 */
export const checkZoomUsability = (element) => {
  if (!element) return { usable: false, issues: ['Element not found'] };
  
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const issues = [];
  
  // Check if element is too small
  if (rect.width < 44 || rect.height < 44) {
    issues.push('Element smaller than minimum touch target (44px)');
  }
  
  // Check if text is readable
  const fontSize = parseFloat(style.fontSize);
  if (fontSize < 16) {
    issues.push('Font size may be too small for high zoom');
  }
  
  // Check if element is cut off
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  if (rect.right > viewport.width || rect.bottom > viewport.height) {
    issues.push('Element may be cut off at high zoom levels');
  }
  
  // Check for horizontal scrolling
  if (document.documentElement.scrollWidth > viewport.width) {
    issues.push('Page requires horizontal scrolling');
  }
  
  return {
    usable: issues.length === 0,
    issues,
    elementSize: { width: rect.width, height: rect.height },
    fontSize,
    viewport
  };
};

/**
 * Optimize layout for zoom levels
 * @param {number} zoomLevel - Current zoom level percentage
 */
export const optimizeForZoom = (zoomLevel) => {
  const body = document.body;
  
  if (zoomLevel >= 200) {
    body.classList.add('high-zoom');
    
    // Apply zoom-specific styles
    const zoomStyles = `
      .high-zoom {
        /* Ensure no horizontal scrolling */
        overflow-x: hidden !important;
      }
      
      .high-zoom * {
        /* Prevent text from being too small */
        min-font-size: 16px !important;
      }
      
      .high-zoom .container {
        /* Reduce padding to maximize content space */
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      
      .high-zoom .grid {
        /* Stack grid items vertically */
        grid-template-columns: 1fr !important;
      }
      
      .high-zoom .flex {
        /* Stack flex items vertically */
        flex-direction: column !important;
      }
    `;
    
    let styleSheet = document.getElementById('zoom-styles');
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'zoom-styles';
      document.head.appendChild(styleSheet);
    }
    
    styleSheet.textContent = zoomStyles;
  } else {
    body.classList.remove('high-zoom');
    const styleSheet = document.getElementById('zoom-styles');
    if (styleSheet) {
      styleSheet.remove();
    }
  }
};

/**
 * Monitor and respond to accessibility preference changes
 * @param {Function} callback - Callback function for preference changes
 * @returns {Function} Cleanup function
 */
export const monitorAccessibilityPreferences = (callback) => {
  const mediaQueries = [
    { query: '(prefers-contrast: high)', type: 'contrast' },
    { query: '(prefers-reduced-motion: reduce)', type: 'motion' },
    { query: '(prefers-color-scheme: dark)', type: 'colorScheme' }
  ];
  
  const listeners = mediaQueries.map(({ query, type }) => {
    const mq = window.matchMedia(query);
    const handler = (e) => callback({ type, matches: e.matches });
    
    mq.addListener(handler);
    
    // Call immediately with current state
    callback({ type, matches: mq.matches });
    
    return { mq, handler };
  });
  
  // Return cleanup function
  return () => {
    listeners.forEach(({ mq, handler }) => {
      mq.removeListener(handler);
    });
  };
};

/**
 * Validate accessibility compliance for an element
 * @param {HTMLElement} element - Element to validate
 * @returns {Object} Validation results
 */
export const validateAccessibility = (element) => {
  const results = {
    passed: true,
    issues: [],
    warnings: []
  };
  
  if (!element) {
    results.passed = false;
    results.issues.push('Element not found');
    return results;
  }
  
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // Check color contrast
  const color = style.color;
  const backgroundColor = style.backgroundColor;
  
  if (color && backgroundColor && color !== backgroundColor) {
    const contrast = checkContrastCompliance(color, backgroundColor);
    if (!contrast.passes) {
      results.issues.push(`Insufficient color contrast: ${contrast.ratio}:1 (required: ${contrast.required}:1)`);
      results.passed = false;
    }
  }
  
  // Check touch target size
  if (rect.width < 44 || rect.height < 44) {
    const isInteractive = element.matches('button, a, input, select, textarea, [role="button"], [role="link"]');
    if (isInteractive) {
      results.issues.push(`Touch target too small: ${rect.width}x${rect.height}px (minimum: 44x44px)`);
      results.passed = false;
    }
  }
  
  // Check zoom usability
  const zoomCheck = checkZoomUsability(element);
  if (!zoomCheck.usable) {
    results.warnings.push(...zoomCheck.issues);
  }
  
  return results;
};