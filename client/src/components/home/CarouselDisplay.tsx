import React from "react";

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

interface CarouselDisplayProps {
  slides: CarouselSlide[];
  currentSlide: number;
  children: React.ReactNode;
  goToSlide: (index: number) => void;
}

export const CarouselDisplay: React.FC<CarouselDisplayProps> = ({
  slides,
  currentSlide,
  children,
  goToSlide,
}) => {
  return (
    <div className="relative overflow-hidden w-full">
      <div
        className="flex transition-transform md:mt-20 duration-500 ease-in-out w-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="w-full flex-shrink-0">
            <div className={`w-full flex-shrink-0 ${currentSlide === index ? 'block' : 'hidden'}`}>
              <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center h-full">
                <div className="md:max-w-[654px] w-[90%] px-4 md:mt-0 mt-[100px]">
                  <h1 className="text-secondary !text-[2.9rem] md:!text-[4.375rem] !leading-[2.25rem] md:!leading-[3.75rem]">
                    {slide.title.split(' ').slice(0, 2).join(' ')} <br /> {slide.title.split(' ').slice(2).join(' ')}
                  </h1>
                  <p className={`text-secondary font-[400] text-[1.25rem] mb-[64px] md:w-[600px] mt-[48px]`}>
                    {slide.description}
                  </p>

                  {/* Render the PhoneNumberInput component here */}
                  {currentSlide === index && children}
                </div>

                <div className="relative flex h-fit justify-end items-end">
                  <img
                    loading="lazy"
                    src={slide.image}
                    alt={slide.imageAlt}
                    className="md:h-[600px] h-fit object-cover rounded-lg md:mt-[61px]"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-primary' : 'bg-gray-300'
              }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};