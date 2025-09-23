/**
 * Animation optimization utilities for responsive design
 * Handles reduced motion preferences and performance monitoring
 */

/**
 * Checks if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Creates a media query listener for reduced motion preference changes
 * @param {Function} callback - Function to call when preference changes
 * @returns {Function} Cleanup function to remove the listener
 */
export const onReducedMotionChange = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const handleChange = (e) => {
    callback(e.matches);
  };
  
  // Use addEventListener if available, fallback to addListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  } else {
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
};

/**
 * Animation performance monitor
 */
export class AnimationPerformanceMonitor {
  constructor() {
    this.animations = new Map();
    this.performanceThreshold = 16.67; // 60fps = 16.67ms per frame
    this.isMonitoring = false;
  }

  /**
   * Starts monitoring an animation
   * @param {string} animationId - Unique identifier for the animation
   * @param {HTMLElement} element - Element being animated
   */
  startMonitoring(animationId, element) {
    if (typeof window === 'undefined' || !window.performance) return;

    this.animations.set(animationId, {
      element,
      startTime: performance.now(),
      frameCount: 0,
      droppedFrames: 0,
      lastFrameTime: performance.now()
    });

    if (!this.isMonitoring) {
      this.startFrameMonitoring();
    }
  }

  /**
   * Stops monitoring an animation
   * @param {string} animationId - Animation identifier
   * @returns {Object} Performance metrics
   */
  stopMonitoring(animationId) {
    const animation = this.animations.get(animationId);
    if (!animation) return null;

    const endTime = performance.now();
    const duration = endTime - animation.startTime;
    const averageFPS = animation.frameCount / (duration / 1000);
    const droppedFramePercentage = (animation.droppedFrames / animation.frameCount) * 100;

    const metrics = {
      duration,
      frameCount: animation.frameCount,
      droppedFrames: animation.droppedFrames,
      averageFPS,
      droppedFramePercentage,
      isPerformant: droppedFramePercentage < 10 // Less than 10% dropped frames
    };

    this.animations.delete(animationId);

    if (this.animations.size === 0) {
      this.stopFrameMonitoring();
    }

    return metrics;
  }

  /**
   * Starts frame monitoring
   */
  startFrameMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFrame();
  }

  /**
   * Stops frame monitoring
   */
  stopFrameMonitoring() {
    this.isMonitoring = false;
  }

  /**
   * Monitors individual frames
   */
  monitorFrame() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();

    this.animations.forEach((animation, animationId) => {
      const timeSinceLastFrame = currentTime - animation.lastFrameTime;
      
      animation.frameCount++;
      
      // Check if frame was dropped (took longer than threshold)
      if (timeSinceLastFrame > this.performanceThreshold * 1.5) {
        animation.droppedFrames++;
      }
      
      animation.lastFrameTime = currentTime;
    });

    requestAnimationFrame(() => this.monitorFrame());
  }

  /**
   * Gets current performance metrics for all active animations
   * @returns {Object} Current metrics
   */
  getCurrentMetrics() {
    const metrics = {};
    
    this.animations.forEach((animation, animationId) => {
      const currentTime = performance.now();
      const duration = currentTime - animation.startTime;
      const averageFPS = animation.frameCount / (duration / 1000);
      
      metrics[animationId] = {
        duration,
        frameCount: animation.frameCount,
        droppedFrames: animation.droppedFrames,
        averageFPS,
        isActive: true
      };
    });

    return metrics;
  }
}

// Global instance
export const animationMonitor = new AnimationPerformanceMonitor();

/**
 * Optimized animation configuration based on device capabilities
 */
export const getOptimizedAnimationConfig = () => {
  if (typeof window === 'undefined') {
    return {
      duration: 300,
      easing: 'ease-out',
      reducedMotion: false
    };
  }

  const reducedMotion = prefersReducedMotion();
  const isLowEndDevice = detectLowEndDevice();
  
  return {
    duration: reducedMotion ? 0 : isLowEndDevice ? 150 : 300,
    easing: reducedMotion ? 'linear' : 'ease-out',
    reducedMotion,
    isLowEndDevice,
    // Disable complex animations on low-end devices
    enableComplexAnimations: !isLowEndDevice && !reducedMotion,
    // Reduce animation intensity
    intensity: reducedMotion ? 0 : isLowEndDevice ? 0.5 : 1
  };
};

/**
 * Detects if the device is low-end based on various factors
 * @returns {boolean} True if device appears to be low-end
 */
export const detectLowEndDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1;
  if (cores <= 2) return true;

  // Check for device memory (if available)
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;

  // Check for connection speed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    const slowConnections = ['slow-2g', '2g'];
    if (slowConnections.includes(connection.effectiveType)) return true;
  }

  // Check user agent for known low-end devices
  const userAgent = navigator.userAgent.toLowerCase();
  const lowEndPatterns = [
    'android 4',
    'android 5',
    'android 6',
    'iphone os 9',
    'iphone os 10'
  ];

  return lowEndPatterns.some(pattern => userAgent.includes(pattern));
};

/**
 * Creates fallback animations for low-end devices
 * @param {Object} originalConfig - Original animation configuration
 * @returns {Object} Fallback animation configuration
 */
export const createFallbackAnimation = (originalConfig) => {
  const optimizedConfig = getOptimizedAnimationConfig();
  
  if (optimizedConfig.reducedMotion) {
    return {
      ...originalConfig,
      duration: 0,
      transition: 'none'
    };
  }

  if (optimizedConfig.isLowEndDevice) {
    return {
      ...originalConfig,
      duration: Math.min(originalConfig.duration || 300, 150),
      easing: 'ease-out',
      // Remove complex properties that are expensive to animate
      transform: originalConfig.transform ? 'translateX(0)' : undefined,
      opacity: originalConfig.opacity !== undefined ? originalConfig.opacity : undefined,
      // Remove expensive properties
      filter: undefined,
      backdropFilter: undefined,
      boxShadow: undefined
    };
  }

  return originalConfig;
};

/**
 * Wraps Framer Motion animations with performance optimizations
 * @param {Object} motionProps - Original Framer Motion props
 * @returns {Object} Optimized motion props
 */
export const optimizeFramerMotionProps = (motionProps) => {
  const config = getOptimizedAnimationConfig();
  
  if (config.reducedMotion) {
    return {
      ...motionProps,
      initial: false,
      animate: motionProps.animate,
      transition: { duration: 0 }
    };
  }

  if (config.isLowEndDevice) {
    return {
      ...motionProps,
      transition: {
        ...motionProps.transition,
        duration: (motionProps.transition?.duration || 0.3) * 0.5,
        ease: 'easeOut'
      }
    };
  }

  return motionProps;
};

/**
 * CSS-in-JS animation optimization
 * @param {Object} styles - CSS styles object
 * @returns {Object} Optimized styles
 */
export const optimizeAnimationStyles = (styles) => {
  const config = getOptimizedAnimationConfig();
  
  if (config.reducedMotion) {
    return {
      ...styles,
      transition: 'none',
      animation: 'none'
    };
  }

  if (config.isLowEndDevice) {
    const optimizedStyles = { ...styles };
    
    // Reduce transition durations
    if (optimizedStyles.transition) {
      optimizedStyles.transition = optimizedStyles.transition.replace(
        /(\d+\.?\d*)s/g,
        (match, duration) => `${Math.min(parseFloat(duration), 0.15)}s`
      );
    }

    // Remove expensive properties
    delete optimizedStyles.filter;
    delete optimizedStyles.backdropFilter;
    delete optimizedStyles.boxShadow;

    return optimizedStyles;
  }

  return styles;
};

/**
 * Performance-aware requestAnimationFrame wrapper
 * @param {Function} callback - Animation callback
 * @returns {number} Animation frame ID
 */
export const performantRAF = (callback) => {
  if (typeof window === 'undefined') return 0;

  const config = getOptimizedAnimationConfig();
  
  if (config.reducedMotion) {
    // Execute immediately for reduced motion
    setTimeout(callback, 0);
    return 0;
  }

  if (config.isLowEndDevice) {
    // Throttle animations on low-end devices
    return requestAnimationFrame(() => {
      setTimeout(callback, 8); // ~120fps instead of 60fps
    });
  }

  return requestAnimationFrame(callback);
};