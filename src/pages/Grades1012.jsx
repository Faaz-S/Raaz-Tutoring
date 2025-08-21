// src/pages/Grades1012.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TopicQuiz from '../components/TopicQuiz';
import { Helmet } from 'react-helmet';

// Topics displayed in "Topics We Cover" section, including extra ones (no quizzes for extras)
const TOPICS_DISPLAY = [
  { title: 'Quadratics',    items: ['Factoring', 'Parabolas', 'Quadratic Formula'] },
  { title: 'Trigonometry',  items: ['Sine/Cosine/Tangent', 'Unit Circle', 'Identities'] },
  { title: 'Calculus',      items: ['Limits', 'Derivatives', 'Integrals'] },
  { title: 'Logarithms',    items: ['Log Laws', 'Change of Base', 'Graphing Logs'] },
  // Extra topics (no quiz)
  { title: 'Rational Functions', items: ['Asymptotes', 'Domain & Range', 'Graphing'] },
  { title: 'Transformations',     items: ['Translations', 'Reflections', 'Dilations'] },
  { title: 'Polynomials',         items: ['Addition/Subtraction', 'Degree & Leading Coefficient', 'Zeros'] },
  { title: 'Exponents',           items: ['Laws of Exponents', 'Scientific Notation', 'Fractional Exponents'] },
  { title: 'Permutations & Combinations', items: ['Factorial', 'nPr', 'Binomial Theorem'] },
  
];

// Topics that have quizzes
const QUIZ_TOPICS = ['Quadratics', 'Trigonometry', 'Calculus', 'Logarithms', 'AP Calculus'];

const FEATURES = [
  { icon: '🖥️', title: 'Interactive Whiteboards', desc: 'Real-time drawing & problem-solving, just like a live classroom.' },
  { icon: '📊', title: 'Math Software', desc: 'Dynamic tools to visualize advanced concepts.' },
  { icon: '🎮', title: 'Hands-on Activities', desc: 'Quizzes, graphing challenges and modeling tasks.' },
  { icon: '⚙️', title: 'Personalized Pacing', desc: 'Structured yet flexible lessons tailored to you.' }
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Grades1012() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <motion.div
      className="mx-auto px-8 py-16 max-w-6xl prose prose-lg dark:prose-invert"
      variants={container}
      initial="hidden"
      animate="show"
    >
     

<Helmet>
  <title>Grades 10–12 Math Tutoring | AP/IB Help | Raaz Tutoring</title>
  <meta name="description" content="High school math tutoring for Grades 10–12. Boost your confidence in calculus, trig, and algebra. AP and IB support available." />
  <meta name="keywords" content="grade 11 math help, grade 12 math tutoring, AP math tutor, IB math, high school math Canada, Raaz Tutoring grades 10-12" />
  <meta name="author" content="Raaz Tutoring" />
  <link rel="canonical" href="https://raaz-tutoring.vercel.app/grades-10-12" />
</Helmet>

      {/* Overview */}
      <motion.section variants={item} className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-12">
        <h2 className="text-3xl font-bold mb-4">Overview</h2>
        <p>
          In Grades 10–12, students tackle deeper algebra, trigonometry, and introductory calculus.
          Our flexible, student-centered approach adapts each lesson to your pace and ambitions—
          whether preparing for AP/IB exams, mastering high-school curriculum, or exploring advanced topics.
        </p>
      </motion.section>

      {/* Topics We Cover */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Some of the Math Topics We Cover</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS_DISPLAY.map((topic, idx) => (
            <div key={idx} className="bg-white border-2 border-green-500 rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="mr-2">📘</span>{topic.title}
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {topic.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Learning Outcomes */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Learning Outcomes</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            'Confidently solve quadratic and trigonometric equations',
            'Understand the fundamental concepts of limits and derivatives',
            'Apply logarithmic and exponential relationships in real-world contexts',
            'Strengthen analytical and problem-solving skills for AP/IB exams',
            'Visualize functions and graphs using technology tools',
            'Develop independent study strategies for higher-level math'
          ].map((o,i) => (
            <li key={i} className="flex items-start space-x-2 bg-yellow-50 p-4 rounded-lg">
              <span className="text-green-600 text-2xl">✅</span><span>{o}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Our Tutoring Approach */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Our Tutoring Approach</h2>
        <div className="space-y-6">
          {FEATURES.map((f,i) => (
            <div key={i} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <div className="text-3xl">{f.icon}</div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section variants={item} className="mb-12 text-center w-full max-w-4xl mx-auto">
       
        <div className="bg-orange-500 text-white px-8 py-6 rounded-xl shadow-lg border-l-8 border-white transition duration-300 hover:scale-[1.02] mx-auto">
          <p className="text-2xl font-semibold">
            Starting at <span className="text-4xl font-bold">$50/hr</span>
          </p>
          <p className="mt-3 text-lg italic">
            AP/IB specialty packages available
          </p>
        </div>
      </motion.section>

      {/* Quiz Section for core topics only */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Test Your Skills</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {QUIZ_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-4 py-2 rounded-full border-2 ${
                selectedTopic === t
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
              } ${
                t === 'AP Calculus' 
                  ? 'shadow-lg shadow-purple-400/50 border-purple-300 hover:shadow-purple-400/70 transition-shadow duration-300'
                  : ''
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {QUIZ_TOPICS.map(t => (
          <div key={t} className={selectedTopic === t ? '' : 'hidden'}>
            <TopicQuiz topic={t} />
          </div>
        ))}
        {!selectedTopic && <p className="text-gray-500">Select a topic above to begin.</p>}
      </motion.section>
    </motion.div>
  );
}
