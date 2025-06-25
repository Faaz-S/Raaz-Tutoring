import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TopicQuiz from '../components/TopicQuiz';

const TOPICS_TABLE = [
  { title: 'Linear Algebra', items: ['Vectors', 'Matrices', 'Systems of Equations'] },
  { title: 'Triangles', items: ['Properties', 'Similar Triangles', 'Pythagorean Theorem'] },
  { title: 'Statistics', items: ['Mean/Median/Mode', 'Probability', 'Data Representation'] },
  { title: 'Exponents', items: ['Laws of Exponents', 'Scientific Notation', 'Radicals'] },
  { title: 'Pre-Algebra', items: ['Integers', 'Rational Numbers', 'Variables', 'Expressions', 'Equations'] },
  { title: 'Basic Algebra', items: ['Linear Equations', 'Inequalities', 'Graphing', 'Functions'] },
  { title: 'Geometry Fundamentals', items: ['Angles', 'Triangles', 'Quadrilaterals', 'Basic Proofs'] },
  { title: 'Data Analysis & Statistics', items: ['Data Collection', 'Representation', 'Basic Probability'] },
  { title: 'Number Theory', items: ['Factors', 'Multiples', 'Prime Numbers', 'Divisibility Rules'] },
  { title: 'Proportional Relationships', items: ['Ratios', 'Proportions', 'Percent Applications'] },
  { title: 'Measurement & Dimension', items: ['Area', 'Volume', 'Surface Area', 'Unit Conversions'] },
  { title: 'Problem-Solving Strategies', items: ['Word Problems', 'Logical Reasoning', 'Math Modeling'] }
];

const FEATURES = [
  { icon: '🖥️', title: 'Interactive Whiteboards', desc: 'Real-time drawing & problem-solving, just like a live classroom.' },
  { icon: '📊', title: 'Math Software', desc: 'Dynamic tools to visualize concepts and make algebra engaging.' },
  { icon: '🎮', title: 'Hands-on Activities', desc: 'Quizzes that make practice fun.' },
  { icon: '⚙️', title: 'Personalized Pacing', desc: 'Structured lessons flex to each student’s speed.' }
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Grades79() {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <motion.div
      className="mx-auto px-8 py-16 max-w-6xl prose prose-lg dark:prose-invert"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Overview */}
      <motion.section variants={item} className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-12">
        <h2 className="text-3xl font-bold mb-4">Overview</h2>
        <p>At Raaz, we specialize in building strong mathematical foundations during these pivotal middle school years. Our personalized online approach helps students transition from basic arithmetic to more advanced concepts with confidence. We focus on developing critical thinking skills while ensuring students master the core concepts they'll need for high school success.</p>
      </motion.section>

      {/* Topics Table as Cards */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Some of the Math Topics We Cover</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS_TABLE.map((topic, idx) => (
            <div key={idx} className="bg-white border-2 border-blue-500 rounded-lg p-4 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2 flex items-center"><span className="mr-2">🔖</span>{topic.title}</h3>
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
            'Build confidence tackling increasingly complex mathematical concepts',
            'Develop strong problem-solving skills that extend beyond the classroom',
            'Master foundational concepts essential for high school mathematics',
            'Improve test scores and classroom performance',
            'Learn to approach math with curiosity rather than anxiety',
            'Gain the tools to become an independent mathematical thinker'
          ].map((outcome, i) => (
            <li key={i} className="flex items-start space-x-2 bg-yellow-50 p-4 rounded-lg">
              <span className="text-green-600 text-2xl">✅</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Tutoring Approach */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Our Tutoring Approach</h2>
        <div className="space-y-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
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
      <motion.section variants={item} className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Pricing</h2>
        <div className="inline-block bg-orange-500 text-white p-6 rounded-lg shadow-md w-full">
          <p className="text-2xl font-semibold">Starting at <span className="text-4xl">$45/hr</span></p>
          <p className="mt-2">Flexible packages available</p>
        </div>
      </motion.section>

      {/* Existing Quiz Section */}
      <motion.section variants={item} className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Pick a Topic for a Quick Quiz</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {['Linear Algebra','Triangles','Statistics','Exponents'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-4 py-2 rounded-full border-2 ${selectedTopic===t? 'bg-blue-500 text-white':'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'}`}
            >{t}</button>
          ))}
        </div>
        {TOPICS_TABLE.filter(t => ['Linear Algebra','Triangles','Statistics','Exponents'].includes(t.title)).map(t => (
          <div key={t.title} className={selectedTopic===t.title? '':'hidden'}>
            <TopicQuiz topic={t.title} />
          </div>
        ))}
        {!selectedTopic && <p className="text-gray-500">Select a topic above to start.</p>}
      </motion.section>
    </motion.div>
  );
}
