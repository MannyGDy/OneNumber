'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useSearchParams } from 'next/navigation';
import { useVerifyPaymentQuery, useHandleSuccessfulPaymentMutation } from '../../redux/features/payment/payment';
import { ErrorResponse, User } from '@/types/unified';

// Define interfaces for our data structures
interface SelectedPhoneData {
  _id: string;
  phoneNumber: string;
  status: string;
  type: string;
}

// Define the subscription data interface
interface SubscriptionData {
  subscription?: {
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  phoneNumber?: {
    number: string;
    status: string;
  };
}

// Define the payment result interface
interface PaymentResult {
  data: SubscriptionData;
}

const PaymentSuccessPage = () => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
  const searchParams = useSearchParams();
  const referenceId = searchParams.get('reference');

  const [selectedPhone, setSelectedPhone] = useState<SelectedPhoneData | null>(null);
  const [processingError, setProcessingError] = useState<string>('');
  const [subscriptionProcessed, setSubscriptionProcessed] = useState<boolean>(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false);

  // Check if referenceId exists
  useEffect(() => {
    if (!referenceId) {
      setProcessingError('Missing payment reference ID. Please check the URL and try again.');
    }
  }, [referenceId]);

  // Get selected phone data from localStorage on component mount
  useEffect(() => {
    try {
      const storedPhoneData = localStorage.getItem('selectedPhoneData');
      if (storedPhoneData) {
        const parsedData = JSON.parse(storedPhoneData);
        setSelectedPhone(parsedData);
      }
    } catch (err) {
      console.error('Error parsing phone data from localStorage:', err);
      setProcessingError('Could not retrieve selected phone number information.');
    }
  }, []);

  // Use the query hook to verify the payment
  const {
    data: paymentData,
    isLoading: isVerifyLoading,
    isError: isVerifyError,
    error: verifyError,
    isFetching: isVerifyFetching
  } = useVerifyPaymentQuery(referenceId || '', {
    skip: !referenceId
  });

  // Handle successful payment mutation
  const [
    handleSuccessfulPayment,
    {
      isLoading: isSubscriptionLoading,
      isError: isSubscriptionError,
      error: subscriptionError
    }
  ] = useHandleSuccessfulPaymentMutation();

  // First, verify the payment before proceeding to create subscription
  useEffect(() => {
    if (paymentData && !isVerifyLoading && !isVerifyError) {
      // Check if payment was successful based on the payment data
      if ((paymentData?.status as string) === 'success') {
        setPaymentVerified(true);
      } else {
        // Payment verification failed - show appropriate error
        setProcessingError(`Payment verification failed. Status: ${paymentData?.status}`);
      }
    }
  }, [paymentData, isVerifyLoading, isVerifyError]);

  // Only create subscription after payment is verified successfully
  useEffect(() => {
    if (paymentVerified && selectedPhone && !subscriptionProcessed) {
      // Call the mutation to handle subscription creation
      handleSuccessfulPayment({
        referenceId: referenceId || '',
        phoneNumberId: selectedPhone._id
      })
        .unwrap()
        .then((result) => {
          const paymentResult = result as unknown as PaymentResult;

          setSubscriptionData(paymentResult.data);
          setSubscriptionProcessed(true);

          // Remove the selected phone data from localStorage after payment is successful
          localStorage.removeItem('selectedPhoneData');
        })
        .catch((error) => {
          console.error('Failed to create subscription:', error);
          setProcessingError(
            error.data?.message || 'Failed to create subscription. Please contact support.'
          );
        });
    }
  }, [paymentVerified, selectedPhone, referenceId, handleSuccessfulPayment, subscriptionProcessed]);

  // Show error if payment verification API call failed
  useEffect(() => {
    if (isVerifyError && verifyError) {
      if ('data' in verifyError) {
        setProcessingError((verifyError as ErrorResponse).data?.message || 'An error occurred while verifying your payment.');
      } else {
        setProcessingError('Network error. Please check your connection and try again.');
      }
    }
  }, [isVerifyError, verifyError]);

  // Show error if subscription creation failed
  useEffect(() => {
    if (isSubscriptionError && subscriptionError) {
      if ('data' in subscriptionError) {
        setProcessingError((subscriptionError as ErrorResponse).data?.message || 'An error occurred while creating your subscription.');
      } else {
        setProcessingError('Network error. Please check your connection and try again.');
      }
    }
  }, [isSubscriptionError, subscriptionError]);

  // Show loading state while API call is in progress
  if (isVerifyLoading || isVerifyFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifying Payment...
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-sm text-gray-700">
                  Verifying your payment...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while subscription creation is in progress
  if (isSubscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Creating Subscription...
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-sm text-gray-700">
                  Setting up your phone number subscription...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {processingError || isVerifyError || isSubscriptionError || (paymentData && paymentData?.status !== 'success') ? (
            <XCircleIcon className="h-16 w-16 text-red-500" />
          ) : paymentVerified && subscriptionProcessed ? (
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="h-16 w-16 text-yellow-500" />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {processingError || isVerifyError || isSubscriptionError || (paymentData && paymentData?.status !== 'success') ?
            'Payment Verification Failed' :
            paymentVerified && subscriptionProcessed ? 'Payment Successful!' : 'Payment Information Unavailable'}
        </h2>
        {!processingError && !isVerifyError && !isSubscriptionError && paymentVerified && subscriptionProcessed && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you, {user?.firstName || 'User'}! Your payment has been received and your subscription is activated.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {processingError || isVerifyError || isSubscriptionError || (paymentData && paymentData?.status !== 'success') ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {processingError ||
                        (paymentData && paymentData?.status !== 'success' ?
                          `Payment verification failed. Status: ${paymentData?.status}` :
                          'Failed to verify payment or create subscription.')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/pricing"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Try Again
                </Link>
              </div>
            </div>
          ) : paymentVerified && subscriptionProcessed ? (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                  <div className="mt-2">
                    <div className="border border-[#F2F4F8] rounded-md divide-y divide-gray-200">
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Reference ID</span>
                        <span className="text-sm text-gray-900">{paymentData?.reference || referenceId}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Amount</span>
                        <span className="text-lg text-primary font-bold">
                          ${paymentData?.requested_amount}
                        </span>
                      </div>
                      <div className="px-4 py-3 flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Status</span>
                        <span className="text-sm text-green-600">{paymentData?.status}</span>
                      </div>
                      {paymentData?.transaction_date && (
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Date</span>
                          <span className="text-sm text-gray-900">
                            {new Date(paymentData?.transaction_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {subscriptionData && subscriptionData.subscription && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
                    <div className="mt-2">
                      <div className="border border-[#F2F4F8] rounded-md divide-y divide-gray-200">
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Plan</span>
                          <span className="text-sm text-gray-900 capitalize">{subscriptionData.subscription.plan}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Start Date</span>
                          <span className="text-sm text-gray-900">{new Date(subscriptionData.subscription.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">End Date</span>
                          <span className="text-sm text-gray-900">{new Date(subscriptionData.subscription.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Status</span>
                          <span className="text-sm text-green-600 capitalize">{subscriptionData.subscription.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {subscriptionData && subscriptionData.phoneNumber ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
                    <div className="mt-2">
                      <div className="border border-[#F2F4F8] rounded-md divide-y divide-gray-200">
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Number</span>
                          <span className="text-sm text-gray-900">{subscriptionData.phoneNumber.number}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Status</span>
                          <span className="text-sm text-green-600 capitalize">{subscriptionData.phoneNumber.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedPhone && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
                    <div className="mt-2">
                      <div className="border border-[#F2F4F8] rounded-md divide-y divide-gray-200">
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Number</span>
                          <span className="text-sm text-gray-900">{selectedPhone.phoneNumber}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Status</span>
                          <span className="text-sm text-green-600 capitalize">{selectedPhone.status}</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Type</span>
                          <span className="text-sm text-gray-900">{selectedPhone.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentData?.customer && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                    <div className="mt-2">
                      <div className="border border-[#F2F4F8] rounded-md divide-y divide-gray-200">
                        {paymentData?.customer.email && (
                          <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Email</span>
                            <span className="text-sm text-gray-900">{paymentData?.customer.email}</span>
                          </div>
                        )}
                        {paymentData?.customer.customer_code && (
                          <div className="px-4 py-3 flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Customer Code</span>
                            <span className="text-sm text-gray-900">{paymentData?.customer.customer_code}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Link
                    href="/dashboard"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Payment Data Found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The payment verification request did not return any data. This could be due to:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>The reference ID is invalid or has expired</li>
                      <li>The payment has not been processed yet</li>
                      <li>There might be an issue with the payment service</li>
                    </ul>
                    <p className="mt-2">Please contact support if you believe this is an error. Reference ID: {referenceId || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/pricing"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;