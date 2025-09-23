import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateResponsiveSources,
  generateSrcSet,
  generateSizes,
  checkWebPSupport,
  preloadImages,
  calculateOptimalDimensions,
  createImageObserver,
  getCurrentBreakpoint,
  generateBlurPlaceholder
} from '../imageOptimization';

// Mock DOM methods
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 2,
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

// Mock document methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockGetContext = vi.fn();
const mockToDataURL = vi.fn();

beforeEach(() => {
  // Mock document.createElement
  vi.spyOn(document, 'createElement').mockImplementation(mockCreateElement);
  
  // Mock document.head.appendChild
  vi.spyOn(document.head, 'appendChild').mockImplementation(mockAppendChild);
  
  // Mock canvas context
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: mockGetContext,
    toDataURL: mockToDataURL
  };
  
  const mockContext = {
    fillStyle: '',
    fillRect: vi.fn()
  };
  
  mockCreateElement.mockReturnValue(mockCanvas);
  mockGetContext.mockReturnValue(mockContext);
  mockToDataURL.mockReturnValue('data:image/png;base64,mock');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('imageOptimization utilities', () => {
  describe('generateResponsiveSources', () => {
    it('generates sources for default densities', () => {
      const sources = generateResponsiveSources('/images/test.jpg');
      
      expect(sources).toEqual({
        webp: {
          '1x': '/images/test.webp',
          '2x': '/images/test@2x.webp',
          '3x': '/images/test@3x.webp'
        },
        fallback: {
          '1x': '/images/test.jpg',
          '2x': '/images/test@2x.jpg',
          '3x': '/images/test@3x.jpg'
        }
      });
    });

    it('generates sources for custom densities', () => {
      const sources = generateResponsiveSources('/images/test.png', [1, 2]);
      
      expect(sources).toEqual({
        webp: {
          '1x': '/images/test.webp',
          '2x': '/images/test@2x.webp'
        },
        fallback: {
          '1x': '/images/test.png',
          '2x': '/images/test@2x.png'
        }
      });
    });

    it('handles different file extensions', () => {
      const sources = generateResponsiveSources('/images/test.webp');
      
      expect(sources.fallback['1x']).toBe('/images/test.webp');
      expect(sources.webp['1x']).toBe('/images/test.webp');
    });
  });

  describe('generateSrcSet', () => {
    it('creates correct srcset string', () => {
      const sources = {
        '1x': '/images/test.jpg',
        '2x': '/images/test@2x.jpg',
        '3x': '/images/test@3x.jpg'
      };
      
      const srcSet = generateSrcSet(sources);
      expect(srcSet).toBe('/images/test.jpg 1x, /images/test@2x.jpg 2x, /images/test@3x.jpg 3x');
    });

    it('handles empty sources object', () => {
      const srcSet = generateSrcSet({});
      expect(srcSet).toBe('');
    });
  });

  describe('generateSizes', () => {
    it('generates default sizes string', () => {
      const sizes = generateSizes();
      expect(sizes).toBe('(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw');
    });

    it('uses custom breakpoints', () => {
      const customBreakpoints = {
        mobile: '90vw',
        tablet: '60vw',
        desktop: '40vw'
      };
      
      const sizes = generateSizes(customBreakpoints);
      expect(sizes).toBe('(max-width: 767px) 90vw, (max-width: 1023px) 60vw, 40vw');
    });
  });

  describe('checkWebPSupport', () => {
    it('returns a promise', () => {
      const result = checkWebPSupport();
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves with boolean value', async () => {
      // Mock Image constructor
      global.Image = class {
        constructor() {
          setTimeout(() => {
            this.height = 2;
            if (this.onload) this.onload();
          }, 0);
        }
      };

      const isSupported = await checkWebPSupport();
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('preloadImages', () => {
    it('creates preload links for images', () => {
      const imageSources = [
        { src: '/images/test1.jpg' },
        { src: '/images/test2.jpg', srcSet: 'test2.jpg 1x, test2@2x.jpg 2x', sizes: '100vw' }
      ];

      preloadImages(imageSources);

      expect(mockCreateElement).toHaveBeenCalledWith('link');
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });
  });

  describe('calculateOptimalDimensions', () => {
    it('calculates dimensions with device pixel ratio', () => {
      const dimensions = calculateOptimalDimensions(100, 200, 2);
      
      expect(dimensions).toEqual({
        width: 200,
        height: 400
      });
    });

    it('uses default device pixel ratio', () => {
      const dimensions = calculateOptimalDimensions(100, 200);
      
      expect(dimensions).toEqual({
        width: 200, // 100 * 2 (mocked devicePixelRatio)
        height: 400 // 200 * 2
      });
    });

    it('handles fractional dimensions', () => {
      const dimensions = calculateOptimalDimensions(100.5, 200.7, 1.5);
      
      expect(dimensions).toEqual({
        width: 151, // Math.ceil(100.5 * 1.5)
        height: 302  // Math.ceil(200.7 * 1.5)
      });
    });
  });

  describe('createImageObserver', () => {
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
      const observer = createImageObserver(callback);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        callback,
        expect.objectContaining({
          rootMargin: '50px',
          threshold: 0.1
        })
      );
    });

    it('merges custom options with defaults', () => {
      const callback = vi.fn();
      const customOptions = { rootMargin: '100px', threshold: 0.5 };
      
      createImageObserver(callback, customOptions);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        callback,
        expect.objectContaining({
          rootMargin: '100px',
          threshold: 0.5
        })
      );
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('returns mobile for small screens', () => {
      expect(getCurrentBreakpoint(500)).toBe('mobile');
      expect(getCurrentBreakpoint(767)).toBe('mobile');
    });

    it('returns tablet for medium screens', () => {
      expect(getCurrentBreakpoint(768)).toBe('tablet');
      expect(getCurrentBreakpoint(1000)).toBe('tablet');
      expect(getCurrentBreakpoint(1023)).toBe('tablet');
    });

    it('returns desktop for large screens', () => {
      expect(getCurrentBreakpoint(1024)).toBe('desktop');
      expect(getCurrentBreakpoint(1200)).toBe('desktop');
      expect(getCurrentBreakpoint(1279)).toBe('desktop');
    });

    it('returns large for extra large screens', () => {
      expect(getCurrentBreakpoint(1280)).toBe('large');
      expect(getCurrentBreakpoint(1920)).toBe('large');
    });

    it('uses window.innerWidth by default', () => {
      window.innerWidth = 800;
      expect(getCurrentBreakpoint()).toBe('tablet');
    });
  });

  describe('generateBlurPlaceholder', () => {
    it('creates canvas and returns data URL', () => {
      const placeholder = generateBlurPlaceholder(20, 30, '#ff0000');

      expect(mockCreateElement).toHaveBeenCalledWith('canvas');
      expect(mockGetContext).toHaveBeenCalledWith('2d');
      expect(mockToDataURL).toHaveBeenCalled();
      expect(placeholder).toBe('data:image/png;base64,mock');
    });

    it('uses default parameters', () => {
      generateBlurPlaceholder();

      const mockCanvas = mockCreateElement.mock.results[0].value;
      expect(mockCanvas.width).toBe(10);
      expect(mockCanvas.height).toBe(10);
    });

    it('sets canvas dimensions correctly', () => {
      generateBlurPlaceholder(50, 75);

      const mockCanvas = mockCreateElement.mock.results[0].value;
      expect(mockCanvas.width).toBe(50);
      expect(mockCanvas.height).toBe(75);
    });
  });
});