import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import logo from '/images/logo.png';

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0d0d] to-[#1a1a1a] pt-16">
      {/* Large Video on Right Half (full width preserved) */}
      <div className="absolute bottom-0 right-0 w-[55%] h-[90%] z-0 overflow-hidden">
  <video
    className="w-full h-full object-contain"
    autoPlay
    loop
    muted
    playsInline
    src="/videos/sine1.mp4"
  />
</div>

      {/* Left-aligned Content */}
      <motion.div
        className="relative z-10 flex flex-col items-start justify-start h-full text-left px-4 md:px-8 lg:px-16 max-w-xl pt-20 ml-16"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={logo}
          alt="Raaz Tutoring Logo"
          className="w-56 md:w-64 lg:w-72 h-auto mb-8 ml-4"
        />

        <h1 className="font-doodle tracking-wide uppercase text-xl md:text-6xl xl:text-4xl font-bold text-white mb-4 drop-shadow-md">
          MATH INSTRUCTION <br />
          <span className='text-red-500 tracking-wide drop-shadow-md'>YOU CAN RELY ON</span>
        </h1>

        <p className="text-white  text-lg md:text-xl mb-6  drop-shadow-md">
          Interactive, personalized sessions tailored to you
        </p>

        <motion.button
          onClick={() => {
            const el = document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
        >
          Schedule Free Trial
        </motion.button>
      </motion.div>
    </section>
  );
}
