import React, { useState } from 'react';

const testimonialData = [
  {
    name: 'Alice Smith',
    feedback: 'Raaz Tutoring helped me improve my grades significantly. The sessions were engaging and effective!',
  },
  {
    name: 'John Doe',
    feedback: 'I loved the personalized approach. The tutors really care and make learning fun!',
  },
  {
    name: 'Emily Johnson',
    feedback: 'Great tutors and flexible schedule. Highly recommend Raaz Tutoring to anyone who wants to excel.',
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);
  const { name, feedback } = testimonialData[index];

  const prevTestimonial = () => {
    setIndex((index - 1 + testimonialData.length) % testimonialData.length);
  };
  const nextTestimonial = () => {
    setIndex((index + 1) % testimonialData.length);
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Testimonials</h2>
        <div className="max-w-xl mx-auto">
          <p className="italic mb-4">"{feedback}"</p>
          <p className="font-semibold">- {name}</p>
          <div className="mt-6 space-x-4">
            <button onClick={prevTestimonial} className="px-4 py-2 bg-blue-600 text-white rounded">Previous</button>
            <button onClick={nextTestimonial} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
