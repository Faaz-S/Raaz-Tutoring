import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import logo from '/images/logo.png';

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0d0d] to-[#1a1a1a]">
      {/* Large Video on Right Half (full width preserved) */}
      <div className="absolute bottom-0 right-0 w-[55%] h-[90%] z-0 overflow-hidden">
  <video
    className="w-full h-full object-contain"
    autoPlay
    loop
    muted
    playsInline
    src="/videos/sine.mp4"
  />
</div>

      {/* Centered Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16 max-w-2xl"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={logo}
          alt="Raaz Tutoring Logo"
          className="w-48 md:w-56 lg:w-64 h-auto mb-8"
        />

        <h1 className="font-display text-5xl md:text-6xl xl:text-4xl font-bold text-white mb-4 drop-shadow-md">
          MATH INSTRUCTION <br />
          <span className='text-red-500 drop-shadow-md'>YOU CAN RELY ON</span>
        </h1>

        <p className="text-accent text-lg md:text-xl mb-6 text-white drop-shadow-md">
          Interactive, personalized sessions tailored to you
        </p>

        <motion.button
          onClick={() => {
            const el = document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-secondary text-white px-8 py-3 rounded-full font-semibold shadow-lg"
        >
          Schedule Free Trial
        </motion.button>
      </motion.div>
    </section>
  );
}
