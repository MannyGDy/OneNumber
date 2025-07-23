import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the document
export interface IPhoneNumber extends Document {
  phoneNumber: string;
  user: mongoose.Types.ObjectId | null;
  status: 'available' | 'reserved' | 'active' | 'suspended';
  reservedUntil: Date | null;
  type: 'toll-free' | 'vanity';
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isAvailable(): boolean;
  reserve(userId: string, durationInMinutes?: number): Promise<IPhoneNumber>;
  activate(userId: string): Promise<IPhoneNumber>;
  release(): Promise<IPhoneNumber>;
}

// Define the schema
const phoneNumberSchema = new Schema<IPhoneNumber>(
  {
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,

    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null means the number is available
    },
    status: {
      type: String,
      enum: ["available", "reserved", "active", "suspended"],
      default: "available",
    },
    reservedUntil: {
      type: Date,
      default: null, // When reservation expires
    },
    type: {
      type: String,
      enum: ["toll-free", "vanity"],
      default: "vanity",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
phoneNumberSchema.index({ status: 1 });
phoneNumberSchema.index({ type: 1 });
phoneNumberSchema.index({ user: 1 });

// Method to check if number is available
phoneNumberSchema.methods.isAvailable = function (): boolean {
  return this.status === "available";
};

// Method to reserve number
phoneNumberSchema.methods.reserve = function (userId: string, durationInMinutes = 30): Promise<IPhoneNumber> {
  if (!this.isAvailable()) {
    throw new Error("Number is not available for reservation");
  }
  this.user = userId;
  this.status = "reserved";
  this.reservedUntil = new Date(Date.now() + durationInMinutes * 60000);
  return this.save();
};

// Method to activate number
phoneNumberSchema.methods.activate = function (userId: string): Promise<IPhoneNumber> {
  if (
    this.status !== "reserved" ||
    (this.user && this.user.toString() !== userId.toString())
  ) {
    throw new Error("Number is not reserved for this user");
  }
  this.status = "active";
  this.reservedUntil = null;
  return this.save();
};

// Method to release number
phoneNumberSchema.methods.release = function (): Promise<IPhoneNumber> {
  this.user = null;
  this.status = "available";
  this.reservedUntil = null;
  return this.save();
};

// Create and export the model
const PhoneNumber: Model<IPhoneNumber> = mongoose.model<IPhoneNumber>("PhoneNumber", phoneNumberSchema);

export default PhoneNumber;