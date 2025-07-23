"use client";
import React, { } from 'react';
import { format } from 'date-fns';
import { useGetSubscriptionByIdQuery } from '@/redux/features/subscription/subscription';
import { useParams } from 'next/navigation';






// Status badge component with TypeScript props
type StatusBadgeProps = {
  status: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(status)}`}>
      {capitalize(status)}
    </span>
  );
};

// Data row component with TypeScript props
type DataRowProps = {
  label: string;
  value: React.ReactNode;
};

const DataRow: React.FC<DataRowProps> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600">{label}:</span>
    <div className="font-medium">{value}</div>
  </div>
);

// Helper function to capitalize the first letter of a string
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetSubscriptionByIdQuery(id || '') ;

  // Format dates for display
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'dd/MM/yyyy, HH:mm:ss');
  };

  if (isLoading) {
    return <div className="p-6">Loading transaction details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading transaction details.</div>;
  }

  if (!data || !data.data) {
    return <div className="p-6">No transaction data found.</div>;
  }

  const { subscription, paymentTransaction } = data.data; 

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#F2F4F8]">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>
            <div className="space-y-1">
              <DataRow
                label="Name"
                value={`${subscription?.user?.firstName ?? ''} ${subscription?.user?.lastName ?? ''}`}
              />
              <DataRow label="Email" value={subscription?.user?.email ?? ''} />
              <DataRow label="Phone Number" value={subscription?.number?.phoneNumber ?? ''} />
              <DataRow label="Phone Status" value={<StatusBadge status={subscription?.number?.status ?? ''} />} />
              <DataRow label="Phone Type" value={capitalize(subscription?.number?.type ?? '')} />
              <DataRow label="Account Created" value={formatDate(subscription?.user?.createdAt ?? '')} />
            </div>
          </div>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#F2F4F8]">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription Details</h2>
            <div className="space-y-1">
              <DataRow label="ID" value={subscription._id} />
              <DataRow label="Plan" value={capitalize(subscription.plan)} />
              <DataRow label="Status" value={<StatusBadge status={subscription.status} />} />
              <DataRow label="Start Date" value={formatDate(subscription.startDate)} />
              <DataRow label="End Date" value={formatDate(subscription.endDate)} />
              <DataRow label="Auto-Renew" value={subscription.autoRenew ? 'Yes' : 'No'} />
              <DataRow label="Created At" value={formatDate(subscription.createdAt)} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-[#F2F4F8] mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <DataRow label="Payment ID" value={paymentTransaction?._id} />
              <DataRow label="Reference ID" value={paymentTransaction?.reference} />
              <DataRow label="Amount" value={`${paymentTransaction?.currency} ${paymentTransaction?.requested_amount}`} />
              <DataRow label="Payment Method" value={capitalize(subscription.paymentMethod)} />
            </div>
            <div className="space-y-1">
              <DataRow label="Status" value={<StatusBadge status={paymentTransaction?.status ?? ''} />} />
              <DataRow label="Date" value={
                paymentTransaction?.transaction_date
                  ? paymentTransaction.transaction_date
                  : formatDate(paymentTransaction?.createdAt ?? '')
              } />
              <DataRow label="Verified At" value={
                paymentTransaction?.verifiedAt
                  ? formatDate((paymentTransaction.verifiedAt as string | Date).toString())
                  : 'Not verified'
              } />
              <DataRow label="Customer Email" value={paymentTransaction?.customer?.email ?? ''} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;