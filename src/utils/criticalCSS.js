/**
 * Critical CSS utilities for performance optimization
 * Handles extraction and loading of critical above-the-fold styles
 */

// Critical CSS for above-the-fold content (Hero section, Navigation)
export const criticalCSS = `
/* Critical base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Critical layout styles for above-the-fold */
.hero-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Critical responsive styles */
@media (max-width: 767px) {
  .hero-container {
    flex-direction: column;
    text-align: center;
    padding: 80px 16px 40px;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .desktop-nav {
    display: none;
  }
}

@media (min-width: 768px) {
  .mobile-menu-button {
    display: none;
  }
  
  .desktop-nav {
    display: flex;
  }
}

/* Critical typography */
.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 3rem;
  }
}

/* Critical button styles */
.cta-button {
  display: inline-block;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  min-height: 44px;
  min-width: 44px;
}

.cta-button:hover {
  background: #2563eb;
}

/* Loading state to prevent FOUC */
.loading {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.loaded {
  opacity: 1;
}
`;

/**
 * Injects critical CSS into the document head
 */
export const injectCriticalCSS = () => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('critical-css');
  if (existingStyle) return; // Already injected
  
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalCSS;
  
  // Insert before any existing stylesheets
  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (firstLink) {
    document.head.insertBefore(style, firstLink);
  } else {
    document.head.appendChild(style);
  }
};

/**
 * Lazy loads non-critical CSS
 */
export const loadNonCriticalCSS = () => {
  if (typeof document === 'undefined') return;
  
  // Load Google Fonts asynchronously
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'style';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap';
  fontLink.onload = function() {
    this.rel = 'stylesheet';
  };
  document.head.appendChild(fontLink);
  
  // Fallback for browsers that don't support preload
  const noscriptFallback = document.createElement('noscript');
  const fallbackLink = document.createElement('link');
  fallbackLink.rel = 'stylesheet';
  fallbackLink.href = 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap';
  noscriptFallback.appendChild(fallbackLink);
  document.head.appendChild(noscriptFallback);
};

/**
 * Preloads critical resources
 */
export const preloadCriticalResources = () => {
  if (typeof document === 'undefined') return;
  
  const criticalImages = [
    '/images/logo.png',
    '/videos/hero-background.mp4'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = src.endsWith('.mp4') ? 'video' : 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

/**
 * Measures and reports performance metrics
 */
export const measureCriticalPathPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'paint' && import.meta.env.DEV) {
        console.log(`${entry.name}: ${entry.startTime}ms`);
      }
      if (entry.entryType === 'largest-contentful-paint' && import.meta.env.DEV) {
        console.log(`LCP: ${entry.startTime}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  
  // Report First Contentful Paint
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && import.meta.env.DEV) {
      console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
      console.log(`Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
    }
  });
};

/**
 * Optimizes CSS delivery based on connection speed
 */
export const optimizeCSSDelivery = () => {
  if (typeof navigator === 'undefined') return;
  
  // Check for slow connection
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.saveData
  );
  
  if (isSlowConnection) {
    // Defer non-critical CSS loading on slow connections
    setTimeout(loadNonCriticalCSS, 2000);
  } else {
    // Load immediately on fast connections
    requestIdleCallback ? requestIdleCallback(loadNonCriticalCSS) : setTimeout(loadNonCriticalCSS, 0);
  }
};