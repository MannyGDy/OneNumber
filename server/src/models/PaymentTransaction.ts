// models/PaymentTransaction.ts
import mongoose, { Document, Schema } from 'mongoose';

interface LogEntry {
  type: string;
  message: string;
  time: number;
}

interface CustomerInfo {
  id: number;
  customer_code: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface IPaymentTransaction extends Document {
  reference: string;
  status: { type: String, enum: ['success', 'failed', 'pending', 'cancelled', 'refunded', 'no-show'] };
  amount: string;
  currency: string;
  transaction_date: string | null;
  domain: string;
  gateway_response: string | null;
  channel: string | null;
  ip_address: string | null;

  fees: number | null;
  customer: CustomerInfo;
  plan: string | null;
  requested_amount: string;
  verified: boolean;
  verifiedAt: Date;
}



const CustomerInfoSchema = new Schema({
  id: { type: Number,  },
  customer_code: { type: String,  },
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String,  }
});

const PaymentTransactionSchema = new Schema({
  reference: { type: String, unique: true },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'cancelled', 'refunded', 'no-show'],
    
  },
  amount: { type: String,  },
  currency: { type: String, default: 'NGN' },
  transaction_date: { type: String, default: null },
  domain: { type: String, default: 'test' },
  gateway_response: { type: String, default: null },
  channel: { type: String, default: null },
  ip_address: { type: String, default: null },
 
  fees: { type: Number, default: null },
  customer: { type: CustomerInfoSchema,  },
  plan: { type: String, default: null },
  requested_amount: { type: String,  },
  verified: { type: Boolean, default: true },
  verifiedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);