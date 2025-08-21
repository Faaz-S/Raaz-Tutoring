import React from 'react';
import { NavLink } from 'react-router-dom';
// import DarkModeToggle from './DarkModeToggle';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/grades-7-9', label: 'Grades 7-9' },
  { to: '/grades-10-12', label: 'Grades 10-12'},
  { to: '/about', label: 'About' },
   
];

export default function Navbar() {
  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="fixed w-full z-20 bg-bgDark shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        <div className="text-accent font-sans text-3xl font-bold tracking-wide">Raaz Tutoring</div>
        <div className="hidden md:flex space-x-6 items-center">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
        <div className="md:hidden">
          {/* Mobile menu icon here */}
          {/* <DarkModeToggle /> */}
        </div>
      </div>
    </motion.nav>
  );
}