import React from "react";
import Image from "next/image";

const GetStartedSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="  rounded-lg p-6 md:p-8 mb-8">
        <h2 className=" font-bold text-center  text-dark !text-[1.9rem] md:!text-[1.9rem]">
          Get Started in 4 easy steps 
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto mt-[24px]">
          From buying a number to making your first call, it takes less than
          3minutes to set up with OneNumber.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2rem]">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className=" md:!text-lg !text-[1.25rem] text-dark mb-2">
              Select a number
            </h3>
            <p className="text-sm text-center text-gray-600">
            We have Toll-Free 
            as well as Non Toll-Free Number
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className=" md:!text-lg !text-[1.25rem] text-dark mb-2">
              Choose your plan
            </h3>
            <p className="text-sm text-center text-gray-600">
              Select a monthly or annual plan to get
              going right away.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <h3 className=" md:!text-lg !text-[1.25rem] text-dark mb-2">
              Download the App
            </h3>
            <p className="text-sm text-center text-gray-600">
              Available for desktop, iOS, and Android.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="font-medium md:!text-lg !text-[1.25rem] text-dark mb-2">
              Call
            </h3>
            <p className="text-sm  text-gray-600">
              Link your existing mobile number to start calling and texting
              right away.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="rounded-lg overflow-hidden mb-8">
        <div className="relative w-full h-64 md:h-[666px]">
          <Image
            src="/assets/images/getStarted.png"
            alt="Person using OneNumber app on phone"
            layout="fill"
            objectFit="contain"
            priority
            
          />
        </div>
      </div>

   
    </section>
  );
};

export default GetStartedSection;
