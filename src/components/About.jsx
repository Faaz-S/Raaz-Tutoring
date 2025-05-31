// src/components/About.jsx
import React from 'react';
import { motion } from 'framer-motion';


export default function About() {
  const sections = [
    {
      key: 'our-story',
      title: 'Our Story',
      content: [
        `Raaz Tutoring was born from one of those lightbulb moments that changes everything. Picture this: 
        I'm hunched over a math problem with my brother, who's been staring at the same equation for what 
        feels like an eternity. After 30 minutes of back-and-forth, something 
        magical happened—his face lit up with that "aha!" expression that math teachers live for.`,
        `That moment wasn't just about solving an equation; it was about discovering my purpose. While pursuing 
        Computer Science, I always had a thing for numbers 
        (yes, I was that person who actually enjoyed calculus). But witnessing the transformation from confusion 
        to confidence in my brother's eyes? That was the real variable that changed my equation. And just like 
        that, Raaz Tutoring began its journey.`
      ],
      photos: [
        { src: '/public/images/Faaz_new.jpg', caption: 'Faaz Sherwani (Co-Founder)' },
        { src: '/public/images/Rhea.jpg', caption: 'Rhea Misra (Co-Founder)' }
      ]
    },
    
    {
      key: 'our-approach',
      title: 'Our Approach: Less Talk, More Action',
      content: [
        `Let's be honest—nobody wants to sit through an hour-long lecture on the theoretical underpinnings 
        of quadratic equations. Our approach is refreshingly different:`
      ],
      list: [
        {
          label: 'Foundation First',
          desc: `We start with just enough theory to build a solid foundation—the mathematical equivalent 
          of knowing the rules before playing the game.`
        },
        {
          label: 'Problem-Based Learning',
          desc: `Then we dive straight into carefully selected problems that reinforce those concepts. 
          No abstract theories floating in space; instead, you'll see the direct application of what you've just learned.`
        },
        {
          label: 'Strategic Progression',
          desc: `As confidence builds, we tackle increasingly complex problems in a structured sequence. 
          No random difficulty spikes here—just a thoughtfully designed path from "I can’t" to "I got this."`
        },
        {
          label: 'Your Problems, Our Priority',
          desc: `Bring your homework, test prep questions, or that one topic that makes you want to hide under your desk. 
          Our sessions adapt to what YOU need, not what page the textbook says we should be on.`
        },
        {
          label: 'Curriculum Versatility',
          desc: `Whether you're in grades 7–9, tackling the challenges of grades 10–12, or navigating 
          the specialized demands of AP and IB curricula, our methods adapt to your specific program requirements.`
        }
      ]
    },
    {
      key: 'our-mission',
      title: 'Our Mission',
      content: [
        `At Raaz Tutoring, we're on a mission to transform mathematics from "that impossible subject" 
        into "that subject I actually understand now." We're committed to:`
      ],
      list: [
        `Creating "I get it now!" moments that build lasting confidence`,
        `Developing problem-solving skills that work far beyond the math classroom`,
        `Proving that math can be (dare we say it?) enjoyable with the right approach`,
        `Building a personalized learning experience that respects your individual pace and style`
      ]
    },
    {
      key: 'why-choose-us',
      title: 'Why Choose Us?',
      content: [
        `When you join the Raaz Tutoring family, you're not just getting a tutor who can solve for x—you're 
        gaining a dedicated partner who invests in your success. Our tutors celebrate your progress as if it 
        were their own (because in many ways, it is). We measure our success not by how many formulas you've 
        memorized, but by how confidently you approach problems that once seemed impossible.`,
        `Ready to rewrite your math story? Let's solve this equation together. 
        `,
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const sectionAnim = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0 }
  };
  const imgAnim = {
    hidden: { opacity: 0, scale: 0.9 },
    show:   { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      className="relative prose prose-lg dark:prose-invert mx-auto px-8 py-24 max-w-6xl"
      variants={container}
      initial="hidden"
      animate="show"
    >
      

      <h1 className="text-5xl font-extrabold text-center mb-16">About Raaz Tutoring</h1>

      {sections.map(sec => (
        <motion.section key={sec.key} variants={sectionAnim} className="mb-20">
          <h2 className="text-3xl font-bold mb-6">{sec.title}</h2>

          {sec.content.map((p, i) => (
            <p key={i} className="mb-6 leading-relaxed">{p}</p>
          ))}
          {sec.photos && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {sec.photos.map((photo, i) => (
      <motion.div
        key={i}
        className="flex flex-col items-center bg-white rounded-2xl shadow-md overflow-hidden"
        variants={imgAnim}
        transition={{ duration: 0.6, delay: i * 0.2 }}
      >
        <div className="w-full h-60 md:h-80 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <img
            src={photo.src}
            alt={`${sec.title} ${i + 1}`}
            className="object-contain max-h-full max-w-full"
          />
        </div>
        <p className="mt-3 pb-4 text-center text-sm font-medium text-gray-700">
          {photo.caption}
        </p>
      </motion.div>
    ))}
  </div>
)}
          {/* Any lists */}
          {sec.list && (
            <ul className="list-disc list-inside space-y-4 ml-6">
              {sec.list.map((li, i) => (
                <li key={i} className="leading-snug">
                  {typeof li === 'string'
                    ? li
                    : <>
                        <span className="font-semibold">{li.label}:</span> {li.desc}
                      </>
                  }
                </li>
              ))}
            </ul>
          )}

          {/* Contact link at end of last section */}
          {sec.key === 'why-choose-us' && (
            <p className="mt-8 text-center">
              <a href="/" className="text-blue-600 hover:underline font-semibold inline-flex items-center">
                <span>👉</span>
              
                <span className="ml-2">Contact us today to schedule your first session.</span>
               
              </a>
            </p>
          )}
        </motion.section>
      ))}
    </motion.div>
  );
}