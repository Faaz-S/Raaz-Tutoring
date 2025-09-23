import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useResponsive } from '../hooks/useResponsive';

/**
 * ResponsiveVideo component optimized for mobile performance
 * Handles different aspect ratios, loading strategies, and reduced motion preferences
 */
const ResponsiveVideo = ({
  src,
  poster,
  fallbackImage,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'metadata',
  onLoad,
  onError,
  children,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef(null);
  const observerRef = useRef(null);
  
  const { isMobile, isTablet } = useResponsive();

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

  // Determine optimal loading strategy based on device
  const shouldLazyLoad = isMobile && !autoPlay;
  const shouldAutoPlay = autoPlay && !prefersReducedMotion;
  const optimalPreload = isMobile ? 'none' : preload;

  // Get responsive aspect ratio
  const getAspectRatio = () => {
    if (isMobile) return '16/9';
    if (isTablet) return '4/3';
    return 'auto';
  };

  // Intersection Observer for lazy loading on mobile
  useEffect(() => {
    if (!shouldLazyLoad || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading earlier for videos
        threshold: 0.1
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldLazyLoad, isInView]);

  // Handle video load
  const handleCanPlay = (event) => {
    setIsLoaded(true);
    setShowFallback(false);
    
    if (onLoad) {
      onLoad(event);
    }
  };

  // Handle video error
  const handleError = (event) => {
    setHasError(true);
    setShowFallback(true);
    
    if (onError) {
      onError(event);
    }
  };

  // Handle reduced motion
  useEffect(() => {
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [prefersReducedMotion]);

  // Determine if video should be rendered
  const shouldRenderVideo = !shouldLazyLoad || isInView;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Mobile overlay for reduced opacity */}
      {isMobile && (
        <div className="absolute inset-0 bg-black/30 z-10 md:bg-black/20 lg:bg-transparent" />
      )}
      
      {/* Fallback image */}
      {(showFallback || hasError || !shouldRenderVideo) && fallbackImage && (
        <img
          src={fallbackImage}
          alt="Video fallback"
          className="absolute inset-0 w-full h-full object-cover lg:object-contain"
          style={{ 
            display: showFallback || hasError || !shouldRenderVideo ? 'block' : 'none' 
          }}
        />
      )}
      
      {/* Poster image while loading */}
      {poster && !isLoaded && shouldRenderVideo && (
        <img
          src={poster}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover lg:object-contain"
        />
      )}
      
      {/* Video element */}
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover lg:object-contain"
          autoPlay={shouldAutoPlay}
          loop={loop && !prefersReducedMotion}
          muted={muted}
          playsInline={playsInline}
          preload={optimalPreload}
          poster={poster}
          src={src}
          onCanPlay={handleCanPlay}
          onError={handleError}
          style={{
            aspectRatio: getAspectRatio(),
            display: hasError ? 'none' : 'block'
          }}
          // Add controls for users who prefer reduced motion
          controls={prefersReducedMotion}
          // Optimize for mobile performance
          webkit-playsinline={playsInline ? "true" : "false"}
        />
      )}
      
      {/* Loading indicator for mobile */}
      {isMobile && !isLoaded && !hasError && shouldRenderVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}
      
      {/* Reduced motion message */}
      {prefersReducedMotion && shouldRenderVideo && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded z-30">
          Video paused (reduced motion)
        </div>
      )}
      
      {/* Error message */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-20">
          <div className="text-white text-center p-4">
            <div className="mb-2">⚠️</div>
            <div className="text-sm">Video failed to load</div>
          </div>
        </div>
      )}
      
      {/* Additional content overlay */}
      {children}
    </div>
  );
};

ResponsiveVideo.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  fallbackImage: PropTypes.string,
  className: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  playsInline: PropTypes.bool,
  preload: PropTypes.oneOf(['none', 'metadata', 'auto']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  children: PropTypes.node
};

export default ResponsiveVideo;