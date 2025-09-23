/**
 * React hook for animation optimization and reduced motion support
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  prefersReducedMotion,
  onReducedMotionChange,
  getOptimizedAnimationConfig,
  animationMonitor,
  optimizeFramerMotionProps,
  optimizeAnimationStyles
} from '../utils/animationOptimization';

/**
 * Hook for managing reduced motion preferences and animation optimization
 * @param {Object} options - Configuration options
 * @returns {Object} Animation optimization utilities
 */
export const useAnimationOptimization = (options = {}) => {
  const {
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    fallbackOnPoorPerformance = true
  } = options;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [animationConfig, setAnimationConfig] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const cleanupRef = useRef(null);

  // Initialize reduced motion state
  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    setAnimationConfig(getOptimizedAnimationConfig());

    // Listen for changes in reduced motion preference
    const cleanup = onReducedMotionChange((isReduced) => {
      setReducedMotion(isReduced);
      setAnimationConfig(getOptimizedAnimationConfig());
    });

    cleanupRef.current = cleanup;

    return cleanup;
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const updateMetrics = () => {
      const currentMetrics = animationMonitor.getCurrentMetrics();
      setPerformanceMetrics(currentMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [enablePerformanceMonitoring]);

  /**
   * Optimizes Framer Motion props based on current settings
   */
  const optimizeMotionProps = useCallback((motionProps) => {
    return optimizeFramerMotionProps(motionProps);
  }, [reducedMotion, animationConfig]);

  /**
   * Optimizes CSS animation styles
   */
  const optimizeStyles = useCallback((styles) => {
    return optimizeAnimationStyles(styles);
  }, [reducedMotion, animationConfig]);

  /**
   * Starts monitoring an animation's performance
   */
  const startAnimationMonitoring = useCallback((animationId, element) => {
    if (enablePerformanceMonitoring) {
      animationMonitor.startMonitoring(animationId, element);
    }
  }, [enablePerformanceMonitoring]);

  /**
   * Stops monitoring an animation and returns metrics
   */
  const stopAnimationMonitoring = useCallback((animationId) => {
    if (enablePerformanceMonitoring) {
      const metrics = animationMonitor.stopMonitoring(animationId);
      
      if (metrics && fallbackOnPoorPerformance && !metrics.isPerformant) {
        console.warn(`Animation ${animationId} performed poorly:`, metrics);
        // Could trigger fallback behavior here
      }
      
      return metrics;
    }
    return null;
  }, [enablePerformanceMonitoring, fallbackOnPoorPerformance]);

  /**
   * Creates an optimized animation configuration
   */
  const createAnimationConfig = useCallback((baseConfig) => {
    if (reducedMotion) {
      return {
        ...baseConfig,
        duration: 0,
        transition: 'none'
      };
    }

    if (animationConfig.isLowEndDevice) {
      return {
        ...baseConfig,
        duration: Math.min(baseConfig.duration || 300, 150),
        easing: 'ease-out'
      };
    }

    return baseConfig;
  }, [reducedMotion, animationConfig]);

  return {
    // State
    reducedMotion,
    animationConfig,
    performanceMetrics,
    
    // Utilities
    optimizeMotionProps,
    optimizeStyles,
    createAnimationConfig,
    
    // Performance monitoring
    startAnimationMonitoring,
    stopAnimationMonitoring,
    
    // Computed values
    shouldAnimate: !reducedMotion,
    isLowEndDevice: animationConfig.isLowEndDevice,
    animationIntensity: animationConfig.intensity || 1
  };
};

/**
 * Hook for monitoring a specific animation's performance
 * @param {string} animationId - Unique identifier for the animation
 * @param {Object} options - Configuration options
 */
export const useAnimationPerformance = (animationId, options = {}) => {
  const { autoStart = false, element = null } = options;
  const [metrics, setMetrics] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    if (element && !isMonitoring) {
      animationMonitor.startMonitoring(animationId, element);
      setIsMonitoring(true);
    }
  }, [animationId, element, isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      const result = animationMonitor.stopMonitoring(animationId);
      setMetrics(result);
      setIsMonitoring(false);
      return result;
    }
    return null;
  }, [animationId, isMonitoring]);

  useEffect(() => {
    if (autoStart && element) {
      startMonitoring();
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [autoStart, element, startMonitoring, stopMonitoring, isMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};

/**
 * Hook for creating responsive animations that adapt to device capabilities
 * @param {Object} animationConfig - Base animation configuration
 */
export const useResponsiveAnimation = (animationConfig) => {
  const { optimizeMotionProps, createAnimationConfig, shouldAnimate } = useAnimationOptimization();

  const responsiveConfig = createAnimationConfig(animationConfig);
  const motionProps = optimizeMotionProps(responsiveConfig);

  return {
    ...motionProps,
    shouldAnimate,
    config: responsiveConfig
  };
};