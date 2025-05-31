import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-2 text-white">Contact</h3>
          <p className="mt-2">Email: raaztutoring@gmail.com<br/>Phone: (416) 909-2600</p>
        </div>
        {/* Nav Links */}
        <div>
          <h3 className="font-semibold mb-2 text-white">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about-us" className="hover:text-white">About Us</Link></li> 
            <li><Link to="/grades-7-9" className="hover:text-white">Grades 7–9</Link></li> 
            <li><Link to="/grades-10-12" className="hover:text-white">Grades 10–12</Link></li> 
          </ul>
        </div>
        {/* Social */}
        <div>
          <h3 className="font-semibold mb-2 text-white">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500">
        © 2025 Raaz Tutoring. All rights reserved.
      </div>
    </footer>
  );
}
