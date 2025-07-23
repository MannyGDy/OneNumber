// Update these interfaces in your frontend types file

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  phoneNumber?: string;
}

export interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  user: string;
  status: string;
  reservedUntil: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface Subscription {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    phoneNumber?: string;
  } | null;
  number: {
    _id: string;
    phoneNumber: string;
    user: string;
    status: string;
    reservedUntil: string | null;
    type: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  } | null;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  paymentMethod: string;
  paymentReference: string;
  minutesUsed: number;
  renewalReminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CustomerInfo {
  id: number;
  customer_code: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface PaymentTransactionLog {
  start_time: string | null;
  time_spent: number;
  attempts: number;
  authentication: string | null;
  errors: number;
  success: boolean;
  mobile: boolean;
}

export interface PaymentTransaction {
  _id: string;
  reference: string;
  status: string;
  amount: string;
  currency: string;
  transaction_date: string | null;
  domain: string;
  gateway_response: string | null;
  channel: string | null;
  ip_address: string | null;
  log: PaymentTransactionLog;
  fees: number | null;
  customer: CustomerInfo;
  plan: string | null;
  requested_amount: string;
  verified: boolean;
  verifiedAt: Date | string;
  createdAt: string;
  updatedAt: string;
}

// This is the combined response type that your API returns
export interface SubscriptionResponses {
  success: boolean;
  data: {
    subscription: Subscription;
    paymentTransaction: PaymentTransaction | null;
  };
}