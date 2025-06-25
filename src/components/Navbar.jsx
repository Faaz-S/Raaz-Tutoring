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
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <div className= "text-accent font-display text-2xl">Raaz Tutoring</div>
        <div className="hidden md:flex space-x-4 items-center">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1 rounded font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`
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