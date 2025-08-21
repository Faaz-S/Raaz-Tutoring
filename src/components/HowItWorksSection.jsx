import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaRocket, FaClipboardCheck, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { scrollToContactForm } from '../utils/ScrollToContact';

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Step 1 */}
          <div className="bg-blue-100 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:border hover:border-cyan-400">
            <div className="flex justify-center items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-lg">1</div>
            </div>
            <FaCalendarAlt className="text-4xl text-blue-700 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Fill Out the Contact Form</h3>
            <p className="mb-4 text-gray-700">
              or call us at <span className="font-semibold">+1 (416) 909-2600</span><br />
              or email <span className="font-semibold">raaztutoring@gmail.com</span>
            </p>
            <button
  onClick={scrollToContactForm}
  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
>
  Contact Us
</button>
          </div>

          {/* Step 2 */}
          <div className="bg-red-100 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(244,114,182,0.6)] hover:border hover:border-pink-400">
            <div className="flex justify-center items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-lg">2</div>
            </div>
            <FaClipboardCheck className="text-4xl text-red-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Set Up a Free Trial</h3>
            <p className="text-gray-700">
              We'll reach out to schedule a free session where we'll discuss your needs, goals,
              and any questions you might have.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-yellow-100 rounded-lg shadow p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(74,222,128,0.6)] hover:border hover:border-green-400">
            <div className="flex justify-center items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-lg">3</div>
            </div>
            <FaRocket className="text-4xl text-yellow-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Personalized Plan & Schedule</h3>
            <p className="text-gray-700">
              We'll build a personalized learning plan and finalize your preferred timing & frequency for weekly sessions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
