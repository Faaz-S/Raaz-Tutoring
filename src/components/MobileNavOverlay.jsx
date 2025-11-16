import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationOptimization } from '../hooks/useAnimationOptimization';
import { createResponsiveVariants } from './OptimizedMotion';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useScreenReader } from '../hooks/useScreenReader';

const MobileNavOverlay = ({ isOpen, onClose, links, className = '', id, ...props }) => {
  const location = useLocation();
  const { optimizeMotionProps, shouldAnimate, reducedMotion } = useAnimationOptimization();
  
  const {
    containerRef,
    handleKeyDown
  } = useKeyboardNavigation({
    enableArrowNavigation: true,
    arrowNavigationOptions: {
      vertical: true,
      horizontal: false,
      loop: true
    }
  });

  const {
    getNavigationAria,
    getLinkAria,
    announce
  } = useScreenReader();

  const baseOverlayVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const baseMenuVariants = {
    hidden: {
      x: '100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const baseLinkVariants = {
    hidden: {
      opacity: 0,
      x: 20,
    },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: reducedMotion ? 0 : index * 0.1 + 0.2,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  // Create responsive variants that adapt to device capabilities
  const overlayVariants = createResponsiveVariants(baseOverlayVariants);
  const menuVariants = createResponsiveVariants(baseMenuVariants);
  const linkVariants = createResponsiveVariants(baseLinkVariants);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            {...optimizeMotionProps({
              variants: overlayVariants,
              initial: "hidden",
              animate: "visible",
              exit: "hidden"
            })}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <motion.div
            ref={containerRef}
            className={`fixed top-0 right-0 h-full w-80 max-w-full bg-bgDark shadow-2xl z-50 ${className}`}
            {...optimizeMotionProps({
              variants: menuVariants,
              initial: "hidden",
              animate: "visible",
              exit: "hidden"
            })}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            id={id}
            onKeyDown={handleKeyDown}
            {...props}
          >
            <div className="flex flex-col h-full pt-20 px-6">
              {/* Navigation Links */}
              <nav className="flex-1" role="navigation" aria-label="Mobile navigation links">
                <ul className="space-y-2" role="menu" aria-orientation="vertical">
                  {links.map((link, index) => (
                    <motion.li
                      key={link.to}
                      role="none"
                      {...optimizeMotionProps({
                        variants: linkVariants,
                        initial: "hidden",
                        animate: "visible",
                        custom: index
                      })}
                    >
                      <NavLink
                        to={link.to}
                        onClick={(e) => {
                          // If we're already on the target page, scroll to top
                          if (location.pathname === link.to) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          announce(`Navigating to ${link.label}`, 'polite');
                          onClose();
                        }}
                        className={({ isActive }) =>
                          `block w-full px-4 py-4 rounded-lg font-sans font-semibold text-lg transition-all duration-300 min-h-[44px] flex items-center
                           focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-bgDark ${
                            isActive
                              ? 'bg-primary text-white shadow-lg'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                          }`
                        }
                        role="menuitem"
                        tabIndex={0}
                        {...getLinkAria({
                          label: `Navigate to ${link.label} page`,
                          current: undefined // Will be handled by NavLink's isActive
                        })}
                        aria-describedby={`nav-desc-${index}`}
                      >
                        {link.label}
                        <span id={`nav-desc-${index}`} className="sr-only">
                          , menu item {index + 1} of {links.length}
                        </span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer section for additional content if needed */}
              <div className="pb-6">
                {/* Space for additional mobile menu content */}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavOverlay;