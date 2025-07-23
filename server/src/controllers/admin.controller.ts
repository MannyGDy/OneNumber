// src/controllers/adminController.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Admin, { IAdmin } from '../models/admin.model';
import AppError from '../utils/appError';
import { sendToken } from "../utils/jwt";
import { CatchAsyncError } from '../middleware/catchAsyncErrors';
import emailService from '../services/email.service';



declare module 'express-serve-static-core' {
  interface Request {
    admin?: IAdmin;
  }
}


// REGISTER A NEW ADMIN (Super Admin Only)
export const register = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  // if (!user) {
  //   return next(new AppError('You are not logged in! Please log in to get access.', 401));
  // }

  // if (user.role !== 'admin') {
  //   return next(new AppError('Only super-admins can register new admins', 403));
  // }

  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return next(new AppError('Please provide all required fields', 400));
  }


  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError('Admin already exists', 400));
  }

  await Admin.create({
    email,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    status: 'success',
    message: 'Admin created successfully',
  });
});

// LOGIN
export const login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if admin exists && password is correct
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if admin account is active
  if (!admin.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact the super admin.', 401));
  }

  // Update last login time
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // If everything ok, send token to client
  await sendToken(admin, 200, res, "admin");
});

// LOGOUT
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

// REFRESH TOKEN
export const refreshAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('No refresh token found', 401));
  }

  // Find admin with this refresh token
  const admin = await Admin.findOne({ refreshToken });

  if (!admin) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Generate new token
  await sendToken(admin, 200, res, "admin");
});

// UPDATE PASSWORD
export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get admin from collection
  const admin = await Admin.findById(req.admin?.id).select('+password');

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // 2) Check if POSTed current password is correct
  if (!(await admin.comparePassword(req.body.currentPassword))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If so, update password
  admin.password = req.body.newPassword;
  await admin.save();

  // 4) Log admin in, send JWT
  await sendToken(admin, 200, res, "admin");
});

// FORGOT PASSWORD
export const forgotPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get admin based on POSTed email
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return next(new AppError('There is no admin with that email address.', 404));
  }

  // 2) Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  admin.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  admin.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await admin.save({ validateBeforeSave: false });

  // 3) Send it to admin's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/admins/resetPassword/${resetToken}`;

  await emailService.sendPasswordResetEmail(admin, resetToken, resetURL);

  try {
    await emailService.sendAdminEmail(admin, 'admin-password-reset', `Password Reset Request: ${admin.email}`, {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        requestTime: new Date()
      }
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

// RESET PASSWORD
export const resetPassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get admin based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is an admin, set the new password
  if (!admin) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  admin.password = req.body.password;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  // 3) Update passwordChangedAt property (handled by a pre-save middleware)

  // 4) Log the admin in, send JWT
  await sendToken(admin, 200, res, "admin");
});

// GET CURRENT ADMIN PROFILE
export const getAdminProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await Admin.findById(req.user?._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// GET ADMIN
export const getAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new AppError('No admin found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

// UPDATE ADMIN PROFILE
export const updateMe = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Create error if admin tries to update password
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }

  // 2) Filtered out unwanted fields that are not allowed to be updated
  const filteredBody: any = {};
  const allowedFields = ['firstName', 'lastName', 'email'];
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  // 3) Update admin document
  const updatedAdmin = await Admin.findByIdAndUpdate(req.admin?.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      admin: updatedAdmin
    }
  });
});

// DELETE (DEACTIVATE) ADMIN
export const deleteMe = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  await Admin.findByIdAndUpdate(req.admin?.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// GET ALL ADMINS (SUPER ADMIN ONLY)
export const getAllAdmins = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admins = await Admin.find();

  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins
    }
  });
});

// ACTIVATE/DEACTIVATE ADMIN (SUPER ADMIN ONLY)
export const toggleAdminStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new AppError('No admin found with that ID', 404));
  }

  // Toggle isActive status
  admin.isActive = !admin.isActive;
  await admin.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

