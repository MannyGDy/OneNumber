import Image from "next/image";

export const TollFreeNumberSteps: React.FC = () => {
  const steps = [
    {
      icon: '/assets/svgs/icons/Phone book.svg',
      title: 'Pick a number',
      description: 'Our number tool will help find your search available number for your company'
    },
    {
      icon: '/assets/svgs/icons/Notepad.svg',
      title: 'Get started',
      description: 'Download the app and use your vanity number after signing up'
    },
    {
      icon: '/assets/svgs/icons/Mobile.svg',
      title: 'Pick a number+',
      description: 'Our number tool picks the best number available for your company'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 ">
      <div className=" p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          How to get a toll-free number
        </h2>
        <p className="text-center text-gray-600 mb-8">
          It is easy to find and use toll-free numbers with OneNumber.
        </p>

        <div className="grid md:grid-cols-3 gap-8 my-[50px]">
          {steps.map((step, index) => (
            <div key={index} className="text-center border border-[#F2F4F8] rounded-lg p-4">
              <div className="flex justify-center mb-4">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={50}
                  height={50}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/80 transition-colors">
            Pick your vanity number
          </button>
        </div>
      </div>
    </div>
  );
};
