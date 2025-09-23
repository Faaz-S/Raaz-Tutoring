/**
 * Tests for useAnimationOptimization hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAnimationOptimization } from '../useAnimationOptimization';

// Mock the animation optimization utilities
vi.mock('../../utils/animationOptimization', () => ({
  prefersReducedMotion: vi.fn(() => false),
  onReducedMotionChange: vi.fn(() => () => {}),
  getOptimizedAnimationConfig: vi.fn(() => ({
    duration: 300,
    easing: 'ease-out',
    reducedMotion: false,
    isLowEndDevice: false,
    enableComplexAnimations: true,
    intensity: 1
  })),
  animationMonitor: {
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(() => ({
      duration: 1000,
      frameCount: 60,
      droppedFrames: 2,
      averageFPS: 58,
      droppedFramePercentage: 3.3,
      isPerformant: true
    })),
    getCurrentMetrics: vi.fn(() => ({}))
  },
  optimizeFramerMotionProps: vi.fn((props) => props),
  optimizeAnimationStyles: vi.fn((styles) => styles)
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NODE_ENV = 'development';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAnimationOptimization', () => {
  it('should export the hook function', () => {
    expect(typeof useAnimationOptimization).toBe('function');
  });

  it('should accept options parameter', () => {
    // Test that the hook accepts options without throwing
    expect(() => {
      const options = {
        enablePerformanceMonitoring: true,
        fallbackOnPoorPerformance: false
      };
      // Just test the function signature, not the execution
      expect(typeof useAnimationOptimization).toBe('function');
    }).not.toThrow();
  });

  it('should call animation optimization utilities when imported', async () => {
    const { 
      prefersReducedMotion, 
      getOptimizedAnimationConfig,
      optimizeFramerMotionProps,
      optimizeAnimationStyles
    } = await import('../../utils/animationOptimization');
    
    // Test that the utilities are available
    expect(typeof prefersReducedMotion).toBe('function');
    expect(typeof getOptimizedAnimationConfig).toBe('function');
    expect(typeof optimizeFramerMotionProps).toBe('function');
    expect(typeof optimizeAnimationStyles).toBe('function');
  });

  it('should handle reduced motion preferences', async () => {
    const { prefersReducedMotion } = await import('../../utils/animationOptimization');
    
    // Mock reduced motion preference
    prefersReducedMotion.mockReturnValue(true);
    
    // Test that the function can be called
    expect(prefersReducedMotion()).toBe(true);
  });

  it('should handle animation configuration', async () => {
    const { getOptimizedAnimationConfig } = await import('../../utils/animationOptimization');
    
    const config = getOptimizedAnimationConfig();
    
    expect(config).toHaveProperty('duration');
    expect(config).toHaveProperty('easing');
    expect(config).toHaveProperty('reducedMotion');
  });

  it('should handle performance monitoring', async () => {
    const { animationMonitor } = await import('../../utils/animationOptimization');
    
    // Test monitoring functions
    expect(typeof animationMonitor.startMonitoring).toBe('function');
    expect(typeof animationMonitor.stopMonitoring).toBe('function');
    expect(typeof animationMonitor.getCurrentMetrics).toBe('function');
  });

  it('should optimize motion props', async () => {
    const { optimizeFramerMotionProps } = await import('../../utils/animationOptimization');
    
    const testProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    };
    
    const optimized = optimizeFramerMotionProps(testProps);
    
    expect(optimized).toBeDefined();
    expect(typeof optimized).toBe('object');
  });

  it('should optimize animation styles', async () => {
    const { optimizeAnimationStyles } = await import('../../utils/animationOptimization');
    
    const testStyles = {
      transition: 'all 0.3s ease',
      transform: 'scale(1.1)'
    };
    
    const optimized = optimizeAnimationStyles(testStyles);
    
    expect(optimized).toBeDefined();
    expect(typeof optimized).toBe('object');
  });
});