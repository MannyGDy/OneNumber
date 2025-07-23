// types/unified.ts or types/payment.ts

// Customer information in the payment response
export interface CustomerInfo {
  id: number;
  customer_code: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

// Log history entry in the payment response
export interface LogEntry {
  type: string;
  message: string;
  time: number;
}

// Log information in the payment response
export interface PaymentLog {
  start_time: string | null;
  time_spent: number;
  attempts: number;
  authentication: string | null;
  errors: number;
  success: boolean;
  mobile: boolean;
  history: LogEntry[];
}

// Main Payment type that matches BudPay's verification response
export interface PaymentVerificationResponse {
  status: 'success' | 'failed' | 'pending';
  amount: string;
  currency: string;
  transaction_date: string | null;
  reference: string;
  domain: string;
  gateway_response: string | null;
  channel: string | null;
  ip_address: string | null;
  log: PaymentLog;
  fees: number | null;
  customer: CustomerInfo;
  plan: string | null;
  requested_amount: string;
}

// Error response interface
export interface ErrorResponse {
  data?: {
    message: string;
    status: boolean;
  };
  status?: number;
}

// Response wrapper for successful payment verification
export interface SuccessPaymentResponse {
  status: boolean;
  message: string;
  data: {
    payment: {
      _id: string;
      amount: number;
      currency: string;
      status: string;
      referenceId: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    };
    subscription?: {
      _id: string;
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      userId: string;
      paymentId: string;
      createdAt: string;
      updatedAt: string;
    };
    phoneNumber?: {
      _id: string;
      number: string;
      status: string;
      userId: string;
      subscriptionId: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}