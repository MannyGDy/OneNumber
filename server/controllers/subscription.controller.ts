import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import PhoneNumber from "../models/phoneNumber.model";
import mongoose from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { ISubscription } from "../models/subscription.model";

import subscriptionLifecycleService from "../services/subscription-lifecycle.service";
import { PaymentTransaction } from "../models/PaymentTransaction";

declare module 'express-serve-static-core' {
  interface Request {
    subscription?: ISubscription;
  }
}

// User subscription controllers
export const createSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const { numberId, plan, paymentMethod, paymentReference } = req.body;
    const userId = req.user?._id; // Assuming user ID is extracted from authentication middleware

    // Validate inputs
    if (!numberId || !plan || !paymentMethod || !paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if number exists
    const number = await PhoneNumber.findById(numberId);
    if (!number) {
      return res.status(404).json({
        success: false,
        message: "Number not found"
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
        success: false,
        message: "Active subscription already exists for this number"
      });
    }

    // Calculate price based on plan (this would likely come from a pricing table in production)
    const price = plan === "monthly" ? 9.99 : 99.99;

    // Calculate end date based on plan
    const durationInMs = plan === "monthly"
      ? 30 * 24 * 60 * 60 * 1000
      : 365 * 24 * 60 * 60 * 1000;

    const endDate = new Date(Date.now() + durationInMs);

    // Create subscription
    const subscription = new Subscription({
      user: userId,
      number: numberId,
      plan,
      status: "active",
      startDate: Date.now(),
      endDate,
      autoRenew: true,
      price,
      paymentMethod,
      paymentReference,
      minutesUsed: 0,
      renewalReminderSent: false
    });

    await subscription.save();

    // Trigger lifecycle event
    subscriptionLifecycleService.handleSubscriptionCreated(
      userId as mongoose.Types.ObjectId,
      subscription._id as mongoose.Types.ObjectId
    );

    return res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating subscription",
      error: error.message
    });
  }
});

export const renewSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // From auth middleware
    const { id } = req.params;
    const { paymentReference } = req.body;

    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    await subscription.renew(paymentReference);

    // Trigger lifecycle event
    subscriptionLifecycleService.handleSubscriptionRenewed(
      userId as mongoose.Types.ObjectId,
      subscription._id as mongoose.Types.ObjectId
    );

    return res.status(200).json({
      success: true,
      message: "Subscription renewed successfully",
      data: subscription
    });
  } catch (error: any) {
    console.error("Error renewing subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error renewing subscription",
      error: error.message
    });
  }
});

export const cancelSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // From auth middleware
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    await subscription.cancel();

    // Trigger lifecycle event
    subscriptionLifecycleService.handleSubscriptionCancelled(
      userId as mongoose.Types.ObjectId,
      subscription._id as mongoose.Types.ObjectId
    );

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription
    });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
      error: error.message
    });
  }
});

export const toggleAutoRenew = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // From auth middleware
    const { id } = req.params;
    const { autoRenew } = req.body;

    if (autoRenew === undefined) {
      return res.status(400).json({
        success: false,
        message: "autoRenew field is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const previousAutoRenew = subscription.autoRenew;
    subscription.autoRenew = autoRenew;
    await subscription.save();

    // Only trigger lifecycle event if the status actually changed
    if (previousAutoRenew !== autoRenew) {
      subscriptionLifecycleService.handleAutoRenewToggled(
        userId as mongoose.Types.ObjectId,
        subscription._id as mongoose.Types.ObjectId,
        autoRenew
      );
    }

    return res.status(200).json({
      success: true,
      message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`,
      data: subscription
    });
  } catch (error: any) {
    console.error("Error toggling auto-renew:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling auto-renew",
      error: error.message
    });
  }
});


export const getUserSubscriptions = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // From auth middleware
    const subscriptions = await Subscription.find({ user: userId })
      .populate("user")
      .populate("number")



    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error: any) {
    console.error("Error fetching user subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message
    });
  }
});

export const getUserSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id; // From auth middleware
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: userId
    }).populate("number", "phoneNumber");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscription",
      error: error.message
    });
  }
});


// Admin subscription controllers
export const getAllSubscriptions = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const {
      status,
      plan,
      autoRenew,

      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const queryObj: any = {};

    if (status) queryObj.status = status;
    if (plan) queryObj.plan = plan;
    if (autoRenew !== undefined) queryObj.autoRenew = autoRenew === 'true';

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const subscriptions = await Subscription.find(queryObj)
      .populate({
        path: "user",
        options: { sort: { createdAt: -1 } } // Sort users in descending order by registration date
      })
      .populate("number")
      .sort({ createdAt: -1 }) // Sort subscriptions in descending order

    const totalCount = await Subscription.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error: any) {
    console.error("Error fetching all subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message
    });
  }
});

export const getSubscriptionById = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate subscription ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    // Fetch subscription with populated fields
    const subscription = await Subscription.findById(id)
      .populate("user")
      .populate("number");

    // Check if subscription exists
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Get the payment reference from the subscription
    const paymentReference = subscription.paymentReference;

    // Fetch the payment transaction data using the reference
    let paymentTransaction = null;
    if (paymentReference) {
      paymentTransaction = await PaymentTransaction.findOne({ reference: paymentReference });
    }

    // Return subscription data with payment transaction
    return res.status(200).json({
      success: true,
      data: {
        subscription,
        paymentTransaction
      }
    });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscription",
      error: error.message
    });
  }
});


export const updateSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, endDate, minutesUsed, price, plan } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // Update fields if provided
    if (status) subscription.status = status;
    if (endDate) subscription.endDate = new Date(endDate);
    if (minutesUsed !== undefined) subscription.minutesUsed = minutesUsed;
    if (price !== undefined) subscription.price = price;
    if (plan) subscription.plan = plan;

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating subscription",
      error: error.message
    });
  }
});

export const deleteSubscription = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    await Subscription.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting subscription",
      error: error.message
    });
  }
});

export const getUserSubscriptionsById = CatchAsyncError(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const subscriptions = await Subscription.find({ user: userId })
      .populate("number", "phoneNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error: any) {
    console.error("Error fetching user subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message
    });
  }
});