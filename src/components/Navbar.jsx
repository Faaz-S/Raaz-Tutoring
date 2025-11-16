import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// import DarkModeToggle from './DarkModeToggle';
import { motion } from 'framer-motion';
import HamburgerIcon from './HamburgerIcon';
import MobileNavOverlay from './MobileNavOverlay';

const links = [
  { to: '/', label: 'Home' },
  { to: '/grades-7-9', label: 'Grades 7-9' },
  { to: '/grades-10-12', label: 'Grades 10-12'},
  { to: '/about', label: 'About' },
   
];

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (e, linkTo) => {
    // If we're already on the target page, scroll to top
    if (location.pathname === linkTo) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="fixed w-full z-20 bg-bgDark shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          <div className="text-accent font-sans text-2xl md:text-3xl font-bold tracking-wide">Raaz Tutoring</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-sans font-semibold text-lg transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {/* <DarkModeToggle /> */}
          </div>
          
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <HamburgerIcon 
              isOpen={isMobileMenuOpen} 
              onClick={toggleMobileMenu}
              className="z-50 relative"
            />
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Overlay */}
      <MobileNavOverlay 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        links={links}
      />
    </>
  );
}