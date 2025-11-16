import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Custom Link component that scrolls to top when clicking on the current page
 */
const ScrollToTopLink = ({ to, children, className, ...props }) => {
  const location = useLocation();

  const handleClick = (e) => {
    // If we're already on the target page, scroll to top
    if (location.pathname === to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise, let React Router handle the navigation normally
  };

  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default ScrollToTopLink;