import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Basic phone‐number validation: strip non‐digits, then ensure at least 10 digits
  const isValidPhone = phone => {
    const digitsOnly = phone.replace(/\D/g, ''); 
    return digitsOnly.length >= 10;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('');
    setIsLoading(true);

    // 1. Validate phone number
    if (!isValidPhone(form.phone)) {
      setStatus('Please enter a valid phone number (at least 10 digits).');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_CONTACT_ENDPOINT}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setStatus(
        'Your message has been sent successfully! You will be contacted by a member of our team shortly.'
      );
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('Failed to send message. Please try again later or contact us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      id="contact"
      onSubmit={handleSubmit}
      className="w-full space-y-4"
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        type="text"
        placeholder="Your Name"
        required
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 text-white transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] focus:outline-none"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        type="email"
        placeholder="Your Email"
        required
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 text-white transition-all duration-300 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(244,114,182,0.4)] focus:border-pink-400 focus:shadow-[0_0_15px_rgba(244,114,182,0.4)] focus:outline-none"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        type="tel"
        placeholder="Your Contact Number"
        required
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 text-white transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)] focus:border-green-400 focus:shadow-[0_0_15px_rgba(74,222,128,0.4)] focus:outline-none"
      />

      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        rows="4"
        placeholder="Your Message"
        required
        className="w-full bg-black border border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 text-white transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.4)] focus:outline-none resize-vertical"
      />

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white rounded-md px-4 py-2 transition-all duration-300 flex items-center justify-center ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-secondary hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:border hover:border-red-400'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>

      {status && (
        <p
          className={`text-center ${
            status.startsWith('Please') || status.startsWith('Failed')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
