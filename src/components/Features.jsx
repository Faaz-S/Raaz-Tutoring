import React from 'react';

function Features() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Our Tutoring Services</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-cyan-400/50">
            <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
            <p>Customized lesson plans to suit each student's learning style and pace.</p>
          </div>
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(244,114,182,0.5)] hover:shadow-pink-400/50">
            <h3 className="text-xl font-semibold mb-2">Experienced Tutors</h3>
            <p>Our tutors are subject-matter experts with years of teaching experience.</p>
          </div>
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] hover:shadow-green-400/50">
            <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
            <p>Book sessions at convenient times with our easy scheduling system.</p>
          </div>
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:shadow-yellow-400/50">
            <h3 className="text-xl font-semibold mb-2">Easily Accessible</h3>
            <p>All sessions will be held through Google meet. Laptop is recommended.</p>
          </div>
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(196,181,253,0.5)] hover:shadow-purple-400/50">
            <h3 className="text-xl font-semibold mb-2">Mock Tests</h3>
            <p>Now increase your confidence through plenty of sample tests.</p>
          </div>
          <div className="p-6 border rounded-lg transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.5)] hover:shadow-blue-400/50">
            <h3 className="text-xl font-semibold mb-2">Specialized Test Preparation</h3>
            <p>We have specific teaching style and material for AP/IB courses.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;  