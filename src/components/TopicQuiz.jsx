
import React, { useState } from 'react';

// Define question sets for each topic (Grades 7–9 and 10–12)
const questionSets = {
  'Linear Algebra': [
    { question: 'Vector addition: (2,1) + (1,4) = ?', options: ['(2,4)', '(3,5)', '(3,3)', '(1,3)'], answer: 1 }, // Easy
    { question: 'What is the slope of the line y = 3x + 7?', options: ['7', '3', '1', '10'], answer: 1 }, // Easy
    { question: 'Solve: x + y = 5 and 2x - y = 1. Find x:', options: ['1', '2', '3', '4'], answer: 1 }, // Medium
    { question: 'Find the distance between points (1,2) and (4,6):', options: ['3', '4', '5', '6'], answer: 2 }, // Medium
    { question: 'If vectors u = (2,-1) and v = (3,4), find u · v (dot product):', options: ['5', '2', '7', '11'], answer: 1 } // Hard
  ],
  'Triangles': [
    { question: 'Sum of interior angles in a triangle = ?', options: ['90°', '180°', '270°', '360°'], answer: 1 }, // Easy
    { question: 'In a right triangle, the longest side is called the:', options: ['base', 'height', 'hypotenuse', 'altitude'], answer: 2 }, // Easy
    { question: 'If two angles of a triangle are 60° and 80°, what is the third angle?', options: ['30°', '40°', '50°', '20°'], answer: 1 }, // Medium
    { question: 'A triangle with sides 3, 4, and 5 is:', options: ['scalene', 'isosceles', 'right', 'equilateral'], answer: 2 }, // Medium
    { question: 'In triangle ABC, if angle A = 70° and angle B = 50°, and side a = 8, find side c using the Law of Sines (sin C = sin 60°):', options: ['6.9', '7.4', '8.0', '9.2'], answer: 1 } // Hard
  ],
  'Statistics': [
    { question: 'Mean of [2,4,6,8] = ?', options: ['4', '5', '6', '7'], answer: 1 }, // Easy
    { question: 'Median of [1,3,7] = ?', options: ['1', '3', '7', '5'], answer: 1 }, // Easy
    { question: 'What is the mode of the data set [3, 7, 3, 9, 3, 5]?', options: ['7', '5', '3', '9'], answer: 2 }, // Medium
    { question: 'If you roll a fair six-sided die, what is the probability of rolling a 4?', options: ['1/4', '1/6', '1/3', '1/2'], answer: 1 }, // Medium
    { question: 'A dataset has values [10, 12, 15, 18, 20]. What is the standard deviation? (√((Σ(x-μ)²)/n))', options: ['3.1', '3.7', '4.2', '2.8'], answer: 1 } // Hard
  ],
  'Exponents': [
    { question: '2³ = ?', options: ['6', '8', '9', '4'], answer: 1 }, // Easy
    { question: 'What is 5⁰?', options: ['5', '1', '0', '25'], answer: 1 }, // Easy
    { question: 'Simplify: x² × x³', options: ['x⁵', 'x⁶', 'x¹', '2x⁵'], answer: 0 }, // Medium
    { question: 'What is (3²)³?', options: ['3⁶', '3⁵', '9³', '6³'], answer: 0 }, // Medium
    { question: 'Solve for x: 2^(x+1) = 32', options: ['3', '4', '5', '6'], answer: 1 } // Hard
  ],
  // Grades 10–12 question sets
  'Quadratics': [
    { question: 'What is the standard form of a quadratic equation?', options: ['y = mx + b', 'ax² + bx + c = 0', 'x = -b/2a', 'y = a(x-h)² + k'], answer: 1 }, // Easy
    { question: 'Factor: x² - 9', options: ['(x-3)²', '(x-3)(x+3)', '(x+3)²', 'Cannot be factored'], answer: 1 }, // Easy
    { question: 'Find the vertex of y = x² - 4x + 3:', options: ['(2, -1)', '(4, 3)', '(-2, 1)', '(1, 0)'], answer: 0 }, // Medium
    { question: 'Using the quadratic formula, solve x² - 5x + 6 = 0:', options: ['x = 1, 6', 'x = 2, 3', 'x = -2, -3', 'x = 5, 6'], answer: 1 }, // Medium
    { question: 'For the quadratic y = 2x² - 8x + 6, what is the minimum value?', options: ['-2', '-1', '0', '1'], answer: 0 } // Hard
  ],
  'Trigonometry': [
    { question: 'What is sin(30°)?', options: ['√3/2', '1/2', '√2/2', '1'], answer: 1 }, // Easy
    { question: 'The unit circle has radius:', options: ['2', '1', 'π', '0'], answer: 1 }, // Easy
    { question: 'If cos θ = 3/5, what is sin θ? (assuming θ is in quadrant I)', options: ['4/5', '5/4', '3/4', '5/3'], answer: 0 }, // Medium
    { question: 'What is the period of y = sin(2x)?', options: ['2π', 'π', 'π/2', '4π'], answer: 1 }, // Medium
    { question: 'Solve for θ in [0, 2π): sin θ = -1/2', options: ['7π/6, 11π/6', 'π/6, 5π/6', '2π/3, 4π/3', 'π/3, 2π/3'], answer: 0 } // Hard
  ],
  'Calculus': [
    { question: 'What is the derivative of x²?', options: ['x', '2x', '2', 'x²'], answer: 1 }, // Easy
    { question: 'What is the integral of 3 dx?', options: ['3', '3x', '3x + C', '0'], answer: 2 }, // Easy
    { question: 'Find the limit: lim(x→0) (sin x)/x', options: ['0', '1', '∞', 'undefined'], answer: 1 }, // Medium
    { question: 'What is the derivative of e^x?', options: ['e^x', 'xe^(x-1)', '1', 'x'], answer: 0 }, // Medium
    { question: 'Evaluate the definite integral: ∫₀¹ x² dx', options: ['1/3', '1/2', '1', '2/3'], answer: 0 } // Hard
  ],
  'Logarithms': [
    { question: 'What is log₁₀(100)?', options: ['10', '2', '100', '1'], answer: 1 }, // Easy
    { question: 'What is log₂(8)?', options: ['2', '3', '4', '8'], answer: 1 }, // Easy
    { question: 'Simplify: log(3) + log(4)', options: ['log(7)', 'log(12)', 'log(3/4)', 'log(3) × log(4)'], answer: 1 }, // Medium
    { question: 'Solve for x: log₂(x) = 5', options: ['10', '25', '32', '64'], answer: 2 }, // Medium
    { question: 'If log₂(x) + log₂(y) = 3 and log₂(x) - log₂(y) = 1, find x:', options: ['2', '4', '6', '8'], answer: 1 } // Hard
  ],
  'AP Calculus': [
    { question: 'Find the derivative of f(x) = x²sin(x) using the product rule:', options: ['2x cos(x) + x² sin(x)', '2x sin(x) + x² cos(x)', '2x sin(x) - x² cos(x)', 'x² cos(x) - 2x sin(x)'], answer: 1 }, // Hard
    { question: 'Evaluate ∫₀^π sin²(x) dx using the identity sin²(x) = (1 - cos(2x))/2:', options: ['π', '2π', 'π/2', '0'], answer: 2 }, // Hard
    { question: 'Find the area between y = x² and y = 4 from x = -2 to x = 2:', options: ['16/3', '8/3', '64/3', '32/3'], answer: 3 }, // Hard
    { question: 'If f(x) = ln(x² + 1), find f′′(1) (the second derivative at x = 1):', options: ['0', '-1/2', '1/2', '-1'], answer: 1 }, // Hard
    { question: 'Using L\'Hôpital\'s rule, find lim(x→0) [sin(3x) - 3x]/x³:', options: ['-3/2', '0', '-9/2', '3/2'], answer: 2 } // Hard
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

