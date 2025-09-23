import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ResponsiveImage component with srcset support, lazy loading, and WebP fallbacks
 * Optimizes image loading for different screen densities and formats
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  lazy = true,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate WebP and fallback image sources with different densities
  const generateImageSources = (baseSrc) => {
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    return {
      webp: {
        '1x': `${baseName}.webp`,
        '2x': `${baseName}@2x.webp`,
        '3x': `${baseName}@3x.webp`
      },
      fallback: {
        '1x': baseSrc,
        '2x': `${baseName}@2x.${extension}`,
        '3x': `${baseName}@3x.${extension}`
      }
    };
  };

  const imageSources = generateImageSources(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

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
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(event);
    }
  };

  const handleError = (event) => {
    setHasError(true);
    if (onError) {
      onError(event);
    }
  };

  // Generate srcset strings for WebP and fallback formats
  const webpSrcSet = `${imageSources.webp['1x']} 1x, ${imageSources.webp['2x']} 2x, ${imageSources.webp['3x']} 3x`;
  const fallbackSrcSet = `${imageSources.fallback['1x']} 1x, ${imageSources.fallback['2x']} 2x, ${imageSources.fallback['3x']} 3x`;

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {isInView && (
        <picture>
          {/* WebP format with srcset for different densities */}
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizes}
          />
          
          {/* Fallback format with srcset for different densities */}
          <source
            type={`image/${src.split('.').pop()}`}
            srcSet={fallbackSrcSet}
            sizes={sizes}
          />
          
          {/* Main img element */}
          <img
            src={src}
            alt={alt}
            loading={lazy && !priority ? 'lazy' : 'eager'}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
              ${hasError ? 'bg-gray-200' : ''}
            `}
          />
        </picture>
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-sm text-center p-4">
            <div className="mb-2">⚠️</div>
            <div>Image failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  lazy: PropTypes.bool,
  priority: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default ResponsiveImage;