import React from "react";

export default function VanityNumberBottomCTA() {
  return (
    <div className="bg-secondary text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="md:text-3xl !text-2xl font-bold mb-4">
          Get a toll-free number for your business
        </h2>
        <p className="md:text-lg !text-base mb-8">
          Stand out from the crowd with a memorable number from One number.
        </p>
        <div className="md:space-x-4 space-x-2">
          <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/50 transition-colors cursor-pointer mb-4">
            Get Started
          </button>
          <button className="bg-transparent border border-white px-6 py-3 rounded-lg hover:!bg-secondary cursor-pointer hover:!text-secondary transition-colors">
            Pick a toll-free number
          </button>
        </div>
      </div>
    </div>
  );
};