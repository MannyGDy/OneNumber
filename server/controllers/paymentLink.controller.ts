import crypto from 'crypto';
import { Request, Response } from 'express';
// import logger from '../utils/logger';
import PaymentLink from '../models/payment.model';
import mongoose from 'mongoose';
import User from '../models/user.model';
import PhoneNumber from '../models/phoneNumber.model';
import Subscription, { ISubscription, ISubscriptions } from '../models/subscription.model';
import { notifySubscriptionCreated } from '../services/notification.service';
import { sendSubscriptionCreatedEmail } from '../services/email.service';
import Admin from '../models/admin.model';
import axios from 'axios';
import { PaymentTransaction } from '../models/PaymentTransaction';

// Define interfaces for API responses and requests


interface CreatePaymentLinkRequest {
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  planType?: 'lite' | 'standard' | 'premium';
  redirect: string;
  userId: mongoose.Types.ObjectId;
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface BudPayApiResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}


/**
 * Create a payment link based on selected plan
 * @route POST /api/v/create-payment-link
 */

export const createPaymentLink = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const { description, planType } = req.body as CreatePaymentLinkRequest;

    // Type safety for user data
    const user = req.user as User | undefined;
    const userId = user?._id;
    const email = user?.email;
    const name = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Customer';

    const currency = 'NGN';
    // Ensure FRONTEND_URL is defined and properly sanitized
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return res.status(500).json({
        status: false,
        message: 'Server configuration error'
      });
    }


    const redirect = `${frontendUrl}/payment-success/`;
    // Generate cryptographically secure reference ID
    const reference = crypto.randomBytes(16).toString('hex');

    // Determine amount based on plan type with strict validation
    let amount = 0;
    switch (planType) {
      case 'lite':
        amount = 16500;
        break;
      case 'standard':
        amount = 33000;
        break;
      case 'premium':
        amount = 82500;
        break;
      default:
        return res.status(400).json({
          status: false,
          message: 'Invalid plan type'
        });
    }

    // Enhanced validation
    if (!email || !userId) {
      return res.status(400).json({
        status: false,
        message: 'Authentication required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format'
      });
    }

    try {
      // Check for API key
      const budpaySecretKey = process.env.BUDPAY_SECRET_KEY;
      if (!budpaySecretKey) {
        return res.status(500).json({
          status: false,
          message: 'Payment service configuration error'
        });
      }

      // Safely limit metadata
      const sanitizedUserAgent = (req.headers['user-agent'] || '').substring(0, 255);
      const clientIp = req.ip || 'unknown';

      // Call BudPay API to initialize transaction
      const response = await axios.post<BudPayApiResponse>(
        'https://api.budpay.com/api/v2/transaction/initialize',
        {
          email,
          currency,
          amount: amount.toString(),
          callback: redirect,
          full_name: name,
          reference: `OneNumber-${reference}`,
          
        },
        {
          headers: {
            'Authorization': `Bearer ${budpaySecretKey}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Type validation for response
      if (!response.data?.data?.authorization_url ||
        !response.data?.data?.access_code ||
        !response.data?.data?.reference) {
        return res.status(500).json({
          status: false,
          message: 'Invalid response from payment provider'
        });
      }

      // Extract relevant data from response
      const {
        authorization_url,
        access_code,
        reference: paymentReference
      } = response.data.data;

      // Store payment details in database
      const newPaymentLink = new PaymentLink({
        userId,
        referenceId: paymentReference,
        amount,
        name,
        currency,
        description: description || `Payment for ${planType} plan`,
        redirectUrl: redirect,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
        metadata: {
          planType,
          clientIp,
          userAgent: sanitizedUserAgent,
        }
      });

      await newPaymentLink.save();

      // Return success response with payment details
      return res.status(201).json({
        status: true,
        message: "Authorization URL created successfully",
        data: {
          authorization_url,
          access_code,
          reference: paymentReference
        }
      });
    } catch (apiError: unknown) {
      // Properly type the error
      const error = apiError as Error & {
        response?: {
          status?: number;
          data?: unknown;
        }
      };

      console.error('BudPay API error:', error.response?.data || error.message);

      return res.status(error.response?.status || 500).json({
        status: false,
        message: 'Error from payment provider',
        error: process.env.NODE_ENV === 'development' ?
          (error.response?.data || error.message) : undefined
      });
    }
  } catch (error: unknown) {
    // Properly type the error
    const err = error as Error;

    console.error('Error creating payment link:', err);

    return res.status(500).json({
      status: false,
      message: 'An error occurred while creating payment link',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


/**
 * Verify payment status
 * @route GET /api/v1/verify-payment/:referenceId
 */
export const verifyPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { referenceId } = req.params;
    const user = req.user;

    // Validate request parameters
    if (!referenceId) {
      return res.status(400).json({
        status: false,
        message: 'Reference ID is required'
      });
    }

    // Ensure user is authenticated
    if (!user || !user.id) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    // Check if transaction already exists
    const existingTransaction = await PaymentTransaction.findOne({ reference: referenceId });

    console.log('Existing transaction:', existingTransaction);

    // If transaction exists, verify ownership before returning data
    if (existingTransaction) {
      // Check if user is admin or the owner of this transaction
      const isAdmin = user.role === 'admin';
      const isOwner = existingTransaction.customer?.id === user.id ||
        existingTransaction.customer?.email === user.email;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          status: false,
          message: 'You are not authorized to access this transaction information'
        });
      }

      return res.status(200).json(existingTransaction);
    }

    // Verify with BudPay using a secure HTTPS connection
    const budpayResponse = await axios.get(
      `https://api.budpay.com/api/v2/transaction/verify/:${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Add timeout for security
      }
    );

    const transactionData = await budpayResponse.data;

    console.log('Transaction verification response:', transactionData);

    if (!transactionData.status) {
      return res.status(404).json({
        status: false,
        message: transactionData.message || 'Transaction verification failed'
      });
    }

    // Validate response data before using it
    if (!transactionData.data || !transactionData.customer) {
      return res.status(400).json({
        status: false,
        message: 'Invalid response from payment provider'
      });
    }

    // Verify that email matches current user (unless admin)
    const isAdmin = user.role === 'admin';
    const isTransactionOwner = transactionData.customer.email === user.email;

    

    if (!isAdmin && !isTransactionOwner) {
      return res.status(403).json({
        status: false,
        message: 'You are not authorized to verify this transaction'
      });
    }

    // Enhanced validation: Ensure amount is valid number before saving
    const amount = parseFloat(transactionData.data.amount);
    const requestedAmount = parseFloat(transactionData.data.requested_amount);
    const fees = parseFloat(transactionData.data.fees || '0');

    if (isNaN(amount) || isNaN(requestedAmount) || isNaN(fees)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid payment data received from provider'
      });
    }

    // Create sanitized object for DB insertion to prevent NoSQL injection
    const newTransaction = await PaymentTransaction.create({
      reference: String(transactionData.data.reference),
      status: String(transactionData.data.status),
      amount: amount,
      currency: String(transactionData.data.currency),
      transaction_date: new Date(transactionData.data.transaction_date),
      domain: String(transactionData.data.domain),
      gateway_response: String(transactionData.data.gateway_response),
      channel: String(transactionData.data.channel),
      ip_address: String(transactionData.data.ip_address),
      log: {
        time_spent: Number(transactionData.log.time_spent),
        attempts: Number(transactionData.log.attempts),
        authentication: String(transactionData.log.authentication),
        errors: typeof transactionData.log.errors === 'number' ?
          transactionData.log.errors :
          (Array.isArray(transactionData.log.errors) ? transactionData.log.errors.length : 0),
        success: Boolean(transactionData.log.success),
        channel: String(transactionData.log.channel),
        history: Array.isArray(transactionData.log.history) ? transactionData.log.history : []
      },
      fees: fees,
      customer: {
        id: String(transactionData.customer.id),
        customer_code: String(transactionData.customer.customer_code),
        first_name: transactionData.customer.first_name ? String(transactionData.customer.first_name) : null,
        last_name: transactionData.customer.last_name ? String(transactionData.customer.last_name) : null,
        email: String(transactionData.customer.email)
      },
      userId: user.id, // Associate with the current user explicitly
      plan: transactionData.data.plan ? String(transactionData.data.plan) : null,
      requested_amount: requestedAmount,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: user.id // Track who verified the transaction
    });


    // Only return necessary data to the client
    return res.status(201).json({
      _id: newTransaction._id,
      reference: newTransaction.reference,
      status: newTransaction.status,
      amount: newTransaction.amount,
      currency: newTransaction.currency,
      transaction_date: newTransaction.transaction_date,
      requested_amount: newTransaction.requested_amount,
      customer: {
        email: newTransaction.customer.email
      },
      verified: newTransaction.verified,
      verifiedAt: newTransaction.verifiedAt
    });

  } catch (error: any) {
    // Log the error securely without exposing sensitive details
    console.error('Payment verification error:', {
      referenceId: req.params.referenceId,
      userId: req.user?.id,
      errorMessage: error.message,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Handle specific error types
    if (error.response) {
      // API response error
      return res.status(error.response.status || 500).json({
        status: false,
        message: 'Payment verification failed',
        error: process.env.NODE_ENV === 'production'
          ? 'An error occurred with the payment provider'
          : error.response.data.message
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        status: false,
        message: 'Payment gateway timeout, please try again later'
      });
    }

    // Generic error handler - don't leak implementation details in production
    return res.status(500).json({
      status: false,
      message: 'An error occurred while verifying transaction'
    });
  }
};

/**
 * Handle successful payment and create subscription
 * @route POST /api/v1/payment/success/:referenceId
 */
export const handleSuccessfulPaymentWithSubscription = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { referenceId } = req.params;
    const { numberId } = req.body;
    const userId = req.user?._id;


    if (!referenceId) {
      return res.status(400).json({
        status: false,
        message: 'Reference ID is required'
      });
    }

    if (!numberId) {
      return res.status(400).json({
        status: false,
        message: 'Phone number ID is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized: User must be logged in'
      });
    }

    // Find payment by reference ID
    const payment = await PaymentLink.findOne({ referenceId });

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: 'Payment not found'
      });
    }

    // Security check: Verify the payment belongs to the authenticated user
    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: false,
        message: 'Unauthorized: You do not have permission to access this payment'
      });
    }

    // Now update the payment status
    await PaymentLink.findOneAndUpdate(
      { referenceId, userId },  // Add userId to query for extra security
      {
        $set: {
          status: 'completed',
          completedAt: new Date()
        }
      },
      { new: true }
    );

    // Check if the phone number exists
    const phoneNumber = await PhoneNumber.findById(numberId);
    if (!phoneNumber) {
      return res.status(404).json({
        status: false,
        message: 'Phone number not found'
      });
    }

    // If the number was previously reserved, check if it was reserved for this user
    if (phoneNumber.status === 'reserved' && phoneNumber.user &&
      phoneNumber.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: false,
        message: 'This phone number is reserved for another user'
      });
    }

    // Check if the phone number is available
    if (phoneNumber.status !== 'available' && phoneNumber.status !== 'reserved') {
      return res.status(400).json({
        status: false,
        message: 'Phone number is not available for subscription'
      });
    }

    // Check if user already has an active subscription for this number
    const existingSubscription = await Subscription.findOne({
      user: userId,
      number: numberId,
      status: "active"
    });

    if (existingSubscription) {
      return res.status(400).json({
        status: false,
        message: "Active subscription already exists for this number"
      });
    }

    // Determine plan type from payment metadata
    const planType = payment.metadata?.planType || 'standard';

    // Calculate subscription duration based on plan type
    let durationInMs: number;
    switch (planType) {
      case 'lite':
      case 'standard':
        durationInMs = 45 * 24 * 60 * 60 * 1000; // 45 days
        break;
      case 'premium':
        durationInMs = 60 * 24 * 60 * 60 * 1000; // 60 days
        break;
      default:
        durationInMs = 45 * 24 * 60 * 60 * 1000; // 30 days (default)
        break;
    }

    const endDate = new Date(Date.now() + durationInMs);

    // Create subscription
    const subscription = new Subscription({
      user: userId,
      number: numberId,
      plan: planType,
      status: "active",
      startDate: Date.now(),
      endDate,
      autoRenew: true,
      price: payment.amount,
      paymentMethod: 'card',
      paymentReference: referenceId,
      minutesUsed: 0,
      renewalReminderSent: false
    });

    await subscription.save();

    // Update phone number status to active and assign to user
    await updatePhoneNumberStatusInternal(numberId, 'active', userId.toString());

    // Fetch user data for notifications and emails
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Get admin for email notifications
    const admin = await Admin.findOne();
    if (!admin) {
      // Continue without admin notification
    }

    // Populate the subscription with phone number details for notifications and emails
    const populatedSubscription = await Subscription.findById(subscription._id).populate('number');

    // Make sure populatedSubscription is not null before proceeding
    if (populatedSubscription) {
      // Send notifications to user and admin
      try {
        await notifySubscriptionCreated(user, populatedSubscription as unknown as ISubscription);
      } catch (notificationError) {
            // Continue execution even if notification fails
      }

      // Send emails to user and admin
      try {
        if (admin) {
          await sendSubscriptionCreatedEmail(user, populatedSubscription as ISubscription, admin);
        }
      } catch (emailError) {
        // Continue execution even if email fails
      }
    } else {
    }

    return res.status(200).json({
      status: true,
      message: 'Payment successful and subscription created',
      data: {
        payment: {
          referenceId: payment.referenceId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        },
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status
        },
        phoneNumber: {
          id: phoneNumber._id,
          number: phoneNumber.phoneNumber,
          status: 'active'
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: 'An error occurred while processing payment and creating subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Internal function to update phone number status
 * Extracted from updatePhoneNumberStatus to reuse logic
 */
const updatePhoneNumberStatusInternal = async (
  phoneNumberId: string,
  status: 'available' | 'reserved' | 'active' | 'suspended',
  userId: string | null
): Promise<void> => {
  const phoneNumber = await PhoneNumber.findById(phoneNumberId);

  if (!phoneNumber) {
    throw new Error('Phone number not found');
  }

  // If number is already assigned to another user, throw error
  if (phoneNumber.user && phoneNumber.user.toString() !== userId && status !== 'available') {
    throw new Error('Phone number is already assigned to another user');
  }

  // If number is changing from assigned to available, remove from previous user
  if (status === 'available' && phoneNumber.user) {
    await User.findByIdAndUpdate(
      phoneNumber.user,
      { $pull: { phoneNumbers: phoneNumber._id } }
    );

    // Update phone number
    phoneNumber.status = status;
    phoneNumber.user = null;
    phoneNumber.reservedUntil = null;
  }
  // If assigning to a user (reserved, active, suspended)
  else if (['reserved', 'active', 'suspended'].includes(status) && userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If this is a new assignment (not just a status change for same user)
    if (!phoneNumber.user || phoneNumber.user.toString() !== userId) {
      // Add to user's phone numbers array if not already there
      const userPhoneNumber = await User.findOne({ phoneNumber: phoneNumber._id });
      if (!userPhoneNumber) {
        await User.findByIdAndUpdate(
          userId,
          { $set: { phoneNumber: phoneNumber._id } }
        );
      }
    }

    // Update phone number status
    phoneNumber.status = status;
    phoneNumber.user = new mongoose.Types.ObjectId(userId);

    // Set reservation time if reserved
    if (status === 'reserved') {
      phoneNumber.reservedUntil = new Date(Date.now() + 30 * 60000); // 30 minutes
    } else {
      phoneNumber.reservedUntil = null;
    }
  }

  await phoneNumber.save();
};
/**
 * Handle cancelled payment
 * @route GET /api/v2/cancel/:referenceId
 */
export const handleCancelledPayment = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        status: false,
        message: 'Reference ID is required'
      });
    }

    // Find and update payment status
    const payment = await PaymentLink.findOneAndUpdate(
      { referenceId },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        status: false,
        message: 'Payment not found'
      });
    }

    // Redirect user to a cancellation page or back to pricing
    res.redirect('/pricing?cancelled=true');
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: 'An error occurred while processing cancelled payment'
    });
  }
};