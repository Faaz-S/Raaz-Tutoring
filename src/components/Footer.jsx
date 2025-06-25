import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Contact from '../components/Contact';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Contact Form Section */}
        <div className=" id='contact' ref={contactRef} max-w-3xl mx-auto mb-16">
          <h2  className="text-3xl font-bold text-center text-white mb-8">Get in Touch</h2>
          <Contact />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo space */}
          <div className="text-white text-lg font-bold">Raaz Tutoring</div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/grades-7-9" className="hover:text-white">Grades 7–9</Link></li>
              <li><Link to="/grades-10-12" className="hover:text-white">Grades 10–12</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Contact</h3>
            <p>Email: <span className="text-white">raaztutoring@gmail.com</span><br />
               Phone: <span className="text-white">(416) 909-2600</span>
            </p>
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-white">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white"><FaInstagram size={20} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          © 2025 Raaz Tutoring. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
