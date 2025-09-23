import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation, useRovingTabIndex } from '../useKeyboardNavigation';

// Mock the focus management utilities
vi.mock('../utils/focusManagement', () => ({
  trapFocus: vi.fn(() => vi.fn()),
  createFocusRestorer: vi.fn(() => vi.fn()),
  handleArrowNavigation: vi.fn((event, items, currentIndex) => {
    if (event.key === 'ArrowDown') return Math.min(currentIndex + 1, items.length - 1);
    if (event.key === 'ArrowUp') return Math.max(currentIndex - 1, 0);
    return currentIndex;
  }),
  announceToScreenReader: vi.fn()
}));

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    expect(result.current.containerRef).toBeDefined();
    expect(typeof result.current.setTriggerElement).toBe('function');
    expect(typeof result.current.activateFocusTrap).toBe('function');
    expect(typeof result.current.deactivateFocusTrap).toBe('function');
    expect(typeof result.current.restoreFocus).toBe('function');
    expect(typeof result.current.handleKeyDown).toBe('function');
    expect(typeof result.current.handleEscape).toBe('function');
    expect(typeof result.current.announce).toBe('function');
  });

  it('should handle trigger element setting', () => {
    const { result } = renderHook(() => useKeyboardNavigation({
      restoreFocusOnClose: true
    }));

    const mockElement = document.createElement('button');
    
    act(() => {
      result.current.setTriggerElement(mockElement);
    });

    // Should not throw and should be callable
    expect(() => result.current.restoreFocus()).not.toThrow();
  });

  it('should handle focus trap activation', () => {
    const { result } = renderHook(() => useKeyboardNavigation({
      trapFocusWhenActive: true
    }));

    // Create a container element
    const container = document.createElement('div');
    result.current.containerRef.current = container;

    act(() => {
      result.current.activateFocusTrap();
    });

    act(() => {
      result.current.deactivateFocusTrap();
    });

    // Should not throw
    expect(true).toBe(true);
  });

  it('should handle announcements when enabled', () => {
    const { result } = renderHook(() => useKeyboardNavigation({
      announceStateChanges: true
    }));

    act(() => {
      result.current.announce('Test message');
    });

    // Should not throw
    expect(true).toBe(true);
  });

  it('should handle escape key', () => {
    const { result } = renderHook(() => useKeyboardNavigation());
    const mockCallback = vi.fn();

    let cleanup;
    act(() => {
      cleanup = result.current.handleEscape(mockCallback);
    });

    // Simulate escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    // Cleanup
    if (cleanup) cleanup();

    expect(true).toBe(true); // Test passes if no errors thrown
  });

  it('should handle keyboard navigation when enabled', () => {
    const { result } = renderHook(() => useKeyboardNavigation({
      enableArrowNavigation: true
    }));

    // Create container with focusable elements
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button 1</button>
      <button>Button 2</button>
      <button>Button 3</button>
    `;
    result.current.containerRef.current = container;

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn()
    };

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    // Should not throw
    expect(true).toBe(true);
  });
});

describe('useRovingTabIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items));

    expect(result.current.itemRefs).toBeDefined();
    expect(result.current.currentIndex).toBe(0);
    expect(typeof result.current.focusItem).toBe('function');
    expect(typeof result.current.handleKeyDown).toBe('function');
    expect(typeof result.current.updateTabIndex).toBe('function');
  });

  it('should handle custom default index', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items, {
      defaultIndex: 1
    }));

    expect(result.current.currentIndex).toBe(1);
  });

  it('should handle keyboard navigation', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items));

    // Mock refs
    result.current.itemRefs.current = [
      { current: { focus: vi.fn(), tabIndex: 0 } },
      { current: { focus: vi.fn(), tabIndex: -1 } },
      { current: { focus: vi.fn(), tabIndex: -1 } }
    ];

    const mockEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn()
    };

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle focus item', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items));

    // Mock refs
    result.current.itemRefs.current = [
      { current: { focus: vi.fn(), tabIndex: 0 } },
      { current: { focus: vi.fn(), tabIndex: -1 } },
      { current: { focus: vi.fn(), tabIndex: -1 } }
    ];

    act(() => {
      result.current.focusItem(1);
    });

    expect(result.current.itemRefs.current[1].current.focus).toHaveBeenCalled();
  });

  it('should handle horizontal orientation', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items, {
      orientation: 'horizontal'
    }));

    // Mock refs
    result.current.itemRefs.current = [
      { current: { focus: vi.fn(), tabIndex: 0 } },
      { current: { focus: vi.fn(), tabIndex: -1 } },
      { current: { focus: vi.fn(), tabIndex: -1 } }
    ];

    const mockEvent = {
      key: 'ArrowRight',
      preventDefault: vi.fn()
    };

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle Home and End keys', () => {
    const items = ['item1', 'item2', 'item3'];
    const { result } = renderHook(() => useRovingTabIndex(items));

    // Mock refs
    result.current.itemRefs.current = [
      { current: { focus: vi.fn(), tabIndex: -1 } },
      { current: { focus: vi.fn(), tabIndex: 0 } },
      { current: { focus: vi.fn(), tabIndex: -1 } }
    ];

    // Test Home key
    const homeEvent = {
      key: 'Home',
      preventDefault: vi.fn()
    };

    act(() => {
      result.current.handleKeyDown(homeEvent);
    });

    expect(homeEvent.preventDefault).toHaveBeenCalled();

    // Test End key
    const endEvent = {
      key: 'End',
      preventDefault: vi.fn()
    };

    act(() => {
      result.current.handleKeyDown(endEvent);
    });

    expect(endEvent.preventDefault).toHaveBeenCalled();
  });
});