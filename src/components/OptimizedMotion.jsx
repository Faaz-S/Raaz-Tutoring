/**
 * Optimized Motion component wrapper for Framer Motion
 * Automatically applies performance optimizations and reduced motion support
 */
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimationOptimization } from '../hooks/useAnimationOptimization';

/**
 * Optimized motion.div component
 */
export const OptimizedMotionDiv = forwardRef(({ children, ...motionProps }, ref) => {
  const { optimizeMotionProps } = useAnimationOptimization();
  const optimizedProps = optimizeMotionProps(motionProps);

  return (
    <motion.div ref={ref} {...optimizedProps}>
      {children}
    </motion.div>
  );
});

OptimizedMotionDiv.displayName = 'OptimizedMotionDiv';

/**
 * Optimized motion.section component
 */
export const OptimizedMotionSection = forwardRef(({ children, ...motionProps }, ref) => {
  const { optimizeMotionProps } = useAnimationOptimization();
  const optimizedProps = optimizeMotionProps(motionProps);

  return (
    <motion.section ref={ref} {...optimizedProps}>
      {children}
    </motion.section>
  );
});

OptimizedMotionSection.displayName = 'OptimizedMotionSection';

/**
 * Optimized motion.nav component
 */
export const OptimizedMotionNav = forwardRef(({ children, ...motionProps }, ref) => {
  const { optimizeMotionProps } = useAnimationOptimization();
  const optimizedProps = optimizeMotionProps(motionProps);

  return (
    <motion.nav ref={ref} {...optimizedProps}>
      {children}
    </motion.nav>
  );
});

OptimizedMotionNav.displayName = 'OptimizedMotionNav';

/**
 * Generic optimized motion component factory
 * @param {string} component - HTML element or motion component name
 * @returns {React.Component} Optimized motion component
 */
export const createOptimizedMotionComponent = (component) => {
  const MotionComponent = motion[component] || motion.div;
  
  const OptimizedComponent = forwardRef(({ children, ...motionProps }, ref) => {
    const { optimizeMotionProps } = useAnimationOptimization();
    const optimizedProps = optimizeMotionProps(motionProps);

    return (
      <MotionComponent ref={ref} {...optimizedProps}>
        {children}
      </MotionComponent>
    );
  });

  OptimizedComponent.displayName = `OptimizedMotion${component.charAt(0).toUpperCase() + component.slice(1)}`;
  
  return OptimizedComponent;
};

/**
 * Performance monitoring wrapper for animations
 */
export const MonitoredMotion = forwardRef(({ 
  children, 
  animationId, 
  onPerformanceUpdate,
  ...motionProps 
}, ref) => {
  const { 
    optimizeMotionProps, 
    startAnimationMonitoring, 
    stopAnimationMonitoring 
  } = useAnimationOptimization({ enablePerformanceMonitoring: true });

  const optimizedProps = optimizeMotionProps({
    ...motionProps,
    onAnimationStart: () => {
      if (animationId && ref?.current) {
        startAnimationMonitoring(animationId, ref.current);
      }
      motionProps.onAnimationStart?.();
    },
    onAnimationComplete: () => {
      if (animationId) {
        const metrics = stopAnimationMonitoring(animationId);
        if (metrics && onPerformanceUpdate) {
          onPerformanceUpdate(metrics);
        }
      }
      motionProps.onAnimationComplete?.();
    }
  });

  return (
    <motion.div ref={ref} {...optimizedProps}>
      {children}
    </motion.div>
  );
});

MonitoredMotion.displayName = 'MonitoredMotion';

/**
 * Conditional animation wrapper - only animates if motion is not reduced
 */
export const ConditionalMotion = ({ 
  children, 
  fallback = null, 
  ...motionProps 
}) => {
  const { shouldAnimate, optimizeMotionProps } = useAnimationOptimization();

  if (!shouldAnimate) {
    return fallback || <div>{children}</div>;
  }

  const optimizedProps = optimizeMotionProps(motionProps);

  return (
    <motion.div {...optimizedProps}>
      {children}
    </motion.div>
  );
};

/**
 * Responsive animation variants that adapt to device capabilities
 */
export const createResponsiveVariants = (baseVariants) => {
  return {
    ...baseVariants,
    // Add reduced motion variants
    reducedMotion: {
      initial: baseVariants.initial || {},
      animate: baseVariants.animate || {},
      exit: baseVariants.exit || {},
      transition: { duration: 0 }
    },
    // Add low-end device variants
    lowEndDevice: {
      initial: baseVariants.initial || {},
      animate: {
        ...baseVariants.animate,
        // Simplify transforms
        scale: baseVariants.animate?.scale ? 1 : undefined,
        rotate: undefined,
        // Keep only essential properties
        opacity: baseVariants.animate?.opacity,
        x: baseVariants.animate?.x,
        y: baseVariants.animate?.y
      },
      exit: baseVariants.exit || {},
      transition: { 
        duration: 0.15,
        ease: 'easeOut'
      }
    }
  };
};

export default OptimizedMotionDiv;