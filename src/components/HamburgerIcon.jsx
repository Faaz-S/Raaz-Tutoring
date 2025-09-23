import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const HamburgerIcon = forwardRef(({ isOpen, onClick, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`relative w-6 h-6 flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 rounded min-h-[44px] min-w-[44px] ${className}`}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      type="button"
      {...props}
    >
      {/* Top line */}
      <motion.span
        className="block w-6 h-0.5 bg-gray-300 rounded-sm"
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -4,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* Middle line */}
      <motion.span
        className="block w-6 h-0.5 bg-gray-300 rounded-sm mt-1"
        animate={{
          opacity: isOpen ? 0 : 1,
          x: isOpen ? -10 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      
      {/* Bottom line */}
      <motion.span
        className="block w-6 h-0.5 bg-gray-300 rounded-sm mt-1"
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -8 : 4,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
    </button>
  );
});

HamburgerIcon.displayName = 'HamburgerIcon';

export default HamburgerIcon;