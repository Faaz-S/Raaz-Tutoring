import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ResponsiveVideo from '../ResponsiveVideo';

// Mock useResponsive hook
const mockUseResponsive = vi.fn();
vi.mock('../hooks/useResponsive', () => ({
  useResponsive: () => mockUseResponsive()
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock matchMedia
const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('ResponsiveVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
    
    // Reset matchMedia mock
    mockMatchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with basic props', () => {
    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        poster="/images/poster.jpg"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/videos/test.mp4');
    expect(video).toHaveAttribute('poster', '/images/poster.jpg');
  });

  it('applies mobile overlay when on mobile', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    const { container } = render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const overlay = container.querySelector('[class*="bg-black/30"]');
    expect(overlay).toBeInTheDocument();
  });

  it('sets correct aspect ratio for different screen sizes', () => {
    // Test desktop first
    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    let video = document.querySelector('video');
    expect(video.style.aspectRatio).toBe('auto');
  });

  it('sets mobile aspect ratio correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    expect(video.style.aspectRatio).toBe('16/9');
  });

  it('sets tablet aspect ratio correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false
    });

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    expect(video.style.aspectRatio).toBe('4/3');
  });

  it('handles reduced motion preference', () => {
    // Mock reduced motion preference
    mockMatchMedia.mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('controls');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('loop');

    expect(screen.getByText('Video paused (reduced motion)')).toBeInTheDocument();
  });

  it('shows fallback image on video error', async () => {
    render(
      <ResponsiveVideo
        src="/videos/nonexistent.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    fireEvent.error(video);

    await waitFor(() => {
      const fallbackImg = document.querySelector('img[src="/images/fallback.jpg"]');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg.style.display).toBe('block');
    });

    expect(screen.getByText('Video failed to load')).toBeInTheDocument();
  });

  it('handles video load event', async () => {
    const onLoad = vi.fn();
    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        poster="/images/poster.jpg"
        onLoad={onLoad}
      />
    );

    const video = document.querySelector('video');
    fireEvent.canPlay(video);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('implements lazy loading on mobile when autoPlay is false', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
        autoPlay={false}
      />
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '100px',
        threshold: 0.1
      })
    );
  });

  it('shows loading indicator on mobile when video is not loaded', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    // The loading indicator should be present initially
    expect(screen.getByText('Loading video...')).toBeInTheDocument();
  });

  it('optimizes preload for mobile', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      />
    );

    const video = document.querySelector('video');
    expect(video).toHaveAttribute('preload', 'none');
  });

  it('renders children content', () => {
    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
      >
        <div data-testid="overlay-content">Custom overlay</div>
      </ResponsiveVideo>
    );

    expect(screen.getByTestId('overlay-content')).toBeInTheDocument();
    expect(screen.getByText('Custom overlay')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
        className="custom-video-class"
      />
    );

    const videoContainer = container.firstChild;
    expect(videoContainer).toHaveClass('custom-video-class');
  });

  it('passes through additional props', () => {
    render(
      <ResponsiveVideo
        src="/videos/test.mp4"
        fallbackImage="/images/fallback.jpg"
        data-testid="custom-video"
      />
    );

    expect(screen.getByTestId('custom-video')).toBeInTheDocument();
  });
});