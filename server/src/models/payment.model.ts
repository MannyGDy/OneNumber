import mongoose, { Document, Schema } from 'mongoose';

interface IPaymentLink extends Document {
  userId: mongoose.Types.ObjectId;
  referenceId: string;
  amount: number;
  currency: string;
  status: string;
  name: string;
  redirectUrl: string;
  createdAt: Date;
  description: string;
  expiresAt: Date;
  completedAt: Date;
  cancelledAt: Date;
  metadata: {
    planType: string;
    clientIp: string;
    userAgent: string;
  };
}

const PaymentLinkSchema: Schema<IPaymentLink> = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referenceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  redirectUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'expired', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  metadata: {
    planType: String,
    clientIp: String,
    userAgent: String
  }
});

// Create indexes for faster queries
PaymentLinkSchema.index({ status: 1 });
PaymentLinkSchema.index({ createdAt: 1 });
PaymentLinkSchema.index({ expiresAt: 1 });

// Add validation for expiry dates
PaymentLinkSchema.path('expiresAt').validate(function (value: any) {

  return value > this.createdAt;
}, 'Expiry date must be after creation date');

// Add pre-save middleware for additional security checks
PaymentLinkSchema.pre('save', function (next: any) {
  // Additional validation or sanitization can go here
  if (this.expiresAt < this.createdAt) {
    throw new Error('Expiry date must be after creation date');
  }
  next();
});

const PaymentLink = mongoose.model<IPaymentLink>('PaymentLink', PaymentLinkSchema);

export default PaymentLink;