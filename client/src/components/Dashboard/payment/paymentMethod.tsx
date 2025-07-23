"use client"

import React, { useState } from 'react';
import { PlusIcon, CreditCardIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// Dummy data
const paymentMethods = [
  { id: 1, type: 'Visa', last4: '4242', expMonth: 12, expYear: 2028, isDefault: true },
  { id: 2, type: 'Mastercard', last4: '5555', expMonth: 8, expYear: 2026, isDefault: false },
];

const billingHistory = [
  { id: 1, date: 'Feb 15, 2025', amount: '₦12,500', status: 'paid', plan: 'Premium Business' },
  { id: 2, date: 'Jan 15, 2025', amount: '₦12,500', status: 'paid', plan: 'Premium Business' },
  { id: 3, date: 'Dec 15, 2024', amount: '₦12,500', status: 'paid', plan: 'Premium Business' },
  { id: 4, date: 'Nov 15, 2024', amount: '₦10,000', status: 'paid', plan: 'Standard Business' },
];

const PaymentsPage = () => {

  const [newCardModal, setNewCardModal] = useState(false);



  return (
    <div className="flex bg-gray-50">

      <main className="md:pl-72 pt-20 md:pt-0 justify-center items-center  mx-auto w-full">
        <div className="p-6 justify-between items-center  max-w-7xl md:w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment methods and view billing history</p>
          </header>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Payment Methods</h2>
              <button
                onClick={() => setNewCardModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center gap-2 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add New Card</span>
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border border-[#F2F4F8] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      <CreditCardIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-md font-medium text-gray-900">{method.type} •••• {method.last4}</h3>
                        {method.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-red-600 p-1 rounded-md hover:bg-gray-100">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {!method.isDefault && (
                      <button className="ml-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Make Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Download All</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billingHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <button>
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* New Card Modal */}
      {newCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Payment Method</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  id="cardName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expDate" className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="text"
                    id="expDate"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="defaultCard"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="defaultCard" className="ml-2 text-sm text-gray-700">Make this my default payment method</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setNewCardModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setNewCardModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;