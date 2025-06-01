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
      className="bg-white shadow-md rounded-lg p-6 space-y-4"
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        type="text"
        placeholder="Your Name"
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        type="email"
        placeholder="Your Email"
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        type="tel"
        placeholder="Your Contact Number"
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
      />

      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        rows="4"
        placeholder="Your Message"
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition"
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
