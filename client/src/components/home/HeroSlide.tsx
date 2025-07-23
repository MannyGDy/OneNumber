import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Theme } from "@mui/material/styles";
// import { DM_Sans } from "next/font/google";

// const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "700"] });


interface HeroSlideProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  selectedNumber: string;
  numberSuffix: string;
  isLoading: boolean;
  isError: boolean;
  availablePhoneNumbers: string[];
  predefinedNumbers: string[];
  handlePredefinedNumberSelect: (number: string) => void;
  handleAction: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAutocompleteChange: (event: React.SyntheticEvent, newValue: string | null) => void;
  handleInputFocus: () => void;
  autocompleteOpen: boolean;
  setAutocompleteOpen: (open: boolean) => void;
  theme: Theme;
  isVisible: boolean;
}

const HeroSlide: React.FC<HeroSlideProps> = ({
  title,
  description,
  image,
  imageAlt,
  selectedNumber,
  numberSuffix,
  isLoading,
  isError,
  availablePhoneNumbers,
  predefinedNumbers,
  handlePredefinedNumberSelect,
  handleAction,
  handleInputChange,
  handleAutocompleteChange,
  handleInputFocus,
  autocompleteOpen,
  setAutocompleteOpen,
  theme,
  isVisible
}) => {

  

  return (
    <div className={`w-full flex-shrink-0 ${isVisible ? 'block' : 'hidden'}`}>
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center h-full">
        <div className="md:max-w-[654px] w-[90%] px-4 md:mt-0 mt-[100px]">
          <h1 className="text-secondary !text-[2.9rem] md:!text-[4.375rem] !leading-[2.25rem] md:!leading-[3.75rem]">
            {title.split(' ').slice(0, 2).join(' ')} <br /> {title.split(' ').slice(2).join(' ')}
          </h1>
          <p className={`text-secondary font-[400] text-[1.25rem] mb-[64px] md:w-[600px] mt-[48px]`}>
            {description}
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <div className="flex-1 overflow-visible">
              <div className="flex items-center number-input-container">
                <span className="inline-flex items-center px-3 text-secondary font-medium text-2xl md:text-[40px]">
                  {selectedNumber}
                </span>
                <div className="flex-1">
                  <ThemeProvider theme={theme}>
                    <Autocomplete<string, false, false, true>
                      freeSolo
                      id="main-hero-autocomplete"
                      options={availablePhoneNumbers}
                      value={numberSuffix}
                      onChange={handleAutocompleteChange}
                      noOptionsText={isLoading ? "Loading..." : "No matching numbers found"}
                      open={autocompleteOpen}
                      onOpen={() => setAutocompleteOpen(true)}
                      onClose={() => setAutocompleteOpen(false)}
                      disablePortal={false}
                      renderOption={(props, option) => (
                        <li
                          {...props}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {selectedNumber}{option}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="MY-NUMBER"
                          InputProps={{
                            ...params.InputProps,
                            // className: "focus:outline-none rounded-lg",
                            style: { padding: "0.5rem 1rem" },
                          }}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onClick={handleInputFocus}
                          fullWidth
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                       
                        if (!inputValue) return options.slice(0, 15);
                        return options
                          .filter((option) => option.toString().startsWith(inputValue))
                          .slice(0, 15);
                      }}

                    />
                  </ThemeProvider>
                </div>
              </div>
            </div>
            <button
              className={`reserve-button px-6 py-2 font-medium rounded-lg transition-colors cursor-pointer ${numberSuffix.length === 4
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-primary/50 text-gray-600 cursor-not-allowed"
                }`}
              onClick={handleAction}
              disabled={numberSuffix.length !== 4}
            >
              Reserve now
            </button>
          </div>

          {/* Display loading/error state for phone numbers */}
          {isLoading && (
            <p className="text-gray-600 text-sm mb-2">Loading available numbers...</p>
          )}
          {isError && (
            <p className="text-red-600 text-sm mb-2">Failed to load available numbers. Please try again later.</p>
          )}
          {!isLoading && !isError && availablePhoneNumbers.length === 0 && (
            <p className="text-amber-600 text-sm mb-2">No numbers available for the selected prefix. Try another prefix.</p>
          )}

          <div className="flex-grow mt-[26px]">
            <p className={` text-secondary text-[18px] mb-[35px] `}>
              Or select one from our range of toll-free numbers
            </p>
            <div className="flex items-center text-lg gap-2 md:gap-4 flex-wrap predefined-numbers-container">
              {predefinedNumbers.map((number, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedNumberSelect(number)}
                  className="text-white px-2 md:px-4 py-2 md:py-3 !text-[12px] md:!text-[14px] bg-secondary rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer mb-2"
                >
                  + {number}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex h-fit justify-end items-end">
          <img
            loading="lazy"
            src={image}
            alt={imageAlt}
            className="md:h-[600px] h-fit object-cover rounded-lg md:mt-[61px]"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSlide;