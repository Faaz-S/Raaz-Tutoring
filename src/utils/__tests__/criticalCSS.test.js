/**
 * Tests for critical CSS utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  criticalCSS,
  injectCriticalCSS,
  loadNonCriticalCSS,
  preloadCriticalResources,
  measureCriticalPathPerformance,
  optimizeCSSDelivery
} from '../criticalCSS';

// Mock DOM methods
const mockDocument = {
  createElement: vi.fn(),
  querySelector: vi.fn(),
  head: {
    appendChild: vi.fn(),
    insertBefore: vi.fn()
  },
  getElementById: vi.fn()
};

const mockElement = {
  id: '',
  textContent: '',
  rel: '',
  as: '',
  href: '',
  onload: null,
  appendChild: vi.fn()
};

// Mock performance API
const mockPerformance = {
  getEntriesByType: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn()
};

const mockPerformanceObserver = vi.fn();

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Setup global mocks
  global.PerformanceObserver = mockPerformanceObserver;
  global.requestIdleCallback = vi.fn();
  
  // Setup DOM mocks
  global.document = mockDocument;
  global.window = {
    performance: mockPerformance,
    PerformanceObserver: mockPerformanceObserver,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    requestIdleCallback: vi.fn()
  };
  global.navigator = {
    connection: null
  };
  
  mockDocument.createElement.mockReturnValue(mockElement);
  mockDocument.querySelector.mockReturnValue(null);
  mockDocument.getElementById.mockReturnValue(null);
});

afterEach(() => {
  delete global.document;
  delete global.window;
  delete global.navigator;
  delete global.requestIdleCallback;
  delete global.PerformanceObserver;
});

describe('criticalCSS', () => {
  it('should contain essential CSS rules', () => {
    expect(criticalCSS).toContain('box-sizing: border-box');
    expect(criticalCSS).toContain('.hero-container');
    expect(criticalCSS).toContain('.navbar');
    expect(criticalCSS).toContain('@media (max-width: 767px)');
    expect(criticalCSS).toContain('.cta-button');
  });

  it('should include responsive breakpoints', () => {
    expect(criticalCSS).toContain('@media (max-width: 767px)');
    expect(criticalCSS).toContain('@media (min-width: 768px)');
    expect(criticalCSS).toContain('@media (min-width: 1024px)');
  });

  it('should include loading states', () => {
    expect(criticalCSS).toContain('.loading');
    expect(criticalCSS).toContain('.loaded');
  });
});

describe('injectCriticalCSS', () => {
  it('should inject critical CSS into document head', () => {
    const mockStyle = { ...mockElement };
    mockDocument.createElement.mockReturnValue(mockStyle);
    
    injectCriticalCSS();
    
    expect(mockDocument.createElement).toHaveBeenCalledWith('style');
    expect(mockStyle.id).toBe('critical-css');
    expect(mockStyle.textContent).toBe(criticalCSS);
    expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockStyle);
  });

  it('should not inject if critical CSS already exists', () => {
    mockDocument.getElementById.mockReturnValue(mockElement);
    
    injectCriticalCSS();
    
    expect(mockDocument.createElement).not.toHaveBeenCalled();
  });

  it('should insert before existing stylesheets', () => {
    const mockStyle = { ...mockElement };
    const mockExistingLink = { ...mockElement };
    
    mockDocument.createElement.mockReturnValue(mockStyle);
    mockDocument.querySelector.mockReturnValue(mockExistingLink);
    
    injectCriticalCSS();
    
    expect(mockDocument.head.insertBefore).toHaveBeenCalledWith(mockStyle, mockExistingLink);
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.document;
    
    expect(() => injectCriticalCSS()).not.toThrow();
  });
});

describe('loadNonCriticalCSS', () => {
  it('should create preload link for Google Fonts', () => {
    const mockLink = { ...mockElement };
    const mockNoscript = { ...mockElement };
    const mockFallbackLink = { ...mockElement };
    
    mockDocument.createElement
      .mockReturnValueOnce(mockLink)
      .mockReturnValueOnce(mockNoscript)
      .mockReturnValueOnce(mockFallbackLink);
    
    loadNonCriticalCSS();
    
    expect(mockDocument.createElement).toHaveBeenCalledWith('link');
    expect(mockLink.rel).toBe('preload');
    expect(mockLink.as).toBe('style');
    expect(mockLink.href).toContain('fonts.googleapis.com');
    expect(typeof mockLink.onload).toBe('function');
    
    // Test the onload function
    mockLink.onload();
    expect(mockLink.rel).toBe('stylesheet');
  });

  it('should create noscript fallback', () => {
    const mockNoscript = { ...mockElement, appendChild: vi.fn() };
    const mockLink = { ...mockElement };
    
    mockDocument.createElement
      .mockReturnValueOnce(mockLink) // First call for preload link
      .mockReturnValueOnce(mockNoscript) // Second call for noscript
      .mockReturnValueOnce(mockLink); // Third call for fallback link
    
    loadNonCriticalCSS();
    
    expect(mockDocument.createElement).toHaveBeenCalledWith('noscript');
    expect(mockNoscript.appendChild).toHaveBeenCalled();
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.document;
    
    expect(() => loadNonCriticalCSS()).not.toThrow();
  });
});

describe('preloadCriticalResources', () => {
  it('should preload critical images and videos', () => {
    const mockLink = { ...mockElement };
    mockDocument.createElement.mockReturnValue(mockLink);
    
    preloadCriticalResources();
    
    expect(mockDocument.createElement).toHaveBeenCalledTimes(2);
    expect(mockDocument.head.appendChild).toHaveBeenCalledTimes(2);
  });

  it('should set correct resource types', () => {
    const mockLinks = [{ ...mockElement }, { ...mockElement }];
    let callIndex = 0;
    
    mockDocument.createElement.mockImplementation(() => mockLinks[callIndex++]);
    
    preloadCriticalResources();
    
    expect(mockLinks[0].as).toBe('image');
    expect(mockLinks[1].as).toBe('video');
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.document;
    
    expect(() => preloadCriticalResources()).not.toThrow();
  });
});

describe('measureCriticalPathPerformance', () => {
  it('should set up performance observer', () => {
    const mockObserver = {
      observe: vi.fn()
    };
    
    global.PerformanceObserver = vi.fn().mockReturnValue(mockObserver);
    
    measureCriticalPathPerformance();
    
    expect(global.PerformanceObserver).toHaveBeenCalled();
    expect(mockObserver.observe).toHaveBeenCalledWith({
      entryTypes: ['paint', 'largest-contentful-paint']
    });
  });

  it('should add load event listener', () => {
    const mockObserver = {
      observe: vi.fn()
    };
    global.PerformanceObserver = vi.fn().mockReturnValue(mockObserver);
    
    measureCriticalPathPerformance();
    
    expect(global.window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('should handle missing performance API gracefully', () => {
    delete global.window.performance;
    
    expect(() => measureCriticalPathPerformance()).not.toThrow();
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.window;
    
    expect(() => measureCriticalPathPerformance()).not.toThrow();
  });
});

describe('optimizeCSSDelivery', () => {
  it('should delay loading on slow connections', () => {
    global.navigator.connection = {
      effectiveType: '2g'
    };
    
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    
    optimizeCSSDelivery();
    
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    
    vi.useRealTimers();
  });

  it('should load immediately on fast connections', () => {
    global.navigator.connection = {
      effectiveType: '4g'
    };
    
    global.requestIdleCallback = vi.fn();
    
    optimizeCSSDelivery();
    
    expect(global.requestIdleCallback).toHaveBeenCalled();
  });

  it('should respect save data preference', () => {
    global.navigator.connection = {
      effectiveType: '4g',
      saveData: true
    };
    
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    
    optimizeCSSDelivery();
    
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    
    vi.useRealTimers();
  });

  it('should handle missing connection API gracefully', () => {
    delete global.navigator;
    
    expect(() => optimizeCSSDelivery()).not.toThrow();
  });
});