"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";



interface WelcomeWalkthroughProps {
  open: boolean;
  onClose: () => void;
}


const WelcomeWalkthrough: React.FC<WelcomeWalkthroughProps> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to our Phone Number Reservation Service",
      content: "We're excited to help you stay connected with your Nigerian contacts from anywhere in the world. Let's walk through how our service works.",
      image: "/assets/images/welcome.png"
    },
    {
      title: "Choose Your Number Prefix",
      content: "Start by selecting one of our toll-free number prefixes. These determine your number type (0700 or 0800 series).",
      image: "/assets/images/step1.png"
    },
    {
      title: "Pick Your Last 4 Digits",
      content: "After selecting a prefix, enter your desired 4-digit suffix to complete your custom phone number. Our system will check if it's available.",
      image: "/assets/images/step2.png"
    },
    {
      title: "Reserve Your Number",
      content: "Once you've found an available number you like, click 'Reserve now' to proceed with the registration and setup process.",
      image: "/assets/images/step3.png"
    },
    {
      title: "You're All Set!",
      content: "Congratulations! Your number is now reserved. Use our dashboard to manage your account, make payments, and customize your services.",
      image: "/assets/images/success.png"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: "1rem",
          padding: "1rem",
          width: "100%",
          maxWidth: "800px"
        }
      }}
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-secondary px-4">
          {steps[currentStep].title}
        </h2>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </div>

      <DialogContent>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[600px] h-[300px] bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            <img
              src={steps[currentStep].image || "/assets/images/placeholder.png"}
              loading="lazy"
              alt={`Step ${currentStep + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <p className="text-center text-gray-700 mb-6 max-w-[600px]">
            {steps[currentStep].content}
          </p>

          <div className="flex justify-center space-x-2 w-full mt-4">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
              ></span>
            ))}
          </div>
        </div>
      </DialogContent>

      <DialogActions className="flex justify-between px-6 pb-4">
        <div>
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2 text-secondary font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Previous
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {currentStep < steps.length - 1 ? "Next" : "Get Started"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeWalkthrough;