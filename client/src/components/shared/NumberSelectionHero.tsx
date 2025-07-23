"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { NumberModal } from '../shared/NumberModel';
import { useGetAvailablePhoneNumbersQuery } from '../../redux/features/phoneNumber/phone';
import { createTheme } from '@mui/material/styles';
import { PhoneNumber } from '@/types/unified';
import { PhoneNumberInput } from '../home/PhoneNumberInput';

interface NumberSelectionHeroProps {
  title: string;
  subtitle: string;
  bgColorClass?: string;
  buttonColorClass?: string;
  textColorClass?: string;
  alternativeButtonColorClass?: string;
  predefinedButtonColorClass?: string;
}

export const NumberSelectionHero: React.FC<NumberSelectionHeroProps> = ({
  title,
  subtitle,
  bgColorClass = "number-hero text-white py-16",
  buttonColorClass = "bg-primary hover:bg-primary/90 text-white",
  textColorClass = "text-white",
  alternativeButtonColorClass = "bg-primary hover:bg-primary/90",
  predefinedButtonColorClass = "bg-[#738FB8] hover:bg-[#5A7BA6]",
}) => {
  // State management
  const [vanityInput, setVanityInput] = useState<string>("");
  const [numberSuffix, setNumberSuffix] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedNumber, setSelectedNumber] = useState<string>("0700-123-");
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [numberAvailability, setNumberAvailability] = useState({
    number: `${selectedNumber}${numberSuffix}`,
    isAvailable: false,
  });

  const { data: phoneNumbersData, isLoading, isError } = useGetAvailablePhoneNumbersQuery();

  // Process available phone numbers from data
  const availablePhoneNumbers = useMemo(() => {
    if (!phoneNumbersData?.data) return [];
    return phoneNumbersData.data.map((item: PhoneNumber) => {
      // Remove any dashes or formatting to ensure clean comparison
      return item.phoneNumber.replace(/-/g, "");
    });
  }, [phoneNumbersData]);

  // Predefined toll-free numbers
  const predefinedNumbers: string[] = [
    '0700-061-XXXX',
    '0700-123-XXXX',
    '0800-123-XXXX',
    '0800-061-XXXX',
  ];

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

      // Always show dropdown when typing
      setAutocompleteOpen(true);
    }
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
    }
  };

  // Handle selection of predefined numbers
  const handlePredefinedNumberSelect = (number: string) => {
    const prefix = number.substring(0, 9);
    setSelectedNumber(prefix);
    setVanityInput("");
    setNumberSuffix("");

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

  // Force dropdown open when focused
  const handleInputFocus = () => {
    if (availablePhoneNumbers.length > 0) {
      setAutocompleteOpen(true);
    }
  };

  // Custom theme to match Tailwind styling
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

  return (
    <div className={bgColorClass}>
      <div className="container mx-auto max-w-7xl px-4 justify-center h-full flex flex-col mt-[40px] md:mt-[0px]">
        <h1 className="!text-[1.9rem] md:!text-[3.375rem] !leading-[2.25rem] md:!leading-[3.75rem] md:w-[700px] mb-[20px]">
          {title}
        </h1>
        <p className="md:text-lg !text-[1rem] mb-[26px] md:w-[700px] !mt-[40px]">
          {subtitle}
        </p>
        <div className="flex items-center max-w-[600px] space-x-2">
          <div className="flex-grow">
            {/* Pass the color props to PhoneNumberInput */}
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
              textColorClass={textColorClass}
              buttonColorClass={buttonColorClass}
              alternativeButtonColorClass={alternativeButtonColorClass}
              predefinedButtonColorClass={predefinedButtonColorClass}
              handleVanityInputChange={handleVanityInputChange}
              handleAutocompleteChange={handleAutocompleteChange}
              handleInputFocus={handleInputFocus}
              setAutocompleteOpen={setAutocompleteOpen}
              handlePredefinedNumberSelect={handlePredefinedNumberSelect}
              handleAction={handleAction}
              generateSuggestions={generateSuggestions}
              handleAlternativePrefixSelect={handleAlternativePrefixSelect}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <NumberModal
          open={isModalOpen}
          number={numberAvailability.number}
          isAvailable={numberAvailability.isAvailable}
          onClose={() => setIsModalOpen(false)}
          onAction={handleAction}
        />
      )}
    </div>
  );
};