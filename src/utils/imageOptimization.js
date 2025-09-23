/**
 * Image optimization utilities for responsive images
 * Handles different screen densities, formats, and loading strategies
 */

/**
 * Generate responsive image sources for different screen densities
 * @param {string} baseSrc - Base image source path
 * @param {Array} densities - Array of pixel densities (e.g., [1, 2, 3])
 * @returns {Object} Object containing WebP and fallback sources
 */
export const generateResponsiveSources = (baseSrc, densities = [1, 2, 3]) => {
  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');
  
  const sources = {
    webp: {},
    fallback: {}
  };
  
  densities.forEach(density => {
    const suffix = density === 1 ? '' : `@${density}x`;
    sources.webp[`${density}x`] = `${baseName}${suffix}.webp`;
    sources.fallback[`${density}x`] = `${baseName}${suffix}.${extension}`;
  });
  
  return sources;
};

/**
 * Generate srcset string from image sources
 * @param {Object} sources - Object with density keys and image paths
 * @returns {string} Formatted srcset string
 */
export const generateSrcSet = (sources) => {
  return Object.entries(sources)
    .map(([density, src]) => `${src} ${density}`)
    .join(', ');
};

/**
 * Get optimal image sizes based on breakpoints
 * @param {Object} breakpoints - Object with breakpoint definitions
 * @returns {string} Sizes attribute string
 */
export const generateSizes = (breakpoints = {}) => {
  const defaultBreakpoints = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    ...breakpoints
  };
  
  return [
    `(max-width: 767px) ${defaultBreakpoints.mobile}`,
    `(max-width: 1023px) ${defaultBreakpoints.tablet}`,
    defaultBreakpoints.desktop
  ].join(', ');
};

/**
 * Check if WebP format is supported by the browser
 * @returns {Promise<boolean>} Promise that resolves to WebP support status
 */
export const checkWebPSupport = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Preload critical images for better performance
 * @param {Array} imageSources - Array of image source objects
 * @param {boolean} useWebP - Whether to preload WebP versions
 */
export const preloadImages = (imageSources, useWebP = true) => {
  imageSources.forEach(({ src, srcSet, sizes }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    
    if (srcSet) {
      link.imageSrcset = srcSet;
      if (sizes) {
        link.imageSizes = sizes;
      }
    } else {
      link.href = src;
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Calculate optimal image dimensions based on container and device pixel ratio
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {number} devicePixelRatio - Device pixel ratio
 * @returns {Object} Optimal width and height
 */
export const calculateOptimalDimensions = (
  containerWidth, 
  containerHeight, 
  devicePixelRatio = window.devicePixelRatio || 1
) => {
  return {
    width: Math.ceil(containerWidth * devicePixelRatio),
    height: Math.ceil(containerHeight * devicePixelRatio)
  };
};

/**
 * Create intersection observer for lazy loading images
 * @param {Function} callback - Callback function when image enters viewport
 * @param {Object} options - Intersection observer options
 * @returns {IntersectionObserver} Configured intersection observer
 */
export const createImageObserver = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Get responsive breakpoint for current screen size
 * @param {number} width - Screen width
 * @returns {string} Breakpoint name
 */
export const getCurrentBreakpoint = (width = window.innerWidth) => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'desktop';
  return 'large';
};

/**
 * Generate blur placeholder data URL
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Placeholder color
 * @returns {string} Data URL for blur placeholder
 */
export const generateBlurPlaceholder = (width = 10, height = 10, color = '#f3f4f6') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};