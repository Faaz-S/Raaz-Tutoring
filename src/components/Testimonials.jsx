import React, { useState } from 'react';

const testimonialData = [
  {
    name: 'Varun',
    feedback: 'Raaz Tutoring helped my son finally grasp the tricky math concepts he was struggling with. The sessions were engaging and tailored to his learning style, and he’s now much more confident in class!',
  },
  {
    name: 'Ava',
    feedback: 'I’ve always found math stressful, but Raaz Tutoring made it so much easier to understand. The explanations were clear, and they always took time to answer my questions.',
  },
  {
    name: 'Isabelle',
    feedback: 'I’ve tried several tutors before, but none matched the patience and dedication of Raaz Tutoring. My daughter looks forward to her lessons every week!',
  },
  {
    name: 'Khalid',
    feedback: 'Raaz Tutoring turned my grade 10 math grade around! I went from a C to an A in just one semester, and I actually enjoy math now.',
  },
  {
    name: 'Rohan',
    feedback: 'I appreciated how flexible and professional Raaz Tutoring was. They always found ways to fit in sessions around my busy schedule, and the support was amazing.',
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
