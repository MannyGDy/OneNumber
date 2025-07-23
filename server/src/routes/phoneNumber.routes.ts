import express from 'express';
import {
  addPhoneNumber,
  uploadPhoneNumbersCsv,
  getAllPhoneNumbers,
  getAvailablePhoneNumbers,
  getTakenPhoneNumbers,
  getPhoneNumber,
  updatePhoneNumberStatus,
  deletePhoneNumber,
  getPhoneNumberStats
} from '../controllers/phoneNumber.controller';
import { isAuthenticated, authorizeRoles, updateAccessToken } from '../middleware/auth';
import upload from '../middleware/multerConfig';

const phoneNumberRouter = express.Router();

// Public routes (if any)

// User routes - require authentication
phoneNumberRouter.get('/available', getAvailablePhoneNumbers);
phoneNumberRouter.use(updateAccessToken, isAuthenticated);

phoneNumberRouter.get('/:id', getPhoneNumber);
phoneNumberRouter.put('/:id/reserve', async (req, res) => {
  // Add user ID from authenticated user
  req.body.userId = req.user?._id;
  req.body.status = 'reserved';
  await updatePhoneNumberStatus(req, res);
});

// Admin routes - require admin role
phoneNumberRouter.post('/add', authorizeRoles('admin'), addPhoneNumber);
phoneNumberRouter.post('/upload', authorizeRoles('admin'), upload.single('csv'), uploadPhoneNumbersCsv);
phoneNumberRouter.get('/', authorizeRoles('admin'), getAllPhoneNumbers);
phoneNumberRouter.get('/taken', authorizeRoles('admin'), getTakenPhoneNumbers);
phoneNumberRouter.get('/stats', authorizeRoles('admin'), getPhoneNumberStats);
phoneNumberRouter.put('/:id/status', authorizeRoles('admin'), updatePhoneNumberStatus);
phoneNumberRouter.delete('/:id', authorizeRoles('admin'), deletePhoneNumber);

export default phoneNumberRouter;