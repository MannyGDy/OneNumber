"use client"
import React, { useState } from 'react';

// Dummy FAQ data
const faqData = [
  {
    question: 'What is OneNumber?',
    answer: 'OneNumber is a virtual phone number service designed to help businesses manage communications efficiently across multiple devices and platforms.'
  },
  {
    question: 'How do I sign up for OneNumber?',
    answer: 'You can sign up by clicking the "Get Started" button on our website, choosing a plan that suits your business needs, and following the registration process.'
  },
  {
    question: 'Can I use OneNumber on multiple devices?',
    answer: 'Yes, OneNumber is designed to work seamlessly across multiple devices, allowing you to manage your business communications from smartphones, tablets, and computers.'
  },
  {
    question: 'What payment options are available?',
    answer: 'We accept major credit cards, PayPal, and bank transfers. All payments are processed securely through our trusted payment gateway.'
  },
  {
    question: 'Is there a limit to the number of calls I can make?',
    answer: 'Call limits vary by plan. Our Lite plan offers 200 minutes, Standard provides 500 minutes, and Premium includes 3000 minutes per month.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time through your account settings. There are no long-term contracts, offering you complete flexibility.'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-[#F2F4F8]">
      <div className="md:max-w-7xl  mx-auto px-4 py-8 ">
        <h1 className="!text-2xl md:!text-3xl font-bold text-center !mb-8">FAQs</h1>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border border-[#F2F4F8] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-gray-200 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                <span className="text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;