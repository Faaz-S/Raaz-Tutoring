import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ResponsiveImage from '../ResponsiveImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('ResponsiveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with basic props', () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={false}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/test.jpg');
  });

  it('generates correct WebP and fallback sources', () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={false}
      />
    );

    const picture = document.querySelector('picture');
    expect(picture).toBeInTheDocument();

    const webpSource = picture.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
    expect(webpSource).toHaveAttribute('srcset', '/images/test.webp 1x, /images/test@2x.webp 2x, /images/test@3x.webp 3x');

    const fallbackSource = picture.querySelector('source[type="image/jpg"]');
    expect(fallbackSource).toBeInTheDocument();
    expect(fallbackSource).toHaveAttribute('srcset', '/images/test.jpg 1x, /images/test@2x.jpg 2x, /images/test@3x.jpg 3x');
  });

  it('applies custom sizes attribute', () => {
    const customSizes = '(max-width: 768px) 100vw, 50vw';
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        sizes={customSizes}
        lazy={false}
      />
    );

    const sources = document.querySelectorAll('source');
    sources.forEach(source => {
      expect(source).toHaveAttribute('sizes', customSizes);
    });
  });

  it('shows loading placeholder initially', () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={false}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles image load event', async () => {
    const onLoad = vi.fn();
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        onLoad={onLoad}
        lazy={false}
      />
    );

    const img = screen.getByAltText('Test image');
    fireEvent.load(img);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    // Loading placeholder should be hidden
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles image error event', async () => {
    const onError = vi.fn();
    render(
      <ResponsiveImage
        src="/images/nonexistent.jpg"
        alt="Test image"
        onError={onError}
        lazy={false}
      />
    );

    const img = screen.getByAltText('Test image');
    fireEvent.error(img);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Image failed to load')).toBeInTheDocument();
  });

  it('implements lazy loading with IntersectionObserver', () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    
    mockIntersectionObserver.mockReturnValue({
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    });

    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={true}
      />
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '50px',
        threshold: 0.1
      })
    );

    expect(mockObserve).toHaveBeenCalled();
  });

  it('skips lazy loading when priority is true', () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={true}
        priority={true}
      />
    );

    // Image should be rendered immediately
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('sets loading attribute correctly', async () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    let observerCallback;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
      };
    });

    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={true}
        priority={false}
      />
    );

    // Trigger intersection observer callback
    observerCallback([{ isIntersecting: true }]);

    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-image-class';
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        className={customClass}
        lazy={false}
      />
    );

    const container = document.querySelector(`.${customClass}`);
    expect(container).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        data-testid="custom-image"
        lazy={false}
      />
    );

    const container = screen.getByTestId('custom-image');
    expect(container).toBeInTheDocument();
  });

  it('handles different image formats correctly', () => {
    render(
      <ResponsiveImage
        src="/images/test.png"
        alt="Test image"
        lazy={false}
      />
    );

    const fallbackSource = document.querySelector('source[type="image/png"]');
    expect(fallbackSource).toBeInTheDocument();
    expect(fallbackSource).toHaveAttribute('srcset', '/images/test.png 1x, /images/test@2x.png 2x, /images/test@3x.png 3x');
  });

  it('shows correct opacity states during loading', async () => {
    render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={false}
      />
    );

    const img = screen.getByAltText('Test image');
    
    // Initially should have opacity-0
    expect(img).toHaveClass('opacity-0');

    // After load event, should have opacity-100
    fireEvent.load(img);

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('cleans up intersection observer on unmount', () => {
    const mockDisconnect = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    });

    const { unmount } = render(
      <ResponsiveImage
        src="/images/test.jpg"
        alt="Test image"
        lazy={true}
      />
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});