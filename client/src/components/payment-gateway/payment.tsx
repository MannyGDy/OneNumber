'use client'
import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useCreatePaymentMutation } from '@/redux/features/payment/payment';
import { AlertCircle, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { event } from '@/lib/gtag';

// Plan type definition
interface Plan {
  id: string;
  name: string;
  price: string;
  days: number;
  minutes: number;
  description: string;
}

// Payment request type
interface PaymentRequest {
  description: string;
  planType: string;
}

export default function PaymentGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'standard';
  const { user } = useSelector((state: RootState) => state.auth);
  const [createPayment, { isLoading, isSuccess, isError, error, data }] = useCreatePaymentMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  const paymentLink = data?.data?.authorization_url;


  // Plan details
  const plans: Record<string, Plan> = {
    lite: {
      id: 'lite',
      name: 'Lite Plan',
      price: "16,500",
      days: 45,
      minutes: 200,
      description: 'Basic communication package with 200 minutes'
    },
    standard: {
      id: 'standard',
      name: 'Standard Plan',
      price: "33,000",
      days: 45,
      minutes: 500,
      description: 'Standard communication package with 500 minutes'
    },
    premium: {
      id: 'premium',
      name: 'Premium Plan',
      price: "82,500",
      days: 60,
      minutes: 3000,
      description: 'Premium communication package with 3000 minutes'
    }
  };

  const selectedPlan = plans[planId] || plans.standard;

  // Redirect to payment success page when payment link is created
  useEffect(() => {
    if (isSuccess && paymentLink) {
      router.push(paymentLink);
    }
  }, [isSuccess, paymentLink, router]);

  // Handle errors from the API
  useEffect(() => {
    if (isError) {
      // Check if error has response data
      const errorData = error as { data: { message?: string } };
      if (errorData?.data?.message) {
        setErrorMessage(errorData.data.message);
      } else if (typeof errorData === 'string') {
        setErrorMessage(errorData + ' Please try again.');
      } else {
        setErrorMessage('Failed to generate payment link. Please try again.');
      }
    } else {
      setErrorMessage(null);
    }
  }, [isError, error]);

  const handleGeneratePaymentLink = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    event({
      action: "Generate_Payment_Link",
      category: "engagement",
      label: "Generate Payment Button",
      value: 1,
    });

    if (!user) {
      router.push('/signup');
      return;
    }
 
    const paymentRequest: PaymentRequest = {
      description: `Payment for ${selectedPlan.name}: ${selectedPlan.days} days and ${selectedPlan.minutes} minutes`,
      planType: selectedPlan.id
    };

    try {
      await createPayment(paymentRequest);
    } catch (err) {
      setErrorMessage('Failed to generate payment link. Please try again.');
      console.error('Error generating payment link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header - Using primary color */}
          <div className="bg-primary p-6 text-white">
            <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
            <p className="text-white/80 mt-1">Secure checkout for your communications needs</p>
          </div>

          <div className="p-6">
            {/* Selected Plan */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedPlan.name}</h3>
                  <p className="text-gray-500 mt-1">{selectedPlan.description}</p>
                </div>
                <div className="text-3xl font-bold text-primary">₦{selectedPlan.price}</div>
              </div>

              <div className="mt-4 bg-primary/5 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Plan Features:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Check size={16} className="text-primary mr-2" />
                    <span className="text-sm">{selectedPlan.days} Days</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-primary mr-2" />
                    <span className="text-sm">{selectedPlan.minutes} Minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-primary mr-2" />
                    <span className="text-sm">Free incoming</span>
                  </div>
                  <div className="flex items-center">
                    <Check size={16} className="text-primary mr-2" />
                    <span className="text-sm">Conference calls</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 mb-3">Order Summary</h4>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan Price:</span>
                <span className="font-medium">₦{selectedPlan.price}.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">₦0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">₦{selectedPlan.price}.00</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Checkout Form */}
            {user ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-1">Customer Details</div>
                  <div className="text-gray-800 font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-gray-600 text-sm">{user.email}</div>
                </div>

                <form onSubmit={handleGeneratePaymentLink}>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:bg-primary/60 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <CreditCard size={20} />
                    <span>{isLoading ? 'Processing...' : 'Generate Payment Link'}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center p-5 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-secondary-foreground mb-3">Please sign in to complete your purchase</p>
                <button
                  onClick={() => router.push('/signup')}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  Sign Up / Sign In
                </button>
              </div>
            )}

            {/* Security Info */}
            <div className="mt-6 flex items-center justify-center">
              <ShieldCheck size={18} className="text-gray-500 mr-2" />
              <div className="text-sm text-gray-500">Secure checkout powered by BudPay</div>
            </div>

            <div className="mt-3 flex justify-center space-x-3">
              <span className="w-10 h-6 bg-gray-200 rounded"></span>
              <span className="w-10 h-6 bg-gray-200 rounded"></span>
              <span className="w-10 h-6 bg-gray-200 rounded"></span>
              <span className="w-10 h-6 bg-gray-200 rounded"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}