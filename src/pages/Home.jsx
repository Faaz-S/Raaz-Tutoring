import Hero from '../components/Hero';
import Features from '../components/Features';
import TestimonialCarousel from '../components/TestimonialCarousel';
import HowItWorksSection from '../components/HowItWorksSection';
import FAQ from '../components/FAQ';
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import React, { useRef, useEffect } from 'react';


export default function Home() {
  

  return (
    <div className="text-gray-800">
      {/* Meta Tags for SEO */}
      

      <Helmet>
        <title>Raaz Tutoring | Personalized Math Tutoring (Grades 7–12)</title>
        <meta name="description" content="Expert online math tutoring for Grades 7-12. One-on-one AP, IB, and school curriculum help to boost confidence and scores." />
        <meta name="keywords" content="Raaz Tutoring, math tutoring, high school math, AP math, IB math, grade 7 math, grade 12 math, online tutoring Canada" />
        <meta name="author" content="Raaz Tutoring" />
        <link rel="canonical" href="https://raaz-tutoring.vercel.app/" />
      </Helmet>

      {/* Hero Section with anchor link */}
      <div className='bg-bgDark'>
        <Hero />
      </div>

      {/* Intro Section with styled buttons and heading */}
      <section className="relative bg-white overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row items-center px-4 py-12 lg:py-24">
          <div className="lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4">Your Success Starts Here</h2>
            <p className="text-base sm:text-lg mb-6">
              At Raaz, we turn confusion into clarity with one-on-one sessions tailored just for you.
              Dive into interactive lessons, instant feedback, and real results.
              <br />
              <span className='font-medium text-teal-900'>More Than Just Math — We Build Confidence</span>
            </p>
            <p className="mt-6 text-lg sm:text-xl font-bold text-blue-900 tracking-wide">Explore Our Programs Here</p>
            <div className="mt-6 space-y-4 flex flex-col w-full max-w-xs mx-auto lg:mx-0 lg:w-64">
              <NavLink
                to="/grades-7-9"
                className="border-4 border-blue-900 text-blue-900 px-4 py-3 rounded-lg font-semibold text-base sm:text-lg transition hover:bg-orange-500 hover:text-white text-center"
              >
                Grades 7-9
              </NavLink>
              <NavLink
                to="/grades-10-12"
                className="border-4 border-blue-900 text-blue-900 px-4 py-3 rounded-lg font-semibold text-base sm:text-lg transition hover:bg-orange-500 hover:text-white text-center"
              >
                Grades 10-12
              </NavLink>
            </div>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="hidden lg:block absolute -left-16 -top-16 w-62 h-62 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
            <img
              src="images/student-studying.jpg"
              alt="Tutoring illustration"
              className="relative rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <Features />
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-start gap-8">
          <div className="lg:w-1/2 space-y-6 order-2 lg:order-1">
            <img
              src="images/FAQ-image.png"
              alt="Students learning"
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Get in Touch</h3>
              <p className="flex items-center mb-2 text-sm sm:text-base">
                <FaPhoneAlt className="text-blue-600 mr-3 flex-shrink-0" />
                <span>+1 (416) 909-2600</span>
              </p>
              <p className="flex items-center text-sm sm:text-base">
                <FaEnvelope className="text-blue-600 mr-3 flex-shrink-0" />
                <span>raaztutoring@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center lg:text-left">Frequently Asked Questions</h2>
            <FAQ />
          </div>
        </div>
      </section>
    </div>
  );
}
