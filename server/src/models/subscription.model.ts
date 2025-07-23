import mongoose from "mongoose";

// Interface for methods
interface ISubscriptionMethods {
  cancel(): Promise<any>;
  renew(paymentReference: string): Promise<any>;
  isActive(): boolean;
}

// Main document interface
export interface ISubscription extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  number: mongoose.Types.ObjectId;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  paymentMethod: string;
  paymentReference: string;
  minutesUsed: number;
  renewalReminderSent: boolean;
  // New fields
  activationPending: boolean,
  scheduledStartDate: Date ,
  // Virtual property
  remainingDays?: number;
  // Methods
  cancel(): Promise<any>;
  renew(paymentReference: string): Promise<any>;
  isActive(): boolean;
}

export interface ISubscriptions extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  number: {
    phoneNumber: string;
    user: string;
    status: string;
    reservedUntil: string | null;
    type: string; 
  };
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  paymentMethod: string;
  paymentReference: string;
  minutesUsed: number;
  renewalReminderSent: boolean;
  // New fields
  activationPending: {
    type: Boolean,
    default: true  // Default to true since subscriptions will be pending activation
  },
  scheduledStartDate: {
    type: Date,
    default: null  // Will be set when admin activates the account
  }
  // Virtual property
  remainingDays?: number;
  // Methods
  cancel(): Promise<any>;
  renew(paymentReference: string): Promise<any>;
  isActive(): boolean;
}

// Define the schema with the proper type
const subscriptionSchema = new mongoose.Schema<ISubscription, mongoose.Model<ISubscription, {}, ISubscriptionMethods>>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    number: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhoneNumber",
      required: [true, "Number ID is required"],
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly", "standard", "lite", "premium"],
      required: [true, "Subscription plan is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "suspended"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "ussd", "wallet", "online"],
      required: [true, "Payment method is required"],
    },
    paymentReference: {
      type: String,
      required: [true, "Payment reference is required"],
    },
    minutesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    renewalReminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ number: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Virtual to calculate remaining days
subscriptionSchema.virtual("remainingDays").get(function (this: ISubscription) {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = Number(end) - Number(now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function (this: ISubscription): boolean {
  return this.status === "active" && new Date(this.endDate) > new Date();
};

// Method to renew subscription
subscriptionSchema.methods.renew = function (this: ISubscription, paymentReference: string) {
  const durationInMs = this.plan === "monthly" ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;

  // If subscription has expired, set new start date to now
  if (new Date(this.endDate) < new Date()) {
    this.startDate = new Date();
    this.endDate = new Date(Date.now() + durationInMs);
  } else {
    // Add duration to current end date
    this.endDate = new Date(new Date(this.endDate).getTime() + durationInMs);
  }

  this.status = "active";
  this.paymentReference = paymentReference;
  this.renewalReminderSent = false;
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function (this: ISubscription) {
  this.status = "cancelled";
  this.autoRenew = false;
  return this.save();
};

// Create and export the model with correct typing
const Subscription = mongoose.model<ISubscription, mongoose.Model<ISubscription, {}, ISubscriptionMethods>>("Subscription", subscriptionSchema);
export default Subscription;