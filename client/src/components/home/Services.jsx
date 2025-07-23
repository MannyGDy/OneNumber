import Link from "next/link";
import React from "react";

export default function Services() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center !text-2xl md:!text-3xl font-bold text-dark ">
          What We Offer
        </h2>

        <div className="flex justify-center flex-wrap items-center gap-6 mb-12 mt-[64px]">
          <ServiceCard
            title="Vanity Numbers"
            description="Express all our experience of the word-to-number correspondence"
            ctaText="More Info"
            ctaLink="/vanity-number"
          />

          <ServiceCard
            title="Toll-Free Numbers"
            description="A very professional feature of quality communication system"
            ctaText="More Info"
            ctaLink="/toll-free"
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ title, description, ctaText, ctaLink }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center flex-col items-center hover:shadow-md transition-shadow">
      <h3 className="font-bold !text-[1.25rem] md:!text-xl mb-[1rem] text-dark">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 !text-[1rem] md:!text-[1.1rem]">
        {description}
      </p>
      <Link
        href={ctaLink}
        className="inline-flex items-center  hover:text-blue-800 font-bold mt-8"
      >
        {ctaText}
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </Link>
    </div>
  );
}
