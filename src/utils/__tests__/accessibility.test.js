import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prefersHighContrast,
  prefersReducedMotion,
  prefersDarkMode,
  getZoomLevel,
  isHighZoom,
  calculateContrastRatio,
  checkContrastCompliance,
  generateHighContrastColors,
  applyHighContrastMode,
  removeHighContrastMode,
  checkZoomUsability,
  optimizeForZoom,
  monitorAccessibilityPreferences,
  validateAccessibility
} from '../accessibility';

// Mock window.matchMedia
const mockMatchMedia = (matches = false) => ({
  matches,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
});

describe('accessibility utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Mock window properties
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => mockMatchMedia(false)),
      writable: true
    });
    
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 1,
      writable: true
    });
    
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true
    });
    
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      writable: true
    });
    
    Object.defineProperty(screen, 'width', {
      value: 1024,
      writable: true
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('preference detection', () => {
    it('should detect high contrast preference', () => {
      window.matchMedia = vi.fn(() => mockMatchMedia(true));
      expect(prefersHighContrast()).toBe(true);
      
      window.matchMedia = vi.fn(() => mockMatchMedia(false));
      expect(prefersHighContrast()).toBe(false);
    });

    it('should detect reduced motion preference', () => {
      window.matchMedia = vi.fn(() => mockMatchMedia(true));
      expect(prefersReducedMotion()).toBe(true);
      
      window.matchMedia = vi.fn(() => mockMatchMedia(false));
      expect(prefersReducedMotion()).toBe(false);
    });

    it('should detect dark mode preference', () => {
      window.matchMedia = vi.fn(() => mockMatchMedia(true));
      expect(prefersDarkMode()).toBe(true);
      
      window.matchMedia = vi.fn(() => mockMatchMedia(false));
      expect(prefersDarkMode()).toBe(false);
    });
  });

  describe('zoom detection', () => {
    it('should calculate zoom level', () => {
      // Mock screen and window dimensions
      Object.defineProperty(screen, 'width', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 960, writable: true });
      Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
      
      const zoomLevel = getZoomLevel();
      expect(zoomLevel).toBe(200); // 1920 / 960 * 1 * 100
    });

    it('should detect high zoom', () => {
      Object.defineProperty(screen, 'width', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 960, writable: true });
      
      expect(isHighZoom()).toBe(true);
      
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      expect(isHighZoom()).toBe(false);
    });
  });

  describe('contrast calculation', () => {
    it('should calculate contrast ratio', () => {
      // Mock DOM methods for color parsing
      const mockElement = {
        style: {},
        remove: vi.fn()
      };
      
      document.createElement = vi.fn(() => mockElement);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({ color: 'rgb(0, 0, 0)' }))
      });
      
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThan(1);
    });

    it('should check contrast compliance', () => {
      // Mock contrast calculation
      const mockElement = {
        style: {},
        remove: vi.fn()
      };
      
      document.createElement = vi.fn(() => mockElement);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({ color: 'rgb(0, 0, 0)' }))
      });
      
      const result = checkContrastCompliance('#000000', '#ffffff', 'AA', 'normal');
      
      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('required');
      expect(result).toHaveProperty('passes');
      expect(result).toHaveProperty('level', 'AA');
      expect(result).toHaveProperty('size', 'normal');
    });
  });

  describe('high contrast mode', () => {
    it('should generate high contrast colors', () => {
      const originalColors = {
        primary: '#3b82f6',
        secondary: '#6b7280'
      };
      
      const highContrastColors = generateHighContrastColors(originalColors);
      
      expect(highContrastColors.text).toBe('#000000');
      expect(highContrastColors.background).toBe('#ffffff');
      expect(highContrastColors.primary).toBe('#0000ff');
      expect(highContrastColors.error).toBe('#ff0000');
    });

    it('should apply high contrast mode', () => {
      applyHighContrastMode();
      
      const styleSheet = document.getElementById('high-contrast-styles');
      expect(styleSheet).toBeTruthy();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('should remove high contrast mode', () => {
      applyHighContrastMode();
      removeHighContrastMode();
      
      const styleSheet = document.getElementById('high-contrast-styles');
      expect(styleSheet).toBeFalsy();
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });

  describe('zoom usability', () => {
    it('should check zoom usability for valid element', () => {
      const element = document.createElement('button');
      element.textContent = 'Test Button';
      
      // Mock getBoundingClientRect
      element.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 50,
        right: 100,
        bottom: 50
      }));
      
      // Mock getComputedStyle
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({ fontSize: '16px' }))
      });
      
      const result = checkZoomUsability(element);
      
      expect(result).toHaveProperty('usable');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('elementSize');
      expect(result).toHaveProperty('fontSize');
    });

    it('should identify small touch targets', () => {
      const element = document.createElement('button');
      
      element.getBoundingClientRect = vi.fn(() => ({
        width: 30,
        height: 30,
        right: 30,
        bottom: 30
      }));
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({ fontSize: '16px' }))
      });
      
      const result = checkZoomUsability(element);
      
      expect(result.usable).toBe(false);
      expect(result.issues).toContain('Element smaller than minimum touch target (44px)');
    });

    it('should handle null element', () => {
      const result = checkZoomUsability(null);
      
      expect(result.usable).toBe(false);
      expect(result.issues).toContain('Element not found');
    });
  });

  describe('zoom optimization', () => {
    it('should optimize for high zoom', () => {
      optimizeForZoom(200);
      
      expect(document.body.classList.contains('high-zoom')).toBe(true);
      
      const styleSheet = document.getElementById('zoom-styles');
      expect(styleSheet).toBeTruthy();
    });

    it('should remove zoom optimization for normal zoom', () => {
      optimizeForZoom(200);
      optimizeForZoom(100);
      
      expect(document.body.classList.contains('high-zoom')).toBe(false);
      
      const styleSheet = document.getElementById('zoom-styles');
      expect(styleSheet).toBeFalsy();
    });
  });

  describe('accessibility monitoring', () => {
    it('should monitor accessibility preferences', () => {
      const callback = vi.fn();
      const mockMQ = {
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn()
      };
      
      window.matchMedia = vi.fn(() => mockMQ);
      
      const cleanup = monitorAccessibilityPreferences(callback);
      
      expect(callback).toHaveBeenCalledWith({ type: 'contrast', matches: true });
      expect(callback).toHaveBeenCalledWith({ type: 'motion', matches: true });
      expect(callback).toHaveBeenCalledWith({ type: 'colorScheme', matches: true });
      
      cleanup();
      
      expect(mockMQ.removeListener).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility validation', () => {
    it('should validate element accessibility', () => {
      const element = document.createElement('button');
      element.textContent = 'Test Button';
      
      element.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 50,
        right: 100,
        bottom: 50
      }));
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({
          color: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(255, 255, 255)',
          fontSize: '16px'
        }))
      });
      
      element.matches = vi.fn(() => true);
      
      const result = validateAccessibility(element);
      
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('warnings');
    });

    it('should identify accessibility issues', () => {
      const element = document.createElement('button');
      
      element.getBoundingClientRect = vi.fn(() => ({
        width: 30,
        height: 30,
        right: 30,
        bottom: 30
      }));
      
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({
          color: 'rgb(128, 128, 128)',
          backgroundColor: 'rgb(255, 255, 255)',
          fontSize: '12px'
        }))
      });
      
      element.matches = vi.fn(() => true);
      
      const result = validateAccessibility(element);
      
      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle null element', () => {
      const result = validateAccessibility(null);
      
      expect(result.passed).toBe(false);
      expect(result.issues).toContain('Element not found');
    });
  });
});