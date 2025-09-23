import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import logo from '/images/logo.png';

export default function Hero() {
  return (
    <>
      {/* Main Hero Section */}
      <section className="relative bg-gradient-to-b from-black via-[#0d0d0d] to-[#1a1a1a] pt-16">
        {/* Desktop Video on Right Half - Only visible on large screens */}
        <div className="hidden lg:block absolute bottom-0 right-0 w-[55%] h-[90%] z-0 overflow-hidden">
          <video
            className="w-full h-full object-contain"
            autoPlay
            loop
            muted
            playsInline
            src="/videos/sine1.mp4"
          />
        </div>

        {/* Content Container */}
        <motion.div
          className="relative z-10 flex flex-col items-center lg:items-start justify-center lg:justify-start min-h-screen text-center lg:text-left px-4 md:px-8 lg:px-16 max-w-full lg:max-w-xl pt-20 lg:ml-16"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <img
            src={logo}
            alt="Raaz Tutoring Logo"
            className="w-48 sm:w-56 md:w-64 lg:w-72 h-auto mb-6 lg:mb-8 lg:ml-4"
          />

          <h1 className="font-doodle tracking-wide uppercase text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-4xl font-bold text-white mb-4 drop-shadow-md leading-tight">
            MATH INSTRUCTION <br />
            <span className='text-red-500 tracking-wide drop-shadow-md'>YOU CAN RELY ON</span>
          </h1>

          <p className="text-white text-base sm:text-lg md:text-xl mb-6 drop-shadow-md max-w-md lg:max-w-none">
            Interactive, personalized sessions tailored to you
          </p>

          <motion.button
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold shadow-lg text-sm sm:text-base"
          >
            Schedule Free Trial
          </motion.button>
        </motion.div>
      </section>

      {/* Mobile/Tablet Video Section - Below content on smaller screens */}
      <section className="lg:hidden bg-gradient-to-b from-[#1a1a1a] to-black py-8">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-lg shadow-2xl max-w-md mx-auto">
            <video
              className="w-full h-auto object-contain"
              autoPlay
              loop
              muted
              playsInline
              src="/videos/sine1.mp4"
            />
          </div>
        </div>
      </section>
    </>
  );
}
