import { isAuthenticated, updateAccessToken } from "../middleware/auth";

import express from 'express';
const paymentRouter = express.Router();
import { createPaymentLink, verifyPayment, handleSuccessfulPaymentWithSubscription, handleCancelledPayment } from '../controllers/paymentLink.controller';

// Route to create a payment link
paymentRouter.post('/create-payment-link', updateAccessToken, isAuthenticated, createPaymentLink);

// Route to verify payment status
paymentRouter.get('/verify-payment/:referenceId', updateAccessToken, isAuthenticated, verifyPayment);

// Route to handle successful payment
paymentRouter.post('/success/:referenceId', updateAccessToken, isAuthenticated, handleSuccessfulPaymentWithSubscription);

// Route to handle cancelled payment
paymentRouter.get('/cancel/:referenceId', updateAccessToken, isAuthenticated, handleCancelledPayment);

export default paymentRouter;