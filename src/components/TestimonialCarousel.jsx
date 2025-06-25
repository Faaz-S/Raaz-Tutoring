import React, { useState, useEffect, useRef } from 'react';

const testimonialData = [
  {
    name: 'Logan',
    feedback: "When I started with Raaz, my grades were near failing. Since then my grades have improved so much that I've made the honor roll. Their teaching style has been really helpful, especially since I'm a student-athlete and don't have as much time to focus on academics. Being able to have someone like Faaz  who caters to my learning ability is very beneficial.",
    image: '/images/Logan.jpg',
  },
  {
    name: 'Erika',
    feedback: 'Raaz has helped me with my math journey through grade 11 and 12. My tutor helped me to realize my potential through his patience and understanding of my learning needs. Since joining Raaz, my grades have improved.',
    image: '/images/Erika.jpg',
  },
  {
    name: 'Aidan',
    feedback: 'I have been tutored by Faaz for two years and I can say with complete certainty that he is the only thing keeping my math grade alive. One thing I’ve liked the most is how he isn’t trying to simply relay information, he’s trying to make it understandable and he uses multiple methods of explanation to do so. I honestly wouldn’t consider going to any other tutor cause there is no way anybody else could keep me engaged in the same way.',
    image: '/images/Aidan.jpg',
  },
];

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef();

  const startAutoSwipe = () => {
    intervalRef.current = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % testimonialData.length);
    }, 10000);
  };

  useEffect(() => {
    startAutoSwipe();
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleManualNav = (direction) => {
    clearInterval(intervalRef.current);
    if (direction === 'prev') {
      setIndex((prevIndex) => (prevIndex - 1 + testimonialData.length) % testimonialData.length);
    } else {
      setIndex((prevIndex) => (prevIndex + 1) % testimonialData.length);
    }
    startAutoSwipe();
  };

  const { name, feedback, image } = testimonialData[index];

  return (
    <section className="py-16 bg-[#3B3B3B] text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Hear It From the Students Themselves</h2>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative">

          {/* Left arrow */}
          <button
            onClick={() => handleManualNav('prev')}
            className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-transparent text-white text-3xl px-2 hover:text-orange-400"
          >
            ◀
          </button>

          {/* Image */}
          <img
            src={image}
            alt={name}
            className="w-48 h-48 md:w-56 md:h-56  object-cover border-4 rounded-lg"
          />

          {/* Feedback box */}
          <div className="flex-1 bg-white bg-opacity-0 text-white p-6 rounded-lg border border-white/20 backdrop-blur-md shadow-inner">
            <p className="italic mb-4 text-lg leading-relaxed">"{feedback}"</p>
            <p className="font-semibold text-right mt-4">- {name}</p>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => handleManualNav('next')}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 bg-transparent text-white text-3xl px-2 hover:text-orange-400"
          >
            ▶
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {testimonialData.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                i === index ? 'bg-orange-500 w-12' : 'bg-white/30'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;

