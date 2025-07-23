import React, { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, Theme } from "@mui/material/";
import { ThemeProvider } from "@mui/material/styles";
import ClickAwayListener from "@mui/material/ClickAwayListener";

interface PhoneNumberAvailability {
  number: string;
  isAvailable: boolean;
}

interface AlternativeSuggestion {
  prefix: string;
  suffix: string;
}

interface PhoneNumberInputProps {
  selectedNumber: string;
  vanityInput: string;
  numberSuffix: string;
  isLoading: boolean;
  isError: boolean;
  numberAvailability: PhoneNumberAvailability;
  predefinedNumbers: string[];
  autocompleteOpen: boolean;
  theme: Theme;
  availablePhoneNumbers: string[];

  // Add color configuration props
  textColorClass?: string;
  buttonColorClass?: string;
  alternativeButtonColorClass?: string;
  predefinedButtonColorClass?: string;

  handleVanityInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAutocompleteChange: (event: React.SyntheticEvent, newValue: string | null) => void;
  handleInputFocus: () => void;
  setAutocompleteOpen: (open: boolean) => void;
  handlePredefinedNumberSelect: (number: string) => void;
  handleAction: () => void;
  generateSuggestions: (input: string) => string[];
  handleAlternativePrefixSelect: (prefix: string, suffix: string) => void;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  selectedNumber,
  vanityInput,
  numberSuffix,
  isLoading,
  isError,
  numberAvailability,
  predefinedNumbers,
  autocompleteOpen,
  theme,
  availablePhoneNumbers,
  // Provide default values for color classes
  textColorClass = "text-secondary",
  buttonColorClass = "bg-primary hover:bg-primary/90 text-white",
  alternativeButtonColorClass = "bg-primary hover:bg-primary/90",
  predefinedButtonColorClass = "bg-secondary hover:bg-secondary/90",

  handleVanityInputChange,
  handleAutocompleteChange,
  handleInputFocus,
  setAutocompleteOpen,
  handlePredefinedNumberSelect,
  handleAction,
  generateSuggestions,
  handleAlternativePrefixSelect,
}) => {
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<AlternativeSuggestion[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Find alternative prefixes where the same suffix is available
  useEffect(() => {
    if (numberSuffix.length === 4 && !numberAvailability.isAvailable && !isLoading && !isError) {
      // Get all prefixes from available numbers
      const prefixes = new Set<string>();
      const alternatives: AlternativeSuggestion[] = [];

      availablePhoneNumbers.forEach(number => {
        const prefix = number.slice(0, -4);
        const suffix = number.slice(-4);

        // If this suffix matches what the user wants
        if (suffix === numberSuffix) {
          alternatives.push({ prefix, suffix });
        }

        prefixes.add(prefix);
      });

      // Limit to 3 suggestions
      setAlternativeSuggestions(alternatives.slice(0, 3));
    } else {
      setAlternativeSuggestions([]);
    }
  }, [numberSuffix, numberAvailability.isAvailable, isLoading, isError, availablePhoneNumbers]);

  // Format prefix for display (add dashes)
  const formatPrefixForDisplay = (prefix: string): string => {
    if (prefix.startsWith('0700')) {
      return `0700-${prefix.substring(4, 7)}-`;
    } else if (prefix.startsWith('0800')) {
      return `0800-${prefix.substring(4, 7)}-`;
    }
    return prefix;
  };

  // Handle click away event
  const handleClickAway = () => {
    setAutocompleteOpen(false);
  };
 
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className="md:max-w-full w-full md:mt-0 mt-[40px]">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <div className="flex-1 overflow-visible" ref={inputRef}>
            <div className="flex items-center number-input-container">
              <span className={`inline-flex items-center pr-3 font-medium text-2xl md:text-[40px] ${textColorClass}`}>
                {selectedNumber}
              </span>
              <div className="flex-1">
                <ThemeProvider theme={theme}>
                  <Autocomplete<string, false, false, true>
                    freeSolo
                    id="main-hero-autocomplete"
                    options={generateSuggestions('')}
                    value={vanityInput}
                    onChange={handleAutocompleteChange}
                    noOptionsText={isLoading ? "Loading..." : "No matching numbers found"}
                    open={autocompleteOpen}
                    onOpen={() => setAutocompleteOpen(true)}
                    onClose={() => setAutocompleteOpen(false)}
                    disablePortal={false}
                    ListboxProps={{
                      style: {
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }
                    }}
                    renderOption={(props, option) => (
                      <li {...props} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        {selectedNumber}{option}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="NAIJ or 4633"
                        InputProps={{
                          ...params.InputProps,
                          style: { padding: "0.5rem 1rem" },
                        }}
                        onChange={handleVanityInputChange}
                        onFocus={handleInputFocus}
                        onClick={handleInputFocus}
                        fullWidth
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const suggestions = generateSuggestions(inputValue || "");
                      return suggestions.slice(0, 15);
                    }}
                  />
                </ThemeProvider>
              </div>
            </div>
          </div>
          <button
            className={`reserve-button px-6 py-2 font-medium rounded-lg transition-colors cursor-pointer ${numberSuffix.length === 4 && numberAvailability.isAvailable
              ? buttonColorClass
              : "bg-primary-dark text-white cursor-not-allowed"
              }`}
            onClick={handleAction}
            disabled={numberSuffix.length !== 4 || !numberAvailability.isAvailable}
          >
            Reserve now
          </button>
        </div>

        {vanityInput && numberSuffix && (
          <p className={`text-sm ${textColorClass} mt-2`}>
            Your vanity number will be: {selectedNumber}{numberSuffix}
          </p>
        )}

        {/* Display loading/error state for phone numbers */}
        {isLoading && (
          <p className="text-gray-600 text-sm mb-2">Loading available numbers...</p>
        )}
        {isError && (
          <p className="text-red-600 text-sm mb-2">Failed to load available numbers. Please try again later.</p>
        )}

        {/* Alternative suggestions section */}
        {!isLoading && !isError && numberSuffix.length === 4 && !numberAvailability.isAvailable && (
          <div className="text-amber-600 mb-4">
            <p className="text-sm mb-2">
              {selectedNumber}{numberSuffix} is not available. Try these alternatives:
            </p>
            {alternativeSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {alternativeSuggestions.map((alt, idx) => (
                  <button
                    key={idx}
                    className={`text-white px-3 py-1 ${alternativeButtonColorClass} rounded-lg transition-colors text-sm`}
                    onClick={() => handleAlternativePrefixSelect(alt.prefix, alt.suffix)}
                  >
                    {formatPrefixForDisplay(alt.prefix)}{alt.suffix}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm">No alternatives found with suffix {numberSuffix}. Try a different number.</p>
            )}
          </div>
        )}

        {!isLoading && !isError && generateSuggestions('').length === 0 && numberSuffix.length === 0 && (
          <p className="text-amber-600 text-sm mb-2">
            No numbers available for the selected prefix {selectedNumber}. Try another prefix.
          </p>
        )}

        <div className="flex-grow mt-[26px]">
          <p className={`${textColorClass} text-[18px] mb-[35px]`}>
            Or select one from our range of toll-free numbers
          </p>
          <div className="flex items-center text-lg gap-2 md:gap-4 flex-wrap predefined-numbers-container">
            {predefinedNumbers.map((number, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedNumberSelect(number)}
                className={`text-white px-2 md:px-4 py-2 md:py-3 !text-[12px] md:!text-[14px] ${predefinedButtonColorClass} rounded-lg transition-colors cursor-pointer mb-2`}
              >
                + {number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ClickAwayListener>
  );
};