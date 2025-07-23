"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { NumberModal } from "../shared/NumberModel";
import { useGetAvailablePhoneNumbersQuery } from "@/redux/features/phoneNumber/phone";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { CarouselDisplay } from "./CarouselDisplay";
import { event } from "@/lib/gtag";

// Define interfaces
interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  user: {
    _id: string;
    email: string;
  } | null;
  status: 'available' | 'active' | 'reserved';
  reservedUntil: string | null;
  assignedTo?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface PhoneNumberAvailability {
  number: string;
  isAvailable: boolean;
}

interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// Vanity phone mapping (letter to number)
const letterToNumber: Record<string, string> = {
  'a': '2', 'b': '2', 'c': '2',
  'd': '3', 'e': '3', 'f': '3',
  'g': '4', 'h': '4', 'i': '4',
  'j': '5', 'k': '5', 'l': '5',
  'm': '6', 'n': '6', 'o': '6',
  'p': '7', 'q': '7', 'r': '7', 's': '7',
  't': '8', 'u': '8', 'v': '8',
  'w': '9', 'x': '9', 'y': '9', 'z': '9'
};

// Predefined toll-free numbers
const predefinedNumbers: string[] = [
  '0700-061-XXXX',
  '0700-123-XXXX',
  '0800-123-XXXX',
  '0800-061-XXXX',
];

// Carousel data with all slide content
const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Stay Connected, Anywhere",
    description: "Enjoy consistent business communication with your Nigerian contacts anywhere in the world",
    image: "/assets/images/hero_img.png",
    imageAlt: "Person using phone",
  },
  {
    id: 2,
    title: "Maintain Vital Connections Within Nigeria",
    description: "A robust calling solution for business executives, ensuring uninterrupted communication with clients and personal contacts in Nigeria.",
    image: "/assets/images/business-man.png",
    imageAlt: "Business person on phone",
  },
  {
    id: 3,
    title: "The Exclusive Connection: Your Nigerian Network, On Your Terms.",
    description: "Navigate business and personal relationships with discretion, tailored for those who value exclusivity and control.",
    image: "/assets/images/business-meeting.png",
    imageAlt: "Business meeting",
  }
];

// Tour steps configuration with framer motion
interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'number-input',
    title: "Personalize Your Number",
    description: "Type the last 4 digits or letters of your preferred phone number here.",
    targetSelector: '.number-input-container',
    placement: 'bottom'
  },
  {
    id: 'toll-free',
    title: "Try Our Toll-Free Options",
    description: "Choose from our selection of toll-free number templates to get started.",
    targetSelector: '.predefined-numbers-container',
    placement: 'top'
  },
  {
    id: 'reserve',
    title: "Reserve Your Number",
    description: "Once you've selected your perfect number, click here to reserve it instantly.",
    targetSelector: '.reserve-button',
    placement: 'bottom'
  }
];

// Material UI theme
const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          backgroundColor: "white",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgb(249, 115, 22)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgb(249, 115, 22)",
            borderWidth: "2px",
          },
        },
        input: {
          padding: "0.5rem 1rem",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          maxHeight: "250px",
          overflowY: "auto",
          zIndex: 1500,
        },
        listbox: {
          maxHeight: "220px",
          padding: "8px 0",
        },
        option: {
          padding: "8px 16px",
          "&:hover": {
            backgroundColor: "rgb(243, 244, 246)",
          },
        },
        noOptions: {
          padding: "8px 16px",
          color: "rgba(0, 0, 0, 0.6)",
        },
        popper: {
          zIndex: 1500,
        },
      },
    },
  },
});

// Custom tour tooltip component with Framer Motion
const TourTooltip: React.FC<{
  step: TourStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  tooltipPosition: { top: number; left: number };
}> = ({ step, onNext, onPrev, onSkip, isFirst, isLast, tooltipPosition }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="fixed shadow-xl rounded-lg bg-white p-4 z-[10000] w-72"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
    >
      <h3 className="text-lg font-bold text-secondary mb-2">{step.title}</h3>
      <p className="text-secondary mb-4">{step.description}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={onSkip}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          Skip tour
        </button>
        <div className="flex space-x-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="px-3 py-1 bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Spotlight overlay component
const Spotlight: React.FC<{
  targetRect?: DOMRect | null;
  active: boolean;
}> = ({ targetRect, active }) => {
  if (!active) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        background: targetRect
          ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
              targetRect.top + targetRect.height / 2
            }px, transparent 0px, transparent ${Math.max(
              targetRect.width,
              targetRect.height
            ) / 2 + 10}px, rgba(0,0,0,0.7) ${Math.max(
              targetRect.width,
              targetRect.height
            ) / 2 + 11}px)`
          : 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(0)',
      }}
    />
  );
};

const VanityNumberConverter: React.FC = () => {
  // State management
  const [vanityInput, setVanityInput] = useState<string>("");
  const [numberSuffix, setNumberSuffix] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNumber, setSelectedNumber] = useState<string>("0700-123-");
  const [numberAvailability, setNumberAvailability] = useState<PhoneNumberAvailability>({
    number: `${selectedNumber}${numberSuffix}`,
    isAvailable: false,
  });
  const { data: phoneNumbersData, isLoading, isError } = useGetAvailablePhoneNumbersQuery();
  const [tourFinished, setTourFinished] = useState<boolean>(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  // Tour state
  const [runTour, setRunTour] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Process available phone numbers from mock data
  const availablePhoneNumbers = useMemo(() => {
    if (!phoneNumbersData?.data) return [];
    return phoneNumbersData.data.map((item: PhoneNumber) => {
      // Remove any dashes or formatting to ensure clean comparison
      return item.phoneNumber.replace(/-/g, "");
    });
  }, [phoneNumbersData]);

  // Initialize tour on first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    if (!hasVisitedBefore) {
      setTimeout(() => {
        setRunTour(true);
      }, 500);
    }
  }, []);

  // Handle tour positioning
  useEffect(() => {
    if (!runTour) return;

    const currentStep = tourSteps[currentStepIndex];
    const targetElement = document.querySelector(currentStep.targetSelector);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      
      // Calculate tooltip position based on placement
      let top = 0;
      let left = 0;
      
      switch (currentStep.placement) {
        case 'top':
          top = rect.top - 16 - 150; // 150px height for tooltip + spacing
          left = rect.left + rect.width / 2 - 144; // 288px / 2 for center alignment
          break;
        case 'bottom':
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - 144;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 75;
          left = rect.left - 16 - 288;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 75;
          left = rect.right + 16;
          break;
      }
      
      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 16) left = 16;
      if (left + 288 > viewportWidth - 16) left = viewportWidth - 288 - 16;
      if (top < 16) top = 16;
      if (top + 150 > viewportHeight - 16) top = viewportHeight - 150 - 16;
      
      setTooltipPosition({ top, left });
    }
  }, [runTour, currentStepIndex]);

  // Load saved number from local storage
  useEffect(() => {
    const savedNumber = localStorage.getItem("selectedPhoneNumber");
    if (savedNumber) {
      const match = savedNumber.match(/(0[7-8]00-\d{3}-)(\d{4})/);
      if (match) {
        setSelectedNumber(match[1]);
        setNumberSuffix(match[2]);
      }
    }
  }, []);

  // Update number availability when suffix or available numbers change
  useEffect(() => {
    // Format the number to match database format (remove dashes)
    const formattedPrefix = selectedNumber.replace(/-/g, "");
    const fullNumber = `${formattedPrefix}${numberSuffix}`;

    // Check if the full number exists in available numbers
    const isAvailable = availablePhoneNumbers.includes(fullNumber);

    setNumberAvailability({
      number: `${selectedNumber}${numberSuffix}`,
      isAvailable: isAvailable,
    });
  }, [numberSuffix, availablePhoneNumbers, selectedNumber]);

  // Carousel auto-rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && tourFinished) {
      interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselSlides.length);
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [isPaused, tourFinished]);

  // Tour navigation handlers
  const handleNextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkipTour = () => {
    endTour(true);
  };

  const endTour = (completed: boolean) => {
    setRunTour(false);
    setTourFinished(true);
    if (completed) {
      localStorage.setItem("hasVisitedBefore", "true");
    }
  };

  // Pause carousel when interacting with form
  const pauseCarousel = () => {
    setIsPaused(true);
  };

  // Convert vanity text to numbers
  const convertVanityToNumbers = (input: string): string => {
    return input
      .toLowerCase()
      .split('')
      .map(char => {
        if (/[0-9]/.test(char)) return char;
        return letterToNumber[char] || '';
      })
      .join('');
  };

  // Generate suggestions based on available numbers
  const generateSuggestions = (input: string): string[] => {
    if (availablePhoneNumbers.length === 0) {
      return [];
    }

    const formattedPrefix = selectedNumber.replace(/-/g, "");
    const convertedInput = convertVanityToNumbers(input);

    // Show all available suffixes for this prefix if no input
    if (!input) {
      const allSuffixes = availablePhoneNumbers
        .filter(number => number.startsWith(formattedPrefix))
        .map(number => number.slice(-4));

      return allSuffixes;
    }

    // Filter numbers that match the current prefix and input suffix
    const suggestions = availablePhoneNumbers
      .filter(number => {
        const matchesPrefix = number.startsWith(formattedPrefix);
        const suffix = number.slice(-4);
        const matchesInput = suffix.startsWith(convertedInput.substring(0, Math.min(convertedInput.length, 4)));
        return matchesPrefix && matchesInput;
      })
      .map(number => number.slice(-4));

    return suggestions;
  };

  // Handle vanity input change
  const handleVanityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 7) {
      setVanityInput(value);

      // Convert letters to numbers
      const convertedValue = convertVanityToNumbers(value);
      setNumberSuffix(convertedValue.substring(0, 4));

      // Always show dropdown when typing, regardless of content
      setAutocompleteOpen(true);
      pauseCarousel();
    }
  };

  // Handle number reservation
  const handleAction = () => {
    // Save the selected number to local storage
    if (!numberAvailability.isAvailable) {
      // Show an error message or alert
      console.error("This number is not available");
      return;
    }
  
    const fullNumber = numberAvailability.number;
    localStorage.setItem("selectedPhoneNumber", fullNumber);
    event({
      action: "reserve_number",
      category: "user_interaction",
      label: fullNumber,
      value: 1,
    });
    // Get the full phone number object and save it
    if (phoneNumbersData?.data) {
      const formattedSuffix = numberSuffix;
      const selectedPrefix = selectedNumber.replace(/-/g, "");

      const selectedPhoneObj = phoneNumbersData.data.find((item) =>
        item.phoneNumber === `${selectedPrefix}${formattedSuffix}`
      );

      if (selectedPhoneObj) {
        localStorage.setItem(
          "selectedPhoneData",
          JSON.stringify(selectedPhoneObj)
        );
      }
    }

    setIsModalOpen(true);
  };

  // Handle autocomplete selection
  const handleAutocompleteChange = (event: React.SyntheticEvent, newValue: string | null) => {
    if (newValue) {
      setNumberSuffix(newValue);

      // Try to find a vanity representation
      for (const char of vanityInput) {
        const num = convertVanityToNumbers(char);
        if (newValue.startsWith(num)) {
          setVanityInput(char);
          break;
        }
      }

      pauseCarousel();
    }
  };

  // Handle selection of predefined numbers
  const handlePredefinedNumberSelect = (number: string) => {
    const prefix = number.substring(0, 9);
    setSelectedNumber(prefix);
    setVanityInput("");
    setNumberSuffix("");
    pauseCarousel();

    // Focus the input field
    const inputElement = document.querySelector('#main-hero-autocomplete') as HTMLInputElement | null;
    if (inputElement) {
      setTimeout(() => {
        inputElement.focus();
      }, 100);
    }
  };

  // Handle alternative prefix selection
  const handleAlternativePrefixSelect = (prefix: string, suffix: string) => {
    // Format the prefix for display
    let formattedPrefix = prefix;
    if (prefix.startsWith('0700')) {
      formattedPrefix = `0700-${prefix.substring(4, 7)}-`;
    } else if (prefix.startsWith('0800')) {
      formattedPrefix = `0800-${prefix.substring(4, 7)}-`;
    }

    // Update the state
    setSelectedNumber(formattedPrefix);
    setNumberSuffix(suffix);

    // Also update vanity input if possible
    const possibleVanity = suffix.split('').map(digit => {
      // Convert digit back to possible letters
      switch (digit) {
        case '2': return 'a'; // Just use first possibility
        case '3': return 'd';
        case '4': return 'g';
        case '5': return 'j';
        case '6': return 'm';
        case '7': return 'p';
        case '8': return 't';
        case '9': return 'w';
        default: return digit;
      }
    }).join('');

    setVanityInput(possibleVanity);
    pauseCarousel();
  };

  // Force dropdown open when focused
  const handleInputFocus = () => {
    if (availablePhoneNumbers.length > 0) {
      setAutocompleteOpen(true);
      pauseCarousel();
    }
  };

  // Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    pauseCarousel();
  };

  return (
    <section className="hero overflow-hidden min-h-[747px] h-full relative">
      {/* Custom Tour with Framer Motion */}
      <AnimatePresence>
        {runTour && (
          <>
            <Spotlight targetRect={targetRect} active={runTour} />
            <TourTooltip
              step={tourSteps[currentStepIndex]}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              onSkip={handleSkipTour}
              isFirst={currentStepIndex === 0}
              isLast={currentStepIndex === tourSteps.length - 1}
              tooltipPosition={tooltipPosition}
            />
          </>
        )}
      </AnimatePresence>

      {/* Carousel with Phone Input */}
      <CarouselDisplay
        slides={carouselSlides}
        currentSlide={currentSlide}
        goToSlide={goToSlide}
      >
        <PhoneNumberInput
          selectedNumber={selectedNumber}
          vanityInput={vanityInput}
          numberSuffix={numberSuffix}
          isLoading={isLoading}
          isError={isError}
          numberAvailability={numberAvailability}
          predefinedNumbers={predefinedNumbers}
          autocompleteOpen={autocompleteOpen}
          theme={theme}
          availablePhoneNumbers={availablePhoneNumbers}
          handleVanityInputChange={handleVanityInputChange}
          handleAutocompleteChange={handleAutocompleteChange}
          handleInputFocus={handleInputFocus}
          setAutocompleteOpen={setAutocompleteOpen}
          handlePredefinedNumberSelect={handlePredefinedNumberSelect}
          handleAction={handleAction}
          generateSuggestions={generateSuggestions}
          handleAlternativePrefixSelect={handleAlternativePrefixSelect}
        />
      </CarouselDisplay>

      {/* Number Reservation Modal */}
      {isModalOpen && (
        <NumberModal
          open={isModalOpen}
          number={numberAvailability.number}
          isAvailable={numberAvailability.isAvailable}
          onClose={() => setIsModalOpen(false)}
          onAction={handleAction}
        />
      )}
    </section>
  );
};

export default VanityNumberConverter;