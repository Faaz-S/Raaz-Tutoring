import React, { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  { question: 'What is 12 × 7?', options: ['84','72','94','64'], answer: '84' },
  { question: 'Solve 2x + 3 = 11', options: ['4','3','5','6'], answer: '4' }
];

export default function InteractiveQuiz() {
  const [idx,setIdx]=useState(0),[sel,setSel]=useState(''),[fb,setFb]=useState('');
  const q=questions[idx];
  const check=o=>{setSel(o);setFb(o===q.answer?'Correct!':'Try again.');};
  const next=()=>{setSel('');setFb('');setIdx((idx+1)%questions.length);};

  return (
    <motion.div className="max-w-md mx-auto bg-white dark:bg-bgDark p-6 rounded-lg shadow-lg"
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
    >
      <h3 className="font-display text-xl mb-4">Quick Quiz</h3>
      <p className="mb-4">{q.question}</p>
      <div className="space-y-2 mb-4">
        {q.options.map(o=>(
          <button key={o} onClick={()=>check(o)} className={`w-full text-left px-4 py-2 rounded ${sel? sel===q.answer? 'bg-green-200':'bg-red-200':'bg-gray-100 hover:bg-gray-200'}`}>{o}</button>
        ))}
      </div>
      {fb && <p className="mb-4 font-medium">{fb}</p>}
      <button onClick={next} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">Next</button>
    </motion.div>
  );
}