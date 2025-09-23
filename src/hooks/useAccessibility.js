import { useState, useEffect, useCallback } from 'react';
import {
  prefersHighContrast,
  prefersReducedMotion,
  prefersDarkMode,
  getZoomLevel,
  isHighZoom,
  applyHighContrastMode,
  removeHighContrastMode,
  optimizeForZoom,
  monitorAccessibilityPreferences,
  validateAccessibility
} from '../utils/accessibility';

/**
 * Hook for managing accessibility preferences and features
 * @param {Object} options - Configuration options
 * @returns {Object} Accessibility state and utilities
 */
export const useAccessibility = (options = {}) => {
  const {
    enableHighContrastMode = true,
    enableZoomOptimization = true,
    enableMotionReduction = true,
    monitorPreferences = true
  } = options;

  const [preferences, setPreferences] = useState({
    highContrast: prefersHighContrast(),
    reducedMotion: prefersReducedMotion(),
    darkMode: prefersDarkMode(),
    zoomLevel: getZoomLevel(),
    highZoom: isHighZoom()
  });

  const [accessibilityMode, setAccessibilityMode] = useState({
    highContrast: false,
    zoomOptimized: false,
    motionReduced: false
  });

  // Monitor accessibility preferences
  useEffect(() => {
    if (!monitorPreferences) return;

    const cleanup = monitorAccessibilityPreferences((change) => {
      setPreferences(prev => ({
        ...prev,
        highContrast: change.type === 'contrast' ? change.matches : prev.highContrast,
        reducedMotion: change.type === 'motion' ? change.matches : prev.reducedMotion,
        darkMode: change.type === 'colorScheme' ? change.matches : prev.darkMode
      }));
    });

    return cleanup;
  }, [monitorPreferences]);

  // Monitor zoom level changes
  useEffect(() => {
    if (!enableZoomOptimization) return;

    const handleResize = () => {
      const newZoomLevel = getZoomLevel();
      const newHighZoom = isHighZoom();
      
      setPreferences(prev => ({
        ...prev,
        zoomLevel: newZoomLevel,
        highZoom: newHighZoom
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableZoomOptimization]);

  // Apply high contrast mode
  useEffect(() => {
    if (enableHighContrastMode && preferences.highContrast && !accessibilityMode.highContrast) {
      applyHighContrastMode();
      setAccessibilityMode(prev => ({ ...prev, highContrast: true }));
    } else if ((!preferences.highContrast || !enableHighContrastMode) && accessibilityMode.highContrast) {
      removeHighContrastMode();
      setAccessibilityMode(prev => ({ ...prev, highContrast: false }));
    }
  }, [preferences.highContrast, enableHighContrastMode, accessibilityMode.highContrast]);

  // Apply zoom optimization
  useEffect(() => {
    if (enableZoomOptimization && preferences.highZoom && !accessibilityMode.zoomOptimized) {
      optimizeForZoom(preferences.zoomLevel);
      setAccessibilityMode(prev => ({ ...prev, zoomOptimized: true }));
    } else if ((!preferences.highZoom || !enableZoomOptimization) && accessibilityMode.zoomOptimized) {
      optimizeForZoom(100); // Reset to normal zoom
      setAccessibilityMode(prev => ({ ...prev, zoomOptimized: false }));
    }
  }, [preferences.highZoom, preferences.zoomLevel, enableZoomOptimization, accessibilityMode.zoomOptimized]);

  // Toggle high contrast mode manually
  const toggleHighContrast = useCallback(() => {
    if (accessibilityMode.highContrast) {
      removeHighContrastMode();
      setAccessibilityMode(prev => ({ ...prev, highContrast: false }));
    } else {
      applyHighContrastMode();
      setAccessibilityMode(prev => ({ ...prev, highContrast: true }));
    }
  }, [accessibilityMode.highContrast]);

  // Validate element accessibility
  const validateElement = useCallback((element) => {
    return validateAccessibility(element);
  }, []);

  // Get accessibility-aware styles
  const getAccessibleStyles = useCallback((baseStyles = {}) => {
    let styles = { ...baseStyles };

    if (preferences.highContrast || accessibilityMode.highContrast) {
      styles = {
        ...styles,
        // High contrast overrides
        color: '#000000',
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: '2px',
        borderStyle: 'solid'
      };
    }

    if (preferences.highZoom || accessibilityMode.zoomOptimized) {
      styles = {
        ...styles,
        // Zoom-friendly styles
        minHeight: '44px',
        minWidth: '44px',
        fontSize: Math.max(16, parseFloat(styles.fontSize) || 16) + 'px',
        padding: '12px 16px'
      };
    }

    if (preferences.reducedMotion) {
      styles = {
        ...styles,
        // Reduced motion styles
        transition: 'none',
        animation: 'none',
        transform: 'none'
      };
    }

    return styles;
  }, [preferences, accessibilityMode]);

  // Get accessibility-aware class names
  const getAccessibleClasses = useCallback((baseClasses = '') => {
    let classes = baseClasses;

    if (preferences.highContrast || accessibilityMode.highContrast) {
      classes += ' high-contrast';
    }

    if (preferences.highZoom || accessibilityMode.zoomOptimized) {
      classes += ' high-zoom';
    }

    if (preferences.reducedMotion) {
      classes += ' reduced-motion';
    }

    return classes.trim();
  }, [preferences, accessibilityMode]);

  // Check if animations should be disabled
  const shouldReduceMotion = useCallback(() => {
    return preferences.reducedMotion || !enableMotionReduction;
  }, [preferences.reducedMotion, enableMotionReduction]);

  // Get motion-safe animation props
  const getMotionSafeProps = useCallback((animationProps = {}) => {
    if (shouldReduceMotion()) {
      return {
        ...animationProps,
        initial: false,
        animate: false,
        exit: false,
        transition: { duration: 0 }
      };
    }
    return animationProps;
  }, [shouldReduceMotion]);

  // Announce accessibility mode changes
  const announceAccessibilityChange = useCallback((mode, enabled) => {
    const message = `${mode} mode ${enabled ? 'enabled' : 'disabled'}`;
    
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Effect to announce mode changes
  useEffect(() => {
    if (accessibilityMode.highContrast !== preferences.highContrast) {
      announceAccessibilityChange('High contrast', accessibilityMode.highContrast);
    }
  }, [accessibilityMode.highContrast, preferences.highContrast, announceAccessibilityChange]);

  useEffect(() => {
    if (accessibilityMode.zoomOptimized !== preferences.highZoom) {
      announceAccessibilityChange('Zoom optimization', accessibilityMode.zoomOptimized);
    }
  }, [accessibilityMode.zoomOptimized, preferences.highZoom, announceAccessibilityChange]);

  return {
    // Current preferences
    preferences,
    
    // Active accessibility modes
    accessibilityMode,
    
    // Utility functions
    toggleHighContrast,
    validateElement,
    getAccessibleStyles,
    getAccessibleClasses,
    shouldReduceMotion,
    getMotionSafeProps,
    
    // Convenience flags
    isHighContrast: preferences.highContrast || accessibilityMode.highContrast,
    isHighZoom: preferences.highZoom || accessibilityMode.zoomOptimized,
    isReducedMotion: preferences.reducedMotion,
    isDarkMode: preferences.darkMode
  };
};

/**
 * Hook for zoom-aware responsive design
 * @returns {Object} Zoom-aware responsive utilities
 */
export const useZoomAwareResponsive = () => {
  const { preferences, isHighZoom } = useAccessibility();
  
  const [effectiveBreakpoint, setEffectiveBreakpoint] = useState('mobile');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const zoomLevel = preferences.zoomLevel;
      
      // Adjust breakpoints based on zoom level
      const adjustedWidth = width * (100 / zoomLevel);
      
      if (adjustedWidth >= 1024) {
        setEffectiveBreakpoint('desktop');
      } else if (adjustedWidth >= 768) {
        setEffectiveBreakpoint('tablet');
      } else {
        setEffectiveBreakpoint('mobile');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [preferences.zoomLevel]);
  
  return {
    effectiveBreakpoint,
    isHighZoom,
    zoomLevel: preferences.zoomLevel,
    
    // Zoom-aware responsive checks
    isMobile: effectiveBreakpoint === 'mobile' || isHighZoom,
    isTablet: effectiveBreakpoint === 'tablet' && !isHighZoom,
    isDesktop: effectiveBreakpoint === 'desktop' && !isHighZoom
  };
};

/**
 * Hook for contrast-aware theming
 * @param {Object} theme - Base theme object
 * @returns {Object} Contrast-aware theme
 */
export const useContrastAwareTheme = (theme = {}) => {
  const { isHighContrast, isDarkMode } = useAccessibility();
  
  const contrastTheme = {
    ...theme,
    
    // Text colors
    text: {
      primary: isHighContrast ? '#000000' : (isDarkMode ? '#ffffff' : '#000000'),
      secondary: isHighContrast ? '#000000' : (isDarkMode ? '#cccccc' : '#666666'),
      inverse: isHighContrast ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff')
    },
    
    // Background colors
    background: {
      primary: isHighContrast ? '#ffffff' : (isDarkMode ? '#000000' : '#ffffff'),
      secondary: isHighContrast ? '#ffffff' : (isDarkMode ? '#1a1a1a' : '#f5f5f5'),
      inverse: isHighContrast ? '#000000' : (isDarkMode ? '#ffffff' : '#000000')
    },
    
    // Border colors
    border: {
      primary: isHighContrast ? '#000000' : (isDarkMode ? '#333333' : '#cccccc'),
      secondary: isHighContrast ? '#000000' : (isDarkMode ? '#666666' : '#e0e0e0'),
      focus: isHighContrast ? '#000000' : '#0066cc'
    },
    
    // Interactive colors
    interactive: {
      primary: isHighContrast ? '#0000ff' : '#0066cc',
      primaryHover: isHighContrast ? '#000080' : '#0052a3',
      secondary: isHighContrast ? '#800080' : '#6c757d',
      secondaryHover: isHighContrast ? '#400040' : '#545b62'
    },
    
    // Status colors
    status: {
      success: isHighContrast ? '#008000' : '#28a745',
      warning: isHighContrast ? '#ff8c00' : '#ffc107',
      error: isHighContrast ? '#ff0000' : '#dc3545',
      info: isHighContrast ? '#0000ff' : '#17a2b8'
    }
  };
  
  return contrastTheme;
};