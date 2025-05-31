
import React, { useState } from 'react';

// Define question sets for each topic (Grades 7–9 and 10–12)
const questionSets = {
  'Linear Algebra': [
    { question: 'Vector addition: (2,1) + (1,4) = ?', options: ['(3,5)', '(1,5)', '(3,4)', '(2,3)'], answer: 0 },
    { question: 'Which line has a slope of 2. A: 0.5y = x + 2 B: y = 3x - 2?', options: ['A', 'B', 'Both', 'Neither'], answer: 0 },
    { question: 'Solve: x + y = 5 and 2x - y = 1. x = ?', options: ['1', '2', '3', '4'], answer: 2 },
    { question: 'Magnitude of vector v = (3,4) is:', options: ['5', '7', '1', '4'], answer: 0 },
    { question: 'Find the distance between (5,5) and (2,1)', options: ['6', '5', '3', '2'], answer: 1 }
  ],
  'Triangles': [
    { question: 'Sum of interior angles in a triangle = ?', options: ['180°', '90°', '360°', '270°'], answer: 0 },
    { question: 'Pythagorean theorem: a² + b² = ?', options: ['2c', 'ab', 'a+b', 'c²'], answer: 3 },
    { question: 'Similarity: corresponding sides are ?', options: ['Equal','Proportional',  'Perpendicular', 'Complementary'], answer: 1 },
    { question: 'Isosceles triangle has how many equal sides?', options: ['2', '3', '1', '0'], answer: 0 },
    { question: 'Area formula: ½ × base × ?', options: ['height', 'angle', 'sum of sides', 'perimeter'], answer: 0 }
  ],
  'Statistics': [
    { question: 'Mean of [2,4,6,8] = ?', options: ['10', '4', '5', '3'], answer: 3 },
    { question: 'Median of [1,3,7] = ?', options: ['3', '7', '5', '1'], answer: 0 },
    { question: 'Probability of heads in fair coin = ?', options: ['1/7', '1/3', '1/4', '1/2'], answer: 3 },
    { question: 'Mode of [2,2,3,4] = ?', options: ['2', '3', '4', 'None'], answer: 0 },
    { question: 'Range of [5,2,9] = max - min = ?', options: ['4', '7', '5', '9'], answer: 1 }
  ],
  'Exponents': [
    { question: '2³ = ?', options: ['8', '6', '4', '9'], answer: 0 },
    { question: 'x² × x³ = x^?', options: ['5', '6', '1', '2'], answer: 0 },
    { question: '(a^m)/(a^n) = a^(m-n). True or False?', options: ['True', 'False', 'Sometimes', 'Never'], answer: 0 },
    { question: '√9 (9^(1/2)) = ?', options: ['3', '9', '1', '4'], answer: 0 },
    { question: '(2²)³ = ?', options: ['64', '8', '16', '32'], answer: 0 }
  ],
  // Grades 10–12 question sets
  'Quadratics': [
    { question: 'Roots of x² - 5x + 6 = 0 are?', options: ['2 and 3', '1 and 6', '2 and -3', '3 and -2'], answer: 0 },
    { question: 'Vertex form: y = a(x-h)² + k, h and k locate ?', options: ['Vertex', 'Focus', 'Axis', 'Intercept'], answer: 0 },
    { question: 'Axis of symmetry of x² - 4x + 3 is x = ?', options: ['2', '4', '3', '1'], answer: 0 },
    { question: 'Discriminant b² - 4ac positive means ?', options: ['2 real roots', 'No real roots', '1 root', 'Infinite roots'], answer: 0 },
    { question: 'Factor: x² - 9 = ?', options: ['(x-3)(x+3)', 'x²+9', '(x+3)(x+3)', '(x-9)'], answer: 0 }
  ],
  'Trigonometry': [
    { question: 'sin²θ + cos²θ = ?', options: ['1', '0', 'sinθ', 'cosθ'], answer: 0 },
    { question: 'tanθ = ?', options: ['sinθ/cosθ', 'cosθ/sinθ', '1/sinθ', '1/cosθ'], answer: 0 },
    { question: 'Unit circle radius = ?', options: ['1', 'π', '0', '2'], answer: 0 },
    { question: 'sin(30°) = ?', options: ['1/2', '√2/2', '√3/2', '1'], answer: 0 },
    { question: 'cos(60°) = ?', options: ['1/2', '√2/2', '√3/2', '0'], answer: 0 }
  ],
  'Calculus': [
    { question: 'Limit of (x²-1)/(x-1) as x→1 = ?', options: ['2', '0', '1', 'Infinity'], answer: 0 },
    { question: 'Derivative of x² = ?', options: ['2x', 'x', 'x²', '1'], answer: 0 },
    { question: 'Integral of 2x dx = ?', options: ['x² + C', '2x + C', 'x + C', 'x²'], answer: 0 },
    { question: "d/dx[sin x] = ?", options: ['cos x', '-sin x', 'sin x', '-cos x'], answer: 0 },
    { question: 'Find derivative of 3x³ = ?', options: ['9x²', 'x²', '3x²', '3x'], answer: 0 }
  ],
  'Logarithms': [
    { question: 'logₐ(a^x) = ?', options: ['x', 'a', '1', '0'], answer: 0 },
    { question: 'Change of base: log_b(a) = ?', options: ['ln a / ln b', 'ln b / ln a', 'a/b', 'b/a'], answer: 0 },
    { question: 'log(100) base 10 = ?', options: ['2', '10', '100', '0'], answer: 0 },
    { question: 'Solve: log x = 2, x = ?', options: ['100', '10', '2', '4'], answer: 0 },
    { question: 'Property: log(ab) = ?', options: ['log a + log b', 'log a - log b', 'log(ab)', 'a log b'], answer: 0 }
  ]
};

export default function TopicQuiz({ topic }) {
  const questions = questionSets[topic] || [];
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [step, setStep] = useState(0);

  const current = questions[step];
  const firstNull = answers.findIndex(a => a === null);
  const maxStep = firstNull === -1 ? questions.length - 1 : firstNull;

  const handleSelect = idx => {
    if (answers[step] !== null) return;
    const isCorrect = idx === current.answer;
    setAnswers(prev => { const c = [...prev]; c[step] = isCorrect; return c; });
  };

  const handleNext = () => {
    if (step < questions.length - 1) setStep(s => s + 1);
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Cheatsheet placeholder
      <div className="w-full h-60 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">[Cheatsheet for {topic}]</span>
      </div> */}

      {/* Progress bar */}
      <div className="flex space-x-2">
        {questions.map((_, i) => {
          let cls = 'bg-gray-300';
          if (answers[i] === true) cls = 'bg-green-500';
          else if (answers[i] === false) cls = 'bg-red-500';
          else if (i === step) cls = 'bg-blue-600';
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded cursor-pointer ${cls}`}
              onClick={() => i <= maxStep && setStep(i)}
            />
          );
        })}
      </div>

      {/* Question card */}
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="font-semibold mb-4 whitespace-pre-line">{current.question}</p>
        <div className="grid grid-cols-2 gap-4">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`p-3 border rounded ${
                answers[step] === null
                  ? 'hover:bg-gray-100'
                  : idx === current.answer
                    ? 'bg-green-100 border-green-400'
                    : answers[step] === false && idx !== current.answer
                      ? 'bg-red-100 border-red-400'
                      : ''
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {answers[step] !== null && (
          <div className="mt-4 text-lg font-medium">
            {answers[step] ? 'Correct!' : 'Incorrect'}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={answers[step] === null || step === questions.length - 1}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}

