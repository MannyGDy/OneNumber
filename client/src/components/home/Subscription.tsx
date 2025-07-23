"use client";
import React, { useMemo, useState } from 'react';
import { useGetSubscriptionsQuery } from '@/redux/features/subscription/subscription';





const SubscriptionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Subscription');
  const { data: subscriptionsResponse, error, isLoading } = useGetSubscriptionsQuery();

  // Memoize the primary subscription
  const primarySubscription = useMemo(() => {
    if (!subscriptionsResponse?.data || subscriptionsResponse.data.length === 0) {
      return null;
    }

    return subscriptionsResponse.data[0];
  }, [subscriptionsResponse]);

  // Mock payment history (since it's not in the provided data)
  const paymentHistory = [
    {
      purchase: primarySubscription?.plan ? `${primarySubscription.plan} Plan` : 'Subscription',
      status: 'Completed',
      amount: `$${primarySubscription?.price || 0}`,
      date: primarySubscription?.startDate ? new Date(primarySubscription.startDate).toLocaleDateString() : 'N/A',
      paymentStatus: 'Paid',
      type: primarySubscription?.paymentMethod || 'Card'
    }
  ];

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching subscriptions</p>;

  if (!primarySubscription) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 max-w-5xl sm:max-w-5xl mx-auto">
        <div className="flex items-center justify-center">
          <p className="text-gray-500 text-lg">You have no active subscriptions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 max-w-5xl sm:max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-20">
        <nav className="flex justify-start overflow-x-auto space-x-4 sm:space-x-8">
          <button
            onClick={() => setActiveTab('Subscription')}
            className={`py-2 sm:py-4 px-3 sm:px-1 text-sm font-medium whitespace-nowrap ${activeTab === 'Subscription'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab('Payment History')}
            className={`py-2 sm:py-4 px-3 sm:px-1 text-sm font-medium whitespace-nowrap ${activeTab === 'Payment History'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Payment History
          </button>
        </nav>
      </div>

      {/* Subscription Tab Content */}
      {activeTab === 'Subscription' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold capitalize text-gray-900">{primarySubscription.plan} Plan</h3>
                <p className="text-sm text-green-600 capitalize font-medium">Status: {primarySubscription.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Subscription</p>
                <p className="text-lg font-bold text-gray-900">${primarySubscription.price}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-700 space-y-3">
              <p>Start Date: {new Date(primarySubscription.startDate).toLocaleDateString()}</p>
              <p>End Date: {new Date(primarySubscription.endDate).toLocaleDateString()}</p>
              <p>Payment Method: {primarySubscription.paymentMethod}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Tab Content */}
      {activeTab === 'Payment History' && (
        <div>
          {/* Mobile View - Card Layout */}
          <div className="block sm:hidden space-y-4">
            {paymentHistory.map((payment, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-5"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{payment.purchase}</p>
                    <p className="text-sm text-green-600">{payment.status}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    {payment.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Amount</span>
                  <span className='font-semibold'>{payment.amount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Payment Date</span>
                  <span>{payment.date}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Type</span>
                  <span>{payment.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b border-gray-200 text-gray-500 text-sm">
              <div>Purchases</div>
              <div>Amount</div>
              <div>Payment Date</div>
              <div>Payment Status</div>
            </div>
            {paymentHistory.map((payment, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 py-4 border-b border-gray-200 items-center"
              >
                <div>
                  <p className="font-medium capitalize text-gray-900">{payment.purchase}</p>
                  <p className="text-sm text-green-600">{payment.status}</p>
                </div>
                <div className="text-gray-700 font-semibold ml-2">{payment.amount}</div>
                <div className="text-gray-700">{payment.date}</div>
                <div>
                  <span className="bg-green-100 ml-6 text-green-800 px-2 py-1 rounded-full text-xs">
                    {payment.paymentStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 capitalize">Method: {payment.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;