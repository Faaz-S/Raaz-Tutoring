import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import FAQ from '../components/FAQ';
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";


export default function Home() {
  return (
    <div className="text-gray-800">
      {/* Existing Welcome Hero */}
      <Hero />

      {/* New Intro Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row items-center px-4 py-12 lg:py-24">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-4xl font-extrabold mb-4">Your Success Starts Here</h2>
            <p className="text-lg mb-6">
              At Raaz Tutoring, we turn confusion into clarity with one-on-one sessions tailored just for you.
              Dive into interactive lessons, instant feedback, and real results.
            </p>
            <a
              href="#contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started
            </a>
          </div>
          <div className="lg:w-1/2 relative">
            {/* Decorative blob behind image */}
            <div
              className="absolute -left-16 -top-16 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
            />
            <img
              src="/public/images/student-studying.jpg"
              alt="Tutoring illustration"
              className="relative rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features (alt background) */}
      <section className="bg-gray-50 py-16">
        <Features />
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <Testimonials />
      </section>


      {/* Contact Form (alt background) */}
      <section className="bg-transparent py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
          <div className="mx-auto max-w-lg">
            <Contact />
          </div>
        </div>
      </section>

      {/* FAQ  */}
         {/* FAQ with image + contact info */}
      <section id="faq" className="bg-white py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Column: Image + Contact Info */}
          <div className="lg:w-1/2 space-y-6">
            <img
              src="/public/images/FAQ-image.png"
              alt="Students learning"
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
              <p className="flex items-center mb-2">
                <FaPhoneAlt className="text-blue-600 mr-3" />
                <span>+1 (416) 909-2600</span>
              </p>
              <p className="flex items-center">
                <FaEnvelope className="text-blue-600 mr-3" />
                <span>raaztutoring@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <FAQ />
          </div>
        </div>
      </section>

    </div>
  );
}
