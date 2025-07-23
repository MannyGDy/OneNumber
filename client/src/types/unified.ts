export interface PaymentResponse {

  data?: {
    payment: {
      referenceId: string;
      amount: number;
      currency: string;
      status: string;
    };
    subscription: {
      id: string;
      plan: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    phoneNumber: {
      id: string;
      number: string;
      status: string;
    };
  };
}

export interface User {
  user: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: {
    phoneNumber: string;
    status: string;
    _id: string
  };
  isActive: boolean;
  _id: string;
  createdAt: string;
}

export interface ErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}


export interface PhoneNumber {
  _id: string;
  phoneNumber: string;
  user: {
    _id: string;
    email: string;
  } | null;
  status: 'available' | 'active' | 'reserved';
  reservedUntil: string | null;
  assignedTo?: string
  type: string;
  createdAt: string;
  updatedAt: string;
}

