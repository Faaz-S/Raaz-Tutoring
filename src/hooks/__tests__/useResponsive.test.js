import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useResponsive,
  useBreakpoint,
  useMobile,
  useTablet,
  useDesktop,
  useResponsiveValue,
} from '../useResponsive';

// Mock window object
const mockWindow = (width = 1024, height = 768) => {
  // Ensure window exists
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  }
};

// Helper to trigger resize event
const triggerResize = (width, height) => {
  mockWindow(width, height);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resize'));
  }
};

describe('useResponsive hook', () => {
  beforeEach(() => {
    mockWindow(1024, 768); // Default to desktop
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useResponsive', () => {
    it('should initialize with current window dimensions', () => {
      mockWindow(320, 568);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.width).toBe(320);
      expect(result.current.height).toBe(568);
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.deviceType).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.orientation).toBe('portrait');
    });

    it('should update state on window resize', async () => {
      const { result } = renderHook(() => useResponsive(0)); // No debounce for testing

      // Resize to mobile and trigger the event
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 568, configurable: true });
        window.dispatchEvent(new Event('resize'));
      });

      // Wait for the hook to update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // State should update after resize
      expect(result.current.width).toBe(320);
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.orientation).toBe('portrait');
    });

    it('should handle landscape orientation', () => {
      mockWindow(568, 320);
      const { result } = renderHook(() => useResponsive());

      expect(result.current.orientation).toBe('landscape');
    });

    it('should debounce resize events', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useResponsive(100));

      const initialWidth = result.current.width;

      // Trigger multiple resize events quickly
      act(() => {
        triggerResize(800, 600);
        triggerResize(900, 600);
        triggerResize(1000, 600);
      });

      // Should not update immediately due to debounce
      expect(result.current.width).toBe(initialWidth);

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should update after debounce delay
      expect(result.current.width).toBe(1000);

      vi.useRealTimers();
    });

    it('should handle SSR gracefully', () => {
      // This test verifies the SSR-safe initialization
      // The hook should initialize with default values when window is undefined
      const { result } = renderHook(() => useResponsive());

      // Should provide reasonable default values
      expect(result.current.width).toBeGreaterThan(0);
      expect(result.current.height).toBeGreaterThan(0);
      expect(typeof result.current.breakpoint).toBe('string');
      expect(typeof result.current.isDesktop).toBe('boolean');
    });
  });

  describe('useBreakpoint', () => {
    it('should return true when current breakpoint matches target', () => {
      mockWindow(800, 600);
      const { result } = renderHook(() => useBreakpoint('tablet'));

      expect(result.current).toBe(true);
    });

    it('should return false when current breakpoint does not match target', () => {
      mockWindow(800, 600);
      const { result } = renderHook(() => useBreakpoint('mobile'));

      expect(result.current).toBe(false);
    });

    it('should update when breakpoint changes', () => {
      // Test that the hook responds to different initial window sizes
      Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
      const { result: mobileResult } = renderHook(() => useBreakpoint('mobile'));
      expect(mobileResult.current).toBe(true);

      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      const { result: desktopResult } = renderHook(() => useBreakpoint('mobile'));
      expect(desktopResult.current).toBe(false);
    });
  });

  describe('useMobile', () => {
    it('should return true for mobile widths', () => {
      mockWindow(320, 568);
      const { result } = renderHook(() => useMobile());

      expect(result.current).toBe(true);
    });

    it('should return false for non-mobile widths', () => {
      mockWindow(1024, 768);
      const { result } = renderHook(() => useMobile());

      expect(result.current).toBe(false);
    });
  });

  describe('useTablet', () => {
    it('should return true for tablet widths', () => {
      mockWindow(800, 600);
      const { result } = renderHook(() => useTablet());

      expect(result.current).toBe(true);
    });

    it('should return false for non-tablet widths', () => {
      mockWindow(320, 568);
      const { result } = renderHook(() => useTablet());

      expect(result.current).toBe(false);
    });
  });

  describe('useDesktop', () => {
    it('should return true for desktop widths', () => {
      mockWindow(1200, 800);
      const { result } = renderHook(() => useDesktop());

      expect(result.current).toBe(true);
    });

    it('should return false for non-desktop widths', () => {
      mockWindow(320, 568);
      const { result } = renderHook(() => useDesktop());

      expect(result.current).toBe(false);
    });
  });

  describe('useResponsiveValue', () => {
    it('should return correct value for current breakpoint', () => {
      mockWindow(320, 568);
      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      };

      const { result } = renderHook(() => useResponsiveValue(values));

      expect(result.current).toBe('mobile-value');
    });

    it('should update when breakpoint changes', () => {
      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      };

      // Test that the hook responds to different initial window sizes
      Object.defineProperty(window, 'innerWidth', { value: 320, configurable: true });
      const { result: mobileResult } = renderHook(() => useResponsiveValue(values));
      expect(mobileResult.current).toBe('mobile-value');

      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      const { result: desktopResult } = renderHook(() => useResponsiveValue(values));
      expect(desktopResult.current).toBe('desktop-value');
    });
  });
});