import React from 'react';

const SkipNavigation = () => {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#contact', label: 'Skip to contact form' },
  ];

  return (
    <div className="sr-only focus-within:not-sr-only">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="absolute top-0 left-0 z-50 bg-primary text-white px-4 py-2 rounded-md 
                     transform -translate-y-full focus:translate-y-0 
                     transition-transform duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                     text-sm font-medium min-h-[44px] flex items-center
                     hover:bg-primary-dark active:bg-primary-darker"
          onFocus={(e) => {
            // Ensure the skip link is visible when focused
            e.target.style.transform = 'translateY(0)';
          }}
          onBlur={(e) => {
            // Hide the skip link when focus is lost
            e.target.style.transform = 'translateY(-100%)';
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipNavigation;