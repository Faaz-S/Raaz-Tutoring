/**
 * Tests for animation optimization utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prefersReducedMotion,
  onReducedMotionChange,
  AnimationPerformanceMonitor,
  animationMonitor,
  getOptimizedAnimationConfig,
  detectLowEndDevice,
  createFallbackAnimation,
  optimizeFramerMotionProps,
  optimizeAnimationStyles,
  performantRAF
} from '../animationOptimization';

// Mock window and navigator
const mockMatchMedia = vi.fn();
const mockPerformance = {
  now: vi.fn(() => Date.now())
};

beforeEach(() => {
  vi.clearAllMocks();
  
  global.window = {
    matchMedia: mockMatchMedia,
    performance: mockPerformance,
    requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16))
  };
  
  global.navigator = {
    hardwareConcurrency: 4,
    deviceMemory: 4,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    connection: {
      effectiveType: '4g'
    }
  };
  
  global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
  global.setTimeout = vi.fn((cb, delay) => cb());
  
  mockMatchMedia.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn()
  });
});

afterEach(() => {
  delete global.window;
  delete global.navigator;
  delete global.requestAnimationFrame;
  delete global.setTimeout;
});

describe('prefersReducedMotion', () => {
  it('should return false when reduced motion is not preferred', () => {
    mockMatchMedia.mockReturnValue({ matches: false });
    
    expect(prefersReducedMotion()).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('should return true when reduced motion is preferred', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    expect(prefersReducedMotion()).toBe(true);
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.window;
    
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('onReducedMotionChange', () => {
  it('should set up media query listener with addEventListener', () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const callback = vi.fn();
    const cleanup = onReducedMotionChange(callback);
    
    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Test cleanup
    cleanup();
    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should fallback to addListener for older browsers', () => {
    const mockMediaQuery = {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn()
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const callback = vi.fn();
    const cleanup = onReducedMotionChange(callback);
    
    expect(mockMediaQuery.addListener).toHaveBeenCalledWith(expect.any(Function));
    
    // Test cleanup
    cleanup();
    expect(mockMediaQuery.removeListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call callback when media query changes', () => {
    let changeHandler;
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn((event, handler) => {
        changeHandler = handler;
      }),
      removeEventListener: vi.fn()
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const callback = vi.fn();
    onReducedMotionChange(callback);
    
    // Simulate media query change
    changeHandler({ matches: true });
    
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.window;
    
    const callback = vi.fn();
    const cleanup = onReducedMotionChange(callback);
    
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});

describe('AnimationPerformanceMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new AnimationPerformanceMonitor();
  });

  it('should initialize with default values', () => {
    expect(monitor.animations.size).toBe(0);
    expect(monitor.performanceThreshold).toBe(16.67);
    expect(monitor.isMonitoring).toBe(false);
  });

  it('should start monitoring an animation', () => {
    const element = document.createElement('div');
    
    // Mock requestAnimationFrame to prevent infinite recursion
    global.requestAnimationFrame = vi.fn();
    
    monitor.startMonitoring('test-animation', element);
    
    expect(monitor.animations.has('test-animation')).toBe(true);
    const animation = monitor.animations.get('test-animation');
    expect(animation.element).toBe(element);
    expect(typeof animation.startTime).toBe('number');
  });

  it('should stop monitoring and return metrics', () => {
    const element = document.createElement('div');
    
    // Mock requestAnimationFrame to prevent infinite recursion
    global.requestAnimationFrame = vi.fn();
    
    monitor.startMonitoring('test-animation', element);
    
    // Simulate some frames
    const animation = monitor.animations.get('test-animation');
    animation.frameCount = 60;
    animation.droppedFrames = 5;
    
    const metrics = monitor.stopMonitoring('test-animation');
    
    expect(metrics).toBeDefined();
    expect(metrics.frameCount).toBe(60);
    expect(metrics.droppedFrames).toBe(5);
    expect(typeof metrics.averageFPS).toBe('number');
    expect(typeof metrics.droppedFramePercentage).toBe('number');
    expect(typeof metrics.isPerformant).toBe('boolean');
    expect(monitor.animations.has('test-animation')).toBe(false);
  });

  it('should return null when stopping non-existent animation', () => {
    const metrics = monitor.stopMonitoring('non-existent');
    
    expect(metrics).toBeNull();
  });

  it('should get current metrics for active animations', () => {
    const element = document.createElement('div');
    
    // Mock requestAnimationFrame to prevent infinite recursion
    global.requestAnimationFrame = vi.fn();
    
    monitor.startMonitoring('test-animation', element);
    
    const metrics = monitor.getCurrentMetrics();
    
    expect(metrics['test-animation']).toBeDefined();
    expect(metrics['test-animation'].isActive).toBe(true);
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.window;
    
    const element = document.createElement('div');
    
    expect(() => {
      monitor.startMonitoring('test-animation', element);
    }).not.toThrow();
  });
});

describe('getOptimizedAnimationConfig', () => {
  it('should return default config for server-side rendering', () => {
    delete global.window;
    
    const config = getOptimizedAnimationConfig();
    
    expect(config).toEqual({
      duration: 300,
      easing: 'ease-out',
      reducedMotion: false
    });
  });

  it('should return reduced motion config when preferred', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    const config = getOptimizedAnimationConfig();
    
    expect(config.duration).toBe(0);
    expect(config.reducedMotion).toBe(true);
  });

  it('should return low-end device config', () => {
    global.navigator.hardwareConcurrency = 1;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const config = getOptimizedAnimationConfig();
    
    expect(config.duration).toBe(150);
    expect(config.isLowEndDevice).toBe(true);
    expect(config.enableComplexAnimations).toBe(false);
  });

  it('should return full config for high-end devices', () => {
    global.navigator.hardwareConcurrency = 8;
    global.navigator.deviceMemory = 8;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const config = getOptimizedAnimationConfig();
    
    expect(config.duration).toBe(300);
    expect(config.isLowEndDevice).toBe(false);
    expect(config.enableComplexAnimations).toBe(true);
    expect(config.intensity).toBe(1);
  });
});

describe('detectLowEndDevice', () => {
  it('should detect low-end device by CPU cores', () => {
    global.navigator.hardwareConcurrency = 1;
    
    expect(detectLowEndDevice()).toBe(true);
  });

  it('should detect low-end device by memory', () => {
    global.navigator.deviceMemory = 1;
    
    expect(detectLowEndDevice()).toBe(true);
  });

  it('should detect low-end device by connection speed', () => {
    global.navigator.connection.effectiveType = '2g';
    
    expect(detectLowEndDevice()).toBe(true);
  });

  it('should detect low-end device by user agent', () => {
    global.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 4.4.2; SM-G900P)';
    
    expect(detectLowEndDevice()).toBe(true);
  });

  it('should return false for high-end devices', () => {
    global.navigator.hardwareConcurrency = 8;
    global.navigator.deviceMemory = 8;
    global.navigator.connection.effectiveType = '4g';
    
    expect(detectLowEndDevice()).toBe(false);
  });

  it('should handle server-side rendering gracefully', () => {
    const originalNavigator = global.navigator;
    delete global.navigator;
    
    expect(detectLowEndDevice()).toBe(false);
    
    // Restore navigator for other tests
    global.navigator = originalNavigator;
  });
});

describe('createFallbackAnimation', () => {
  it('should create no-animation fallback for reduced motion', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    const originalConfig = {
      duration: 300,
      transform: 'scale(1.1)',
      opacity: 0.8
    };
    
    const fallback = createFallbackAnimation(originalConfig);
    
    expect(fallback.duration).toBe(0);
    expect(fallback.transition).toBe('none');
  });

  it('should create simplified fallback for low-end devices', () => {
    global.navigator.hardwareConcurrency = 1;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const originalConfig = {
      duration: 500,
      transform: 'scale(1.1) rotate(45deg)',
      filter: 'blur(5px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    };
    
    const fallback = createFallbackAnimation(originalConfig);
    
    expect(fallback.duration).toBe(150);
    expect(fallback.filter).toBeUndefined();
    expect(fallback.boxShadow).toBeUndefined();
  });

  it('should return original config for high-end devices', () => {
    global.navigator.hardwareConcurrency = 8;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const originalConfig = {
      duration: 300,
      transform: 'scale(1.1)'
    };
    
    const fallback = createFallbackAnimation(originalConfig);
    
    expect(fallback).toEqual(originalConfig);
  });
});

describe('optimizeFramerMotionProps', () => {
  it('should disable animations for reduced motion', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    const motionProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 }
    };
    
    const optimized = optimizeFramerMotionProps(motionProps);
    
    expect(optimized.initial).toBe(false);
    expect(optimized.transition.duration).toBe(0);
  });

  it('should reduce duration for low-end devices', () => {
    global.navigator.hardwareConcurrency = 1;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const motionProps = {
      transition: { duration: 0.6 }
    };
    
    const optimized = optimizeFramerMotionProps(motionProps);
    
    expect(optimized.transition.duration).toBe(0.3);
  });

  it('should return original props for high-end devices', () => {
    global.navigator.hardwareConcurrency = 8;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const motionProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    };
    
    const optimized = optimizeFramerMotionProps(motionProps);
    
    expect(optimized).toEqual(motionProps);
  });
});

describe('optimizeAnimationStyles', () => {
  it('should disable animations for reduced motion', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    const styles = {
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.5s ease-out'
    };
    
    const optimized = optimizeAnimationStyles(styles);
    
    expect(optimized.transition).toBe('none');
    expect(optimized.animation).toBe('none');
  });

  it('should optimize styles for low-end devices', () => {
    global.navigator.hardwareConcurrency = 1;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const styles = {
      transition: 'all 0.5s ease',
      filter: 'blur(5px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    };
    
    const optimized = optimizeAnimationStyles(styles);
    
    expect(optimized.transition).toContain('0.15s');
    expect(optimized.filter).toBeUndefined();
    expect(optimized.boxShadow).toBeUndefined();
  });
});

describe('performantRAF', () => {
  it('should execute immediately for reduced motion', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    
    const callback = vi.fn();
    performantRAF(callback);
    
    expect(global.setTimeout).toHaveBeenCalledWith(callback, 0);
  });

  it('should throttle for low-end devices', () => {
    global.navigator.hardwareConcurrency = 1;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const callback = vi.fn();
    performantRAF(callback);
    
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should use normal RAF for high-end devices', () => {
    global.navigator.hardwareConcurrency = 8;
    mockMatchMedia.mockReturnValue({ matches: false });
    
    const callback = vi.fn();
    performantRAF(callback);
    
    expect(global.requestAnimationFrame).toHaveBeenCalledWith(callback);
  });

  it('should handle server-side rendering gracefully', () => {
    delete global.window;
    
    const callback = vi.fn();
    const result = performantRAF(callback);
    
    expect(result).toBe(0);
  });
});