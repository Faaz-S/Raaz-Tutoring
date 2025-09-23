import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkAutoplaySupport,
  getOptimalPreload,
  prefersReducedMotion,
  getResponsiveAspectRatio,
  getConnectionType,
  createVideoObserver,
  getVideoLoadingStrategy,
  monitorVideoPerformance
} from '../videoOptimization';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockPlay = vi.fn();

beforeEach(() => {
  vi.spyOn(document, 'createElement').mockImplementation(mockCreateElement);
  
  // Mock video element
  const mockVideo = {
    muted: false,
    playsInline: false,
    src: '',
    play: mockPlay,
    addEventListener: vi.fn(),
    currentTime: 0
  };
  
  mockCreateElement.mockReturnValue(mockVideo);
  mockPlay.mockResolvedValue();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g'
  }
});

describe('videoOptimization utilities', () => {
  describe('checkAutoplaySupport', () => {
    it('returns a promise', () => {
      const result = checkAutoplaySupport();
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves to true when autoplay is supported', async () => {
      mockPlay.mockResolvedValue();
      
      const isSupported = await checkAutoplaySupport();
      expect(isSupported).toBe(true);
      expect(mockCreateElement).toHaveBeenCalledWith('video');
    });

    it('resolves to false when autoplay fails', async () => {
      mockPlay.mockRejectedValue(new Error('Autoplay failed'));
      
      const isSupported = await checkAutoplaySupport();
      expect(isSupported).toBe(false);
    });

    it('resolves to false when play returns undefined', async () => {
      mockPlay.mockReturnValue(undefined);
      
      const isSupported = await checkAutoplaySupport();
      expect(isSupported).toBe(false);
    });
  });

  describe('getOptimalPreload', () => {
    it('returns "none" for slow connections', () => {
      expect(getOptimalPreload(false, 'slow-2g')).toBe('none');
      expect(getOptimalPreload(false, '2g')).toBe('none');
      expect(getOptimalPreload(true, 'slow-2g')).toBe('none');
    });

    it('returns "none" for mobile on slow connections', () => {
      expect(getOptimalPreload(true, '3g')).toBe('none');
      expect(getOptimalPreload(true, 'unknown')).toBe('none');
    });

    it('returns "metadata" for mobile on 4g', () => {
      expect(getOptimalPreload(true, '4g')).toBe('metadata');
    });

    it('returns "metadata" for desktop', () => {
      expect(getOptimalPreload(false, '3g')).toBe('metadata');
      expect(getOptimalPreload(false, '4g')).toBe('metadata');
      expect(getOptimalPreload(false, 'unknown')).toBe('metadata');
    });
  });

  describe('prefersReducedMotion', () => {
    it('returns false when reduced motion is not preferred', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));

      expect(prefersReducedMotion()).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('returns true when reduced motion is preferred', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true
      }));

      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe('getResponsiveAspectRatio', () => {
    it('returns "16/9" for mobile screens', () => {
      expect(getResponsiveAspectRatio(500)).toBe('16/9');
      expect(getResponsiveAspectRatio(767)).toBe('16/9');
    });

    it('returns "4/3" for tablet screens', () => {
      expect(getResponsiveAspectRatio(768)).toBe('4/3');
      expect(getResponsiveAspectRatio(1000)).toBe('4/3');
      expect(getResponsiveAspectRatio(1023)).toBe('4/3');
    });

    it('returns "auto" for desktop screens', () => {
      expect(getResponsiveAspectRatio(1024)).toBe('auto');
      expect(getResponsiveAspectRatio(1920)).toBe('auto');
    });

    it('uses window.innerWidth by default', () => {
      window.innerWidth = 800;
      expect(getResponsiveAspectRatio()).toBe('4/3');
    });
  });

  describe('getConnectionType', () => {
    it('returns connection type when available', () => {
      navigator.connection = { effectiveType: '4g' };
      expect(getConnectionType()).toBe('4g');
    });

    it('returns "unknown" when connection is not available', () => {
      delete navigator.connection;
      expect(getConnectionType()).toBe('unknown');
    });

    it('returns "unknown" when effectiveType is not available', () => {
      navigator.connection = {};
      expect(getConnectionType()).toBe('unknown');
    });
  });

  describe('createVideoObserver', () => {
    beforeEach(() => {
      global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        callback,
        options
      }));
    });

    it('creates intersection observer with default options', () => {
      const callback = vi.fn();
      createVideoObserver(callback);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        callback,
        expect.objectContaining({
          rootMargin: '100px',
          threshold: 0.1
        })
      );
    });

    it('merges custom options with defaults', () => {
      const callback = vi.fn();
      const customOptions = { rootMargin: '200px', threshold: 0.5 };
      
      createVideoObserver(callback, customOptions);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        callback,
        expect.objectContaining({
          rootMargin: '200px',
          threshold: 0.5
        })
      );
    });
  });

  describe('getVideoLoadingStrategy', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false
      }));
    });

    it('returns optimized strategy for mobile with slow connection', () => {
      const strategy = getVideoLoadingStrategy(true, 'slow-2g');
      
      expect(strategy).toEqual({
        preload: 'none',
        autoplay: true,
        lazyLoad: true,
        quality: 'low'
      });
    });

    it('returns strategy for desktop with fast connection', () => {
      const strategy = getVideoLoadingStrategy(false, '4g');
      
      expect(strategy).toEqual({
        preload: 'metadata',
        autoplay: true,
        lazyLoad: false,
        quality: 'high'
      });
    });

    it('respects reduced motion preference', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true
      }));

      const strategy = getVideoLoadingStrategy(false, '4g');
      expect(strategy.autoplay).toBe(false);
    });

    it('sets quality based on connection type', () => {
      expect(getVideoLoadingStrategy(false, 'slow-2g').quality).toBe('low');
      expect(getVideoLoadingStrategy(false, '2g').quality).toBe('low');
      expect(getVideoLoadingStrategy(false, '3g').quality).toBe('medium');
      expect(getVideoLoadingStrategy(false, '4g').quality).toBe('high');
      expect(getVideoLoadingStrategy(false, 'unknown').quality).toBe('auto');
    });
  });

  describe('monitorVideoPerformance', () => {
    it('returns undefined for null video element', () => {
      const result = monitorVideoPerformance(null);
      expect(result).toBeUndefined();
    });

    it('sets up event listeners and returns metrics object', () => {
      const mockVideo = {
        addEventListener: vi.fn(),
        currentTime: 0
      };

      const metrics = monitorVideoPerformance(mockVideo);

      expect(mockVideo.addEventListener).toHaveBeenCalledWith('loadstart', expect.any(Function));
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('canplay', expect.any(Function));
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
      
      expect(metrics).toEqual({
        loadStart: 0,
        canPlay: 0,
        firstFrame: 0,
        bufferHealth: 0
      });
    });
  });
});