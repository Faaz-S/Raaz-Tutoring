import React from 'react';

const faqs = [
  { q: 'What grades do you tutor?', a: 'We offer tutoring from Grades 7 through 12 [including AP/IB] in math' },
  { q: 'How do I schedule a session?', a: 'Use our contact form or call us directly; we’ll match you with the perfect tutor.' },
  { q: 'Do you offer online tutoring?', a: 'Yes! All sessions are held via online platforms' },
  { q: 'How much does a tutoring session cost?', a: 'Pricing varies depending on the subject and specialization. We also offer discounted bundle packages when you book multiple sessions or group sessions. Please contact us directly for full details.'},
  { q: 'How soon can I start?', a: 'You can get started right away, we pride ourselves on quick response times! Once you fill out the contact form or reach out to us through phone/email, we can typically schedule your first session within 48 hours or less.'},
  { q: 'Do you offer tutoring for AP or IB courses?', a: 'Absolutely. We provide specialized support for both AP and IB students. Please indicate your specific course or curriculum when you reach out via the contact form.'},
  { q: '⁠How do I book a session or get in touch?', a: 'You can fill out our contact form, call or leave a message at 416-909-2600, or email us at sherwanifaaz@gmail.com.' },
  { q: 'Do you offer trial sessions?', a: 'Yes, we offer one free trial session per student. It’s a great way to meet your tutor and experience our approach before committing!' },
  { q: 'How do you measure progress?', a: 'We track milestones each session and share reports with parents or students.' },
  { q: 'How do I pay?', a: 'We accept PayPal or E-transfers' },
  { q: 'How often should I meet with a tutor?', a: "Most students benefit from weekly sessions, but we can create a custom schedule based on your needs. "},
];
export default function FAQ() {
  return (
    <div className="space-y-4">
      {faqs.map((f, i) => (
        <details
          key={i}
          className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
        >
          <summary className="font-semibold cursor-pointer list-none marker:hidden">
            {f.q}
          </summary>
          <p className="mt-2 text-gray-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
