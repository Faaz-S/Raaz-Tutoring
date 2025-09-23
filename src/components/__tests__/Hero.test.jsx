import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Hero from '../Hero';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock useResponsive hook
const mockUseResponsive = vi.fn();
vi.mock('../hooks/useResponsive', () => ({
  useResponsive: mockUseResponsive,
}));

// Mock logo import
vi.mock('/images/logo.png', () => ({
  default: 'mocked-logo.png',
}));

describe('Hero Component Responsive Layout', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock getElementById
    document.getElementById = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile layout correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    render(<Hero />);

    // Check that logo is present
    const logo = screen.getByAltText('Raaz Tutoring Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('w-48');

    // Check main heading
    const heading = screen.getByText(/MATH INSTRUCTION/);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl');

    // Check subtitle
    const subtitle = screen.getByText(/Interactive, personalized sessions/);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-base');

    // Check CTA button
    const button = screen.getByText('Schedule Free Trial');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('w-full', 'max-w-xs');
  });

  it('renders tablet layout correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    });

    render(<Hero />);

    const logo = screen.getByAltText('Raaz Tutoring Logo');
    expect(logo).toHaveClass('w-48', 'md:w-56');

    const heading = screen.getByText(/MATH INSTRUCTION/);
    expect(heading).toHaveClass('text-2xl', 'md:text-3xl');

    const subtitle = screen.getByText(/Interactive, personalized sessions/);
    expect(subtitle).toHaveClass('text-base', 'md:text-lg');
  });

  it('renders desktop layout correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    render(<Hero />);

    const logo = screen.getByAltText('Raaz Tutoring Logo');
    expect(logo).toHaveClass('lg:w-64');

    const heading = screen.getByText(/MATH INSTRUCTION/);
    expect(heading).toHaveClass('lg:text-4xl', 'xl:text-5xl');

    const subtitle = screen.getByText(/Interactive, personalized sessions/);
    expect(subtitle).toHaveClass('lg:text-xl');
  });

  it('has proper grid layout structure', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    const { container } = render(<Hero />);
    
    // Check for grid container
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });

  it('has correct content ordering for mobile vs desktop', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    // Content should be order-2 on mobile, order-1 on desktop
    const contentSection = container.querySelector('.order-2');
    expect(contentSection).toBeInTheDocument();
    expect(contentSection).toHaveClass('lg:order-1');

    // Video should be order-1 on mobile, order-2 on desktop
    const videoSection = container.querySelector('.order-1');
    expect(videoSection).toBeInTheDocument();
    expect(videoSection).toHaveClass('lg:order-2');
  });

  it('handles CTA button click correctly', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const mockElement = { scrollIntoView: vi.fn() };
    document.getElementById = vi.fn().mockReturnValue(mockElement);

    render(<Hero />);

    const button = screen.getByText('Schedule Free Trial');
    fireEvent.click(button);

    expect(document.getElementById).toHaveBeenCalledWith('contact');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('renders video element with correct attributes', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveProperty('autoplay', true);
    expect(video).toHaveProperty('loop', true);
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveProperty('playsInline', true);
    expect(video).toHaveAttribute('src', '/videos/sine1.mp4');
    expect(video).toHaveAttribute('poster', '/images/video-poster.jpg');
    expect(video).toHaveAttribute('preload', 'metadata');
  });

  it('applies correct responsive classes to video container', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const videoContainer = container.querySelector('.order-1.lg\\:order-2');
    expect(videoContainer).toBeInTheDocument();
    expect(videoContainer).toHaveClass('h-64', 'md:h-80', 'lg:h-full');
  });

  it('renders fallback image with correct attributes', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const fallbackImg = container.querySelector('img[src="/images/video-fallback.jpg"]');
    expect(fallbackImg).toBeInTheDocument();
    expect(fallbackImg).toHaveAttribute('alt', 'Math tutoring background');
    expect(fallbackImg).toHaveClass('absolute', 'inset-0', 'w-full', 'h-full');
  });

  it('applies correct mobile overlay opacity', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const overlay = container.querySelector('.bg-black\\/30');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('md:bg-black/20', 'lg:bg-transparent');
  });

  it('video element has style attribute for aspect ratio', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('style');
    expect(video.getAttribute('style')).toContain('aspect-ratio');
  });});

  it('applies responsive typography classes to heading', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const heading = container.querySelector('h1');
    expect(heading).toHaveClass('text-2xl', 'leading-tight');
    expect(heading).toHaveClass('md:text-3xl', 'md:leading-tight', 'md:tracking-wider');
    expect(heading).toHaveClass('lg:text-4xl', 'lg:leading-tight', 'lg:tracking-wider');
    expect(heading).toHaveClass('xl:text-5xl', 'xl:leading-tight');
  });

  it('applies responsive typography classes to subtitle', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const subtitle = container.querySelector('p');
    expect(subtitle).toHaveClass('text-base', 'leading-relaxed', 'max-w-sm');
    expect(subtitle).toHaveClass('md:text-lg', 'md:leading-relaxed', 'md:max-w-md');
    expect(subtitle).toHaveClass('lg:text-xl', 'lg:leading-relaxed', 'lg:max-w-lg');
  });

  it('applies responsive spacing classes to content container', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const contentContainer = container.querySelector('.space-y-6');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('md:space-y-8', 'lg:space-y-6');
  });

  it('applies responsive logo scaling classes', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const logo = container.querySelector('img[alt="Raaz Tutoring Logo"]');
    expect(logo).toHaveClass('w-48');
    expect(logo).toHaveClass('md:w-56');
    expect(logo).toHaveClass('lg:w-64', 'lg:ml-4');
    expect(logo).toHaveClass('xl:w-72');
  });

  it('applies responsive button typography and spacing', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('text-sm', 'px-6', 'py-4', 'tracking-wide');
    expect(button).toHaveClass('md:text-base', 'md:px-8', 'md:py-3', 'md:tracking-normal');
    expect(button).toHaveClass('lg:text-base', 'lg:px-8', 'lg:py-3', 'lg:tracking-normal');
    expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
  });  it
('button meets minimum touch target size requirements', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('md:min-h-[44px]');
    expect(button).toHaveClass('lg:min-h-[44px]');
  });

  it('button has proper accessibility attributes', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-label', 'Schedule a free tutoring trial session');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('button has touch-optimized styling', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('touch-manipulation', 'select-none');
    expect(button.style.WebkitTapHighlightColor).toBe('transparent');
  });

  it('button has proper hover and active states', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:bg-red-600', 'hover:shadow-xl');
    expect(button).toHaveClass('active:bg-red-700', 'active:scale-95', 'active:shadow-md');
  });

  it('button has proper focus states for accessibility', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-4', 'focus:ring-red-500/50', 'focus:ring-offset-2');
  });

  it('button has disabled state styling', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('button has smooth transitions for interactions', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    });

    const { container } = render(<Hero />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
  });