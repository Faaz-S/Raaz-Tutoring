import React from 'react';

export default function Schedule() {
  return (
    <section id="schedule" className="py-16 bg-bgLight dark:bg-[#2c3e50]">
      <h2 className="text-3xl font-display text-primary text-center mb-8">Book a Session</h2>
      <div className="container mx-auto px-4">
        <iframe
          src="https://calendar.google.com/calendar/selfsched?sstoken=YOUR_GOOGLE_APPOINTMENT_PAGE"
          className="w-full aspect-video rounded-lg shadow-lg"
          allowFullScreen
        />
      </div>
    </section>
  );
}