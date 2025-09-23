/**
 * React hook for managing critical CSS loading and performance optimization
 */
import { useEffect, useState } from 'react';
import { 
  injectCriticalCSS, 
  loadNonCriticalCSS, 
  preloadCriticalResources,
  measureCriticalPathPerformance,
  optimizeCSSDelivery
} from '../utils/criticalCSS';

/**
 * Hook to manage critical CSS loading and performance optimization
 * @param {Object} options - Configuration options
 * @param {boolean} options.enablePerformanceMonitoring - Whether to enable performance monitoring
 * @param {boolean} options.preloadResources - Whether to preload critical resources
 * @returns {Object} Loading state and performance metrics
 */
export const useCriticalCSS = (options = {}) => {
  const {
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    preloadResources = true
  } = options;
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  useEffect(() => {
    // Inject critical CSS immediately
    injectCriticalCSS();
    
    // Preload critical resources if enabled
    if (preloadResources) {
      preloadCriticalResources();
    }
    
    // Set up performance monitoring
    if (enablePerformanceMonitoring) {
      measureCriticalPathPerformance();
    }
    
    // Optimize CSS delivery based on connection
    optimizeCSSDelivery();
    
    // Mark as loaded after critical CSS is injected
    setIsLoaded(true);
    
    // Add loaded class to body to prevent FOUC
    document.body.classList.add('loaded');
    
    return () => {
      // Cleanup if needed
      document.body.classList.remove('loaded');
    };
  }, [enablePerformanceMonitoring, preloadResources]);
  
  // Monitor performance metrics
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;
    
    const updateMetrics = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime
        };
        
        setPerformanceMetrics(metrics);
      }
    };
    
    // Update metrics after load
    window.addEventListener('load', updateMetrics);
    
    return () => {
      window.removeEventListener('load', updateMetrics);
    };
  }, [enablePerformanceMonitoring]);
  
  return {
    isLoaded,
    performanceMetrics
  };
};

/**
 * Hook to manage CSS loading priority based on viewport visibility
 * @param {string} selector - CSS selector for the element to observe
 * @param {Function} loadCallback - Callback to execute when element is visible
 */
export const useLazyCSSLoading = (selector, loadCallback) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      setTimeout(loadCallback, 1000);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadCallback();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px' // Load 50px before element comes into view
      }
    );
    
    const element = document.querySelector(selector);
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [selector, loadCallback]);
};