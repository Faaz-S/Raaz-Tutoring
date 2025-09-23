/**
 * Video optimization utilities for responsive video handling
 */

/**
 * Check if device supports video autoplay
 */
export const checkAutoplaySupport = () => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMWF2YzEAAAAIZnJlZQAAABBtZGF0AAAA';
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      resolve(false);
    }
  });
};

/**
 * Get optimal video preload strategy
 */
export const getOptimalPreload = (isMobile = false, connectionType = 'unknown') => {
  if (connectionType === 'slow-2g' || connectionType === '2g') {
    return 'none';
  }
  
  if (isMobile) {
    return connectionType === '4g' ? 'metadata' : 'none';
  }
  
  return 'metadata';
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get responsive aspect ratio based on screen size
 */
export const getResponsiveAspectRatio = (width = window.innerWidth) => {
  if (width < 768) return '16/9';
  if (width < 1024) return '4/3';
  return 'auto';
};/**
 * G
et network connection information
 */
export const getConnectionType = () => {
  if ('connection' in navigator) {
    return navigator.connection.effectiveType || 'unknown';
  }
  return 'unknown';
};

/**
 * Create intersection observer for video lazy loading
 */
export const createVideoObserver = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Optimize video loading based on device capabilities
 */
export const getVideoLoadingStrategy = (isMobile, connectionType) => {
  const strategy = {
    preload: getOptimalPreload(isMobile, connectionType),
    autoplay: !prefersReducedMotion(),
    lazyLoad: isMobile && (connectionType === 'slow-2g' || connectionType === '2g'),
    quality: 'auto'
  };

  if (connectionType === 'slow-2g' || connectionType === '2g') {
    strategy.quality = 'low';
  } else if (connectionType === '3g') {
    strategy.quality = 'medium';
  } else if (connectionType === '4g') {
    strategy.quality = 'high';
  }

  return strategy;
};

/**
 * Monitor video performance metrics
 */
export const monitorVideoPerformance = (videoElement) => {
  if (!videoElement) return;

  const metrics = {
    loadStart: 0,
    canPlay: 0,
    firstFrame: 0,
    bufferHealth: 0
  };

  videoElement.addEventListener('loadstart', () => {
    metrics.loadStart = performance.now();
  });

  videoElement.addEventListener('canplay', () => {
    metrics.canPlay = performance.now();
  });

  videoElement.addEventListener('timeupdate', () => {
    if (metrics.firstFrame === 0 && videoElement.currentTime > 0) {
      metrics.firstFrame = performance.now();
    }
  });

  return metrics;
};