// src/routes/adminRoutes.ts
import express from 'express';
import { register, login, forgotPassword, resetPassword, updatePassword, updateMe, deleteMe, refreshAccessToken, logout, getAllAdmins, getAdmin, toggleAdminStatus } from '../controllers/admin.controller';
import { isAuthenticated, authorizeRoles, updateAccessToken } from '../middleware/auth';

const adminRoutes = express.Router();

// Public routes
adminRoutes.post('/register', register);
adminRoutes.post('/login', login);
adminRoutes.post('/forgotPassword', forgotPassword);
adminRoutes.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
adminRoutes.use(updateAccessToken, isAuthenticated);

// Routes for logged-in admins
// adminRoutes.get('/me', authorizeRoles('admin'),);
adminRoutes.patch('/updateMyPassword', authorizeRoles('admin'), updatePassword);
adminRoutes.patch('/updateMe', authorizeRoles('admin'), updateMe);
adminRoutes.delete('/deleteMe', authorizeRoles('admin'), deleteMe);
adminRoutes.post('/refreshToken', authorizeRoles('admin'), refreshAccessToken);
adminRoutes.get('/logout', authorizeRoles('admin'), logout);

// Routes restricted to superadmin
adminRoutes.get('/', authorizeRoles('admin'), getAllAdmins);
adminRoutes.get('/:id', authorizeRoles('admin'), getAdmin);
adminRoutes.patch('/:id/toggleStatus', authorizeRoles('admin'), toggleAdminStatus);

export default adminRoutes;
