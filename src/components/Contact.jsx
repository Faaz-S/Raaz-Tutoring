import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');
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

    // 1. Validate phone number
    if (!isValidPhone(form.phone)) {
      setStatus('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setStatus('Sending…');

    try {
      const res = await fetch(
        'https://ejvcjiyn1i.execute-api.us-east-2.amazonaws.com/Prod/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      setStatus(
        'Your message has been sent successfully! You will be contacted by a member of our team shortly.'
      );
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('Failed to send. Please try again later.');
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
        className="w-full bg-secondary text-white rounded-md px-4 py-2 transition-all duration-300 hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:border hover:border-red-400"
      >
        Send Message
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
