import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  logout,
  verifyEmail,
  requestEmailVerification,
  forgotPassword,
  resetPassword,
  unassignPhoneNumber,
  getUserById,
  activateUserAccount
} from '../controllers/user.controller';
import { isAuthenticated, authorizeRoles, updateAccessToken } from '../middleware/auth';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/password/forgot', forgotPassword);
userRouter.patch('/password/reset/:token', resetPassword);

// verify email
userRouter.post('/verify-email/:userId', verifyEmail); // No auth required - user verifies from email link
userRouter.post('/request-verification',  requestEmailVerification);
userRouter.put('/:userId/active', activateUserAccount)

// Protected routes
userRouter.use(updateAccessToken, isAuthenticated);

// Protected routes - require authentication
userRouter.get("/logout", logout);
userRouter.get('/profile', getUserProfile);
userRouter.put('/profile', updateUserProfile);
// Password update
userRouter.patch('/update-password', isAuthenticated, updateUserProfile);

// Admin routes - require authentication and admin role
userRouter.get('/admin/users', authorizeRoles('admin'), getAllUsers);
userRouter.put('/admin/user/:id', authorizeRoles('admin'), updateUser);
userRouter.delete('/admin/user/:id', authorizeRoles('admin'), deleteUser);
userRouter.patch('/admin/unassign-phone/:userId', authorizeRoles('admin'), unassignPhoneNumber);
userRouter.get('/admin/user/:id', authorizeRoles('admin'), getUserById);


export default userRouter;