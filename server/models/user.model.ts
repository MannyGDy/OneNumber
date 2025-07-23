// This code represents the proposed changes to your user.model.ts file

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BCRYPT_SALT_ROUNDS } from '../config/env';

// Update the interface for the User document
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: mongoose.Types.ObjectId;
  role: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  accountStatus: 'active' | 'inactive' | 'suspended'; // Add this status field
  accountActivatedAt?: Date; // Add this field to track when the account was activated
  platformSetupComplete?: boolean; // Optional: track if external platform setup is complete
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

// Update the schema to include accountStatus and activation date
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default in queries
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phoneNumber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhoneNumber",
    required: false,
    default: undefined // or just remove default entirely
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'inactive'
  },
  accountActivatedAt: {
    type: Date,
    default: null
  },
  platformSetupComplete: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

// Add a pre-save hook to set accountActivatedAt when status changes to 'active'
userSchema.pre('save', async function (next) {
  // If accountStatus is being modified and is now 'active'
  if (this.isModified('accountStatus') && this.accountStatus === 'active' && !this.accountActivatedAt) {
    this.accountActivatedAt = new Date();
  }
  next();
});

// Pre-save middleware for password hashing - keep as is
userSchema.pre('save', async function (this: IUser, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password - keep as is
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    // Use bcrypt to compare the provided password with the hashed password
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Add method to create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set expiry (30 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // Return unencrypted token (to be sent via email)
  return resetToken;
};

// Create and export the model
const User = mongoose.model<IUser>('User', userSchema);
export default User;