"use client"
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const FeatureCarousel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);

  const features = [
    {
      title: 'BUSINESS TEXTING',
      mainTitle: 'Use your business number to send and receive texts.',
      subtitle: 'Unlimited texts are included with your One number business number',
      details: [
        'Use a communication channel that more and more customers prefer.',
        'Confirm client appointment times in writing with text confirmations.',
        'Respond to missed calls and voicemails, even when you can\'t talk.',
        'Communicate visually through business MMS picture messages.'
      ],
      image: '/assets/images/illuphone.png'
    },
    {
      title: 'MOBILE APPS',
      mainTitle: 'Run your business while on the go.',
      subtitle: 'Onenumber\'s mobile app lets you stay in touch no matter where you are.',
      details: [
        'Work from anywhere and on any device.',
        'Use the app to send and receive texts from your business number.',
        'View your caller ID, call history, and read voicemail transcriptions.',
        'Keep your business and personal calls and texts separate.'
      ],
      image: '/assets/images/mobile.png'
    },
    {
      title: 'CUSTOM MAIN GREETINGS',
      mainTitle: 'Create a customized business greeting.',
      subtitle: 'A custom phone greeting lets you record a business voicemail on your personal phone and can:',
      details: [
        'Use an auto attendant to welcome and direct your customers.',
        'Let callers know when you\'re available or away.',
        'Give your small business a professional appearance.'
      ],
      image: '/assets/images/illuphone.png'
    },

  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prevTab) => (prevTab + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="container mx-auto my-15 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Starting with your vanity number</h1>
        <p className="text-gray-600">Powerful features for running a business</p>
      </div>

      <div className="flex justify-center mb-8 space-x-4">
        {features.map((feature, index) => (
          <button
            key={feature.title}
            className={`text-sm font-semibold pb-2 transition-colors duration-300 ${activeTab === index
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-600'
              }`}
            onClick={() => setActiveTab(index)}
          >
            {feature.title}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {features[activeTab].mainTitle}
          </h2>
          <p className="text-gray-600">
            {features[activeTab].subtitle}
          </p>
          <ul className="space-y-2 list-disc list-outside pl-5 text-gray-700">
            {features[activeTab].details.map((detail, index) => (
              <li key={index}>
                {detail}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <Image
              src={features[activeTab].image}
              alt={features[activeTab].title}
              className="max-w-full  w-[500px] h-[400px]"
              width={500}
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCarousel;