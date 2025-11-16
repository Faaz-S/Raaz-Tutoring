import React, { useState, useRef, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';

/**
 * OptimizedVideo component with multiple source support for fastest loading
 */
const OptimizedVideo = ({
  sources = [],
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
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef(null);
  const { isMobile } = useResponsive();

  // Intersection Observer for lazy loading on mobile
  useEffect(() => {
    if (!isMobile || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, isInView]);

  const handleCanPlay = (event) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event) => {
    setHasError(true);
    onError?.(event);
  };

  const shouldRenderVideo = !isMobile || isInView;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {/* Fallback image */}
      {(hasError || !shouldRenderVideo) && fallbackImage && (
        <img
          src={fallbackImage}
          alt="Video fallback"
          className="absolute inset-0 w-full h-full object-cover lg:object-contain"
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

      {/* Video with multiple sources */}
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover lg:object-contain"
          autoPlay={autoPlay && !prefersReducedMotion}
          loop={loop && !prefersReducedMotion}
          muted={muted}
          playsInline={playsInline}
          preload={isMobile ? 'none' : preload}
          poster={poster}
          onCanPlay={handleCanPlay}
          onError={handleError}
          controls={prefersReducedMotion}
          style={{ display: hasError ? 'none' : 'block' }}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </video>
      )}

      {/* Loading indicator */}
      {isMobile && !isLoaded && !hasError && shouldRenderVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedVideo;