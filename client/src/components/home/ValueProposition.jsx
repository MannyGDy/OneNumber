import React from "react";

export default function ValueProposition() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-[2rem]  font-[700] text-dark mb-6">
        OneNumber helps you focus on your business, 
        <br />
so you can stay connected, anywhere in the world.
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mt-12 flex-wrap items-center justify-center">
          <FeatureCard
            icon="phone-forward"
            title="Five Steps Ahead"
            description="Start making your first call with OneNumber app. Because it's not bringing in money, there's no need for it."
          />

          <FeatureCard
            icon="phone"
            title="OneNumber Dial"
            description="Never miss business calls, whether you're on long tours and around your calls, for iPhone and more with OneNumber app."
          />

          <FeatureCard
            icon="credit-card"
            title="Handsfree Calls"
            description="Get one number that connects to five other numbers. Receives calls while business and business owners manage."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-6 md:w-[45%]">
      <div className="mb-4 w-16 h-16 flex items-center justify-center rounded-full text-blue-800">
        {renderIcon(icon)}
      </div>
      <h3 className="font-bold !text-xl text-[1.9rem] font-[700] mb-2 text-dark">
        {title}
      </h3>
      <p className="text-gray-600 text-[18px] md:!text-[1.25rem]">
        {description}
      </p>
    </div>
  );
}

function renderIcon(iconName) {
  switch (iconName) {
    case "phone":
      return (
        <img
          src="/assets/svgs/icons/oneNumberDial.svg"
          alt="phone"
          className="w-16 h-16"
          loading="lazy"
        />
      );
    case "phone-forward":
      return (
        <img
          src="/assets/svgs/icons/firstStep.svg"
          alt="phone"
          loading="lazy"
          className="w-16 h-16"
        />
      );
    case "credit-card":
      return (
        <img
          src="/assets/svgs/icons/handleCall.svg"
          alt="phone"
          loading="lazy"
          className="w-16 h-16"
        />
      );
    default:
      return null;
  }
}
