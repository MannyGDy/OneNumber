"use client"
import { event } from '@/lib/gtag';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

interface PlanFeature {
  id: string;
  name: string;
  days: number;
  minutes: number;
  price: string;
}

const PricingComponent: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const plans: PlanFeature[] = [
    {
      id: 'lite',
      name: 'Lite',
      days: 45,
      minutes: 200,
      price: "16,500"
    },
    {
      id: 'standard',
      name: 'Standard',
      days: 45,
      minutes: 500,
      price: "33,000"
    },
    {
      id: 'premium', 
      name: 'Premium',
      days: 60,
      minutes: 3000,
      price: "82,500"
    }
  ];

  const handlePlanSelection = (planId: string) => {
    if (user) {
      event({
        action: `subscribe_click ${planId}`,
        category: "engagement",
        label: "Subscribe Button",
        value: 1,
      });

      router.push(`/payment-gateway?plan=${planId}`);
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Which plan is right for you?</h2>
        <p className="text-gray-600">Powerful features for running a business</p>
      </div>


      <div className="flex flex-col md:flex-row w-[90%] mx-auto my-20 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border border-[#F2F4F8] rounded-lg p-6 text-center flex-grow shadow-lg hover:shadow-xl transition-all relative h-[529px] flex flex-col items-center justify-center gap-[32px]"
          >
            <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-[3.5rem] font-bold">₦{plan.price}</span>
            </div>
            <button
              className="w-[200px] bg-primary cursor-pointer text-white py-2 rounded-md hover:!bg-primary/80 transition-colors mb-4"
              onClick={() => handlePlanSelection(plan.id)}
            >
              Buy Now
            </button>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {plan.days} Days
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {plan.minutes} Mins
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Receive calls for free
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3-Way conference calls
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No Contract
              </li>
            </ul>
            {plan.name === 'Standard' && (
              <div className="absolute -top-3 right-[50%] translate-x-[50%] text-[12px] w-[60%] !bg-[#e2e2e2] text-dark px-4 py-1 rounded">
                Most businesses pick this plan
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingComponent;