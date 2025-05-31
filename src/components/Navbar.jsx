// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 bg-white z-50 shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold">Raaz Tutoring</NavLink>
        <div className="space-x-6 flex items-center">
          <NavLink to="/" end
            className={({ isActive }) =>
              isActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'
            }
          >
            Home
          </NavLink>
          <NavLink to="/grades-7-9" 
            className={({ isActive }) =>
              isActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'
            }
          >
            Grades 7–9
          </NavLink>
          <NavLink to="/grades-10-12"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'
            }
          >
            Grades 10–12
          </NavLink>
          <NavLink to="/about-us"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'
            }
          >
            About Us
          </NavLink>
          
        </div>
      </div>
    </nav>
  );
}
