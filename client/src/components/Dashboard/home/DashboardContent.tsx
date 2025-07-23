import React, { useMemo } from 'react';
import {
  Clock,
  DollarSign,
  User,
  Phone,
  Calendar,
  CreditCard,
  Mail,
  Shield
} from 'lucide-react';
import { RootState, useDispatch, useSelector } from '@/redux/store';
import { Subscription } from "@/types/subsction";
import { useGetSubscriptionsQuery } from '@/redux/features/subscription/subscription';
import { apiSlice } from '@/redux/features/api/apiSlice';

const UserDashboardHome: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: subscriptionsResponse, error, isLoading } = useGetSubscriptionsQuery();
  const dispatch = useDispatch();
  dispatch(apiSlice.endpoints.loadUser.initiate());

  // Calculate remaining days
  const calculateRemainingDays = (startDate: string, endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();

    if (end < today) return 0;

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Memoize the primary subscription
  const primarySubscription = useMemo(() => {
    if (!subscriptionsResponse?.data || subscriptionsResponse.data.length === 0) {
      return null;
    }

    return subscriptionsResponse.data.find((sub: Subscription) => sub.status === 'active')
      || subscriptionsResponse.data[0];
  }, [subscriptionsResponse]);

  // Loading and error states
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching subscriptions</p>;

  return (
    <div className="bg-gray-50 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between flex-col mb-8">
        <h1 className="md:text-3xl text-2xl font-bold text-gray-900">Welcome to OneNumber</h1>
        <div className="flex text-gray-600 md:text-2xl items-center gap-4">
          <p className='text-gray-600 md:text-xl text-lg'>
            {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="md:text-xl text-lg font-semibold text-gray-800">Subscription</h2>
            <Clock className="text-blue-500" />
          </div>
          {primarySubscription ? (
            <div>
              <p className="md:text-2xl text-xl font-bold text-gray-900 capitalize">
                {primarySubscription.plan} Plan
              </p>
              <p className="text-gray-500 text-sm">
                {calculateRemainingDays(
                  primarySubscription.startDate,
                  primarySubscription.endDate
                )} days remaining
              </p>
              <div className="mt-4 flex items-center">
                <span className={`
                  px-3 py-1 rounded-full text-sm mr-2
                  ${primarySubscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  {primarySubscription.status}
                </span>

              </div>
            </div>
          ) : (
            <p>No active subscription found</p>
          )}
        </div>

        {/* User Profile Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="md:text-xl text-lg font-semibold text-gray-800">Profile</h2>
            <User className="text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="mr-3 text-gray-500" />
              <p className="text-gray-700">{user?.email.slice(0, 2)}******{user?.email.slice(8, 30)}</p>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 text-gray-500" />
              <p className="text-gray-700">{user?.phoneNumber?.phoneNumber}</p>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-3 text-gray-500" />
              <p className="text-gray-700">
                Joined: {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center">
              <Shield className="mr-3 text-gray-500" />
              <p className="text-gray-700 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Number Details Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Phone Number</h2>
            <Phone className="text-purple-500" />
          </div>
          {primarySubscription?.number ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="mr-3 text-gray-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {primarySubscription.number.phoneNumber}
                </p>
              </div>
              <div className="flex items-center">
                <CreditCard className="mr-3 text-gray-500" />
                <p className="text-gray-700 capitalize">
                  Number Type: {primarySubscription.number.type}
                </p>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-gray-500" />
                <p className="text-gray-700">
                  Registered: {new Date(primarySubscription.number.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4">
                <span className={`
                  px-3 py-1 rounded-full text-sm
                  ${primarySubscription.number.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  {primarySubscription.number.status}
                </span>
              </div>
            </div>
          ) : (
            <p>No number details available</p>
          )}
        </div>

        {/* Billing Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Billing</h2>
            <DollarSign className="text-purple-500" />
          </div>
          {primarySubscription ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <DollarSign className="mr-3 text-gray-500" />
                <p className="text-2xl font-bold text-gray-900">
                  ${primarySubscription.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center">
                <CreditCard className="mr-3 text-gray-500" />
                <p className="text-gray-700">
                  Payment Method: {primarySubscription.paymentMethod}
                </p>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-gray-500" />
                <p className="text-gray-700">
                  Subscription Period:
                  {new Date(primarySubscription.startDate).toLocaleDateString()}
                  {' - '}
                  {new Date(primarySubscription.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Payment Reference: {primarySubscription.paymentReference}
                </p>
              </div>
            </div>
          ) : (
            <p>No billing information available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardHome;