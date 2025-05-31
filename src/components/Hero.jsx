import React from 'react';

function Hero() {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Raaz Tutoring</h1>
        <p className="text-lg md:text-2xl mb-8">Empowering students to achieve success in Mathematics</p>
        <a href="#contact" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
          Contact Us
        </a>
      </div>
    </section>
  );
}

export default Hero;
