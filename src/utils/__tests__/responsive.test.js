import { describe, it, expect } from 'vitest';
import {
  BREAKPOINTS,
  BREAKPOINT_NAMES,
  getCurrentBreakpoint,
  isBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  getResponsiveValue,
  debounce,
} from '../responsive';

describe('responsive utilities', () => {
  describe('BREAKPOINTS', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.mobile).toBe(0);
      expect(BREAKPOINTS.tablet).toBe(768);
      expect(BREAKPOINTS.desktop).toBe(1024);
      expect(BREAKPOINTS.largeDesktop).toBe(1280);
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('should return mobile for widths below tablet', () => {
      expect(getCurrentBreakpoint(320)).toBe(BREAKPOINT_NAMES.MOBILE);
      expect(getCurrentBreakpoint(767)).toBe(BREAKPOINT_NAMES.MOBILE);
    });

    it('should return tablet for widths between tablet and desktop', () => {
      expect(getCurrentBreakpoint(768)).toBe(BREAKPOINT_NAMES.TABLET);
      expect(getCurrentBreakpoint(1023)).toBe(BREAKPOINT_NAMES.TABLET);
    });

    it('should return desktop for widths between desktop and large desktop', () => {
      expect(getCurrentBreakpoint(1024)).toBe(BREAKPOINT_NAMES.DESKTOP);
      expect(getCurrentBreakpoint(1279)).toBe(BREAKPOINT_NAMES.DESKTOP);
    });

    it('should return large desktop for widths above large desktop', () => {
      expect(getCurrentBreakpoint(1280)).toBe(BREAKPOINT_NAMES.LARGE_DESKTOP);
      expect(getCurrentBreakpoint(1920)).toBe(BREAKPOINT_NAMES.LARGE_DESKTOP);
    });
  });

  describe('isBreakpoint', () => {
    it('should correctly identify breakpoint matches', () => {
      expect(isBreakpoint(320, BREAKPOINT_NAMES.MOBILE)).toBe(true);
      expect(isBreakpoint(320, BREAKPOINT_NAMES.TABLET)).toBe(false);
      expect(isBreakpoint(800, BREAKPOINT_NAMES.TABLET)).toBe(true);
      expect(isBreakpoint(1200, BREAKPOINT_NAMES.DESKTOP)).toBe(true);
    });
  });

  describe('isMobile', () => {
    it('should return true for mobile widths', () => {
      expect(isMobile(320)).toBe(true);
      expect(isMobile(767)).toBe(true);
    });

    it('should return false for non-mobile widths', () => {
      expect(isMobile(768)).toBe(false);
      expect(isMobile(1024)).toBe(false);
    });
  });

  describe('isTablet', () => {
    it('should return true for tablet widths', () => {
      expect(isTablet(768)).toBe(true);
      expect(isTablet(1023)).toBe(true);
    });

    it('should return false for non-tablet widths', () => {
      expect(isTablet(767)).toBe(false);
      expect(isTablet(1024)).toBe(false);
    });
  });

  describe('isDesktop', () => {
    it('should return true for desktop and larger widths', () => {
      expect(isDesktop(1024)).toBe(true);
      expect(isDesktop(1920)).toBe(true);
    });

    it('should return false for smaller widths', () => {
      expect(isDesktop(1023)).toBe(false);
      expect(isDesktop(768)).toBe(false);
    });
  });

  describe('getDeviceType', () => {
    it('should return correct device types', () => {
      expect(getDeviceType(320)).toBe('mobile');
      expect(getDeviceType(800)).toBe('tablet');
      expect(getDeviceType(1200)).toBe('desktop');
    });
  });

  describe('getResponsiveValue', () => {
    const testValues = {
      mobile: 'mobile-value',
      tablet: 'tablet-value',
      desktop: 'desktop-value',
    };

    it('should return exact match when available', () => {
      expect(getResponsiveValue(320, testValues)).toBe('mobile-value');
      expect(getResponsiveValue(800, testValues)).toBe('tablet-value');
      expect(getResponsiveValue(1200, testValues)).toBe('desktop-value');
    });

    it('should fallback to smaller breakpoint when exact match not available', () => {
      const partialValues = {
        mobile: 'mobile-value',
        desktop: 'desktop-value',
      };
      
      // Tablet width should fallback to mobile value
      expect(getResponsiveValue(800, partialValues)).toBe('mobile-value');
    });

    it('should return first available value as last resort', () => {
      const singleValue = { desktop: 'desktop-value' };
      expect(getResponsiveValue(320, singleValue)).toBe('desktop-value');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      // Wait for debounce delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 60);
    });

    it('should pass arguments correctly', (done) => {
      let receivedArgs;
      const debouncedFn = debounce((...args) => {
        receivedArgs = args;
      }, 50);

      debouncedFn('test', 123);

      setTimeout(() => {
        expect(receivedArgs).toEqual(['test', 123]);
        done();
      }, 60);
    });
  });
});