import { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncErrors';
import User from '../models/user.model';
import AppError from '../utils/appError';
import crypto from 'crypto';

import Admin from '../models/admin.model'; // Import Admin model

import { sendToken } from '../utils/jwt';
import { IUser } from '../models/user.model';
import { IAdmin } from '../models/admin.model';
import emailService from '../services/email.service';
import { notifyUserActivation, notifyUserRegistration } from '../services/notification.service';
import PhoneNumber from '../models/phoneNumber.model';
import Subscription from '../models/subscription.model';
import { addWorkingDays } from '../utils/dateCalculation.';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser | IAdmin;
  }
}


// USER REGISTRATION
export const registerUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  // Create user with unverified email status
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    isEmailVerified: false, // Ensure email is not verified yet
  });

  // Generate verification code (6 digits)
  const verificationCode = crypto.randomInt(100000, 999999).toString();

  // // Save to user
  user.emailVerificationCode = verificationCode;

  user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
  await user.save({ validateBeforeSave: false });

  try {
    // Find admin for notification
    const admin = await Admin.findOne({ role: 'admin' });
    if (!admin) {
      return next(new AppError('System error: Admin user not found', 500));
    }

    // // Send verification email to user
    await emailService.sendEmailVerification(user, verificationCode);

    // // Also notify admin about new registration
    await emailService.sendWelcomeEmail(admin, user);

    await notifyUserRegistration(user);

    res.status(201).json({
      status: 'success',
      message: 'Account created! Please verify your email address to activate your account.',
      userId: user._id
    });
  } catch (err) {
    // If error, reset verification fields
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
  }
});

// USER VERIFICATION
export const verifyEmail = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;
  const { userId } = req.params; // Get userId from params instead of requiring login

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (!code) {
    return next(new AppError('Please provide the verification code', 400));
  }

  // Find user with matching code that hasn't expired
  const user = await User.findOne({
    _id: userId,
    emailVerificationCode: code,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification code', 400));
  }

  // Mark email as verified and clear verification fields
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Auto-login the user after verification
  await sendToken(user, 200, res, "user");
});

// USER LOGIN
export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }


  if (!user.isEmailVerified) {
    return next(new AppError('Your account has not been verified. Please verify your email address before logging in.', 401));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove password from user object before sending token
  user.password = "";

  await sendToken(user, 200, res, "user");
});

// USER LOGOUT
export const logout = (req: Request, res: Response) => {
  res.cookie('access_token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.cookie('refresh_token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

export const forgotPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on email
  const { email } = req.body;


  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If this email is associated with an account, a reset link will be sent.'
    });
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    // Find admin user for notifications
    const admin = await Admin.findOne({ role: 'admin' });

    if (!admin) {
      return next(new AppError('System error: Admin user not found', 500));
    }

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken, resetUrl);

    // Send notification to admin about password reset request
    await emailService.sendAdminEmail(admin, 'admin-password-reset', `Password Reset Request: ${user.email}`, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        requestTime: new Date()
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email'
    });
  } catch (err) {
    // If there's an error, reset the token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

export const resetPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from params
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  // Hash the token to compare with the stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with the token and check if token expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Update user's password and clear reset token fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Find admin for notification
  const admin = await Admin.findOne({ role: 'admin' });
  if (admin) {
    // Notify admin about password reset
    await emailService.sendAdminEmail(admin, 'admin-password-reset-complete', `Password Reset Completed: ${user.email}`, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        resetTime: new Date()
      }
    });
  }

  // Log the user in by sending a token
  await sendToken(user, 200, res, "user");
});

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get admin from collection

  const user = await User.findById(req.user?._id).select('+password');

  if (!user) {
    return next(new AppError('user not found', 404));
  }

  // 2) Check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) Check if POSTed new password is correct
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  await user.save();

  // 4) Log user in, send JWT
  await sendToken(user, 200, res, "admin");
});


// REQUEST EMAIL VERIFICATION (For users who need to re-verify their email)
export const requestEmailVerification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Get current user
  const { userId } = req.body; 

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate verification code (6 digits)
  const verificationCode = crypto.randomInt(100000, 999999).toString();


  // Save to user
  user.emailVerificationCode = verificationCode;
  user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry
  await user.save({ validateBeforeSave: false });

  try {
    // Send verification email
    await emailService.sendEmailVerification(user, verificationCode);

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent to your email'
    });
  } catch (err) {
    // If error, reset verification fields
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
  }
});


// GET USER PROFILE
export const getUserProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).populate('phoneNumber');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// UPDATE USER PROFILE
export const updateUserProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const updates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address
  };

  // Email updates require verification
  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    return next(new AppError('User not found', 404));
  }

  const emailChanged = req.body.email && req.body.email !== currentUser.email;

  if (emailChanged) {
    // If email is changed, mark as unverified and generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();


    currentUser.email = req.body.email;
    currentUser.isEmailVerified = false;
    currentUser.emailVerificationCode = verificationCode;
    currentUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    Object.assign(currentUser, updates);
    await currentUser.save({ validateBeforeSave: false });

    // Send verification email to new address
    await emailService.sendEmailVerification(currentUser, verificationCode);

    res.status(200).json({
      success: true,
      message: 'Profile updated. Please verify your new email address.',
      user: currentUser
    });
  } else {
    // For non-email updates, proceed normally
    const user = await User.findByIdAndUpdate(req.user?._id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  }
});



// ADMIN USER MANAGEMENT CONTROLLERS

// GET ALL USERS (Admin Only)
export const getAllUsers = CatchAsyncError(async (req: Request, res: Response) => {
  const users = await User.find().populate('phoneNumber');

  res.status(200).json({
    success: true,
    users
  });
});

// GET USER BY ID (Admin Only)
export const getUserById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).populate('phoneNumber');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    success: true,
    user
  });
});

// UPDATE USER (Admin Only)
export const updateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const updates = {
    role: req.body.role,
    isActive: req.body.isActive,
    ...req.body
  };

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// DELETE USER (Admin Only)
export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Unassign phone number from user
export const unassignPhoneNumber = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  // Find the user
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user has a phone number assigned
  if (!user.phoneNumber) {
    return next(new AppError('User does not have a phone number assigned', 400));
  }

  // Get the phone number ID
  const phoneNumberId = user.phoneNumber;

  // Find the phone number
  const phoneNumber = await PhoneNumber.findById(phoneNumberId);

  if (!phoneNumber) {
    return next(new AppError('Phone number not found', 404));
  }

  // Update the phone number to be available
  phoneNumber.status = 'available';
  phoneNumber.user = null;
  phoneNumber.reservedUntil = null;
  await phoneNumber.save();

  // Remove phone number from user
  user.phoneNumber = undefined;
  await user.save();

  // Notify user about unassigned number
  try {
    // await emailService.sendPhoneNumberUnassignedNotice(user, phoneNumber.phoneNumber);
  } catch (error) {
    console.error('Failed to send unassignment notification:', error);
  }

  return res.status(200).json({
    success: true,
    message: 'Phone number unassigned successfully',
    user,
    phoneNumber
  });
});

/**
 * Controller for admin to activate a user account and set subscription start date
 * @route PUT /api/v1/admin/users/:userId/activate
 * @access Admin only
 */
export const activateUserAccount = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user already active
  if (user.accountStatus === 'active') {
    return next(new AppError('User account is already active', 400));
  }

  // Update user status to active
  user.accountStatus = 'active';
  await user.save();

  // Find all subscriptions for this user
  const subscriptions = await Subscription.find({
    user: userId,
    status: { $in: ['active', 'pending'] }
  });

  // Calculate a start date that is at least 5 working days from now
  const startDate = addWorkingDays(new Date(), 5);

  // Update all subscriptions with the new start date
  const updatedSubscriptions = [];

  for (const subscription of subscriptions) {
    // Calculate the duration between original start and end date
    const originalDuration = subscription.endDate.getTime() - subscription.startDate.getTime();

    // Set the new start date
    subscription.startDate = startDate;

    // Keep the same duration by adjusting the end date
    subscription.endDate = new Date(startDate.getTime() + originalDuration);

    // Save the subscription
    await subscription.save();

    updatedSubscriptions.push({
      id: subscription._id,
      plan: subscription.plan,
      startDate: subscription.startDate,
      endDate: subscription.endDate
    });
  }

  // Try to send notification and email
  try {
    // Notify user about account activation
    await notifyUserActivation(user);

    // Send email to user about account activation
    await emailService.sendAccountActivationEmail(user, startDate);
  } catch (error) {
    console.error('Failed to send activation notification:', error);
    // Continue execution even if notification/email fails
  }

  // Send successful response
  res.status(200).json({
    success: true,
    message: 'User account activated successfully',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountStatus: user.accountStatus
    },
    subscriptions: updatedSubscriptions,
    subscriptionStartDate: startDate
  });
});