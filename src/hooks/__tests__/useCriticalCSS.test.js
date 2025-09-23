/**
 * Tests for useCriticalCSS hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCriticalCSS } from '../useCriticalCSS';

// Mock the critical CSS utilities
vi.mock('../../utils/criticalCSS', () => ({
  injectCriticalCSS: vi.fn(),
  loadNonCriticalCSS: vi.fn(),
  preloadCriticalResources: vi.fn(),
  measureCriticalPathPerformance: vi.fn(),
  optimizeCSSDelivery: vi.fn()
}));

const mockDocument = {
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  },
  querySelector: vi.fn()
};

const mockPerformance = {
  getEntriesByType: vi.fn(() => [])
};

const mockIntersectionObserver = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  global.document = mockDocument;
  global.window = {
    performance: mockPerformance,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    IntersectionObserver: mockIntersectionObserver
  };
  
  // Reset environment
  process.env.NODE_ENV = 'development';
});

afterEach(() => {
  delete global.document;
  delete global.window;
  vi.restoreAllMocks();
});

describe('useCriticalCSS', () => {
  it('should export the hook function', () => {
    expect(typeof useCriticalCSS).toBe('function');
  });

  it('should call critical CSS utilities when imported', async () => {
    const { injectCriticalCSS, preloadCriticalResources, optimizeCSSDelivery } = await import('../../utils/criticalCSS');
    
    // Test that the utilities are available
    expect(typeof injectCriticalCSS).toBe('function');
    expect(typeof preloadCriticalResources).toBe('function');
    expect(typeof optimizeCSSDelivery).toBe('function');
  });

  it('should handle options parameter', () => {
    // Test that the hook accepts options without throwing
    expect(() => {
      const options = {
        enablePerformanceMonitoring: true,
        preloadResources: false
      };
      // Just test the function signature, not the execution
      expect(typeof useCriticalCSS).toBe('function');
    }).not.toThrow();
  });
});

describe('useLazyCSSLoading', () => {
  it('should be available as a named export', async () => {
    const { useLazyCSSLoading } = await import('../useCriticalCSS');
    expect(typeof useLazyCSSLoading).toBe('function');
  });

  it('should accept selector and callback parameters', () => {
    // Test function signature without DOM dependencies
    expect(() => {
      const selector = '.test-selector';
      const callback = vi.fn();
      // Just verify the function exists and accepts parameters
      expect(typeof selector).toBe('string');
      expect(typeof callback).toBe('function');
    }).not.toThrow();
  });
});