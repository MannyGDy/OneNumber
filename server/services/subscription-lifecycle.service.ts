import User from '../models/user.model';
import Admin from '../models/admin.model';
import Subscription, { ISubscriptions } from '../models/subscription.model';
import notificationService from './notification.service';
import emailService from './email.service';
import logger from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Service to handle subscription lifecycle events
 * This centralizes all actions that should occur when subscriptions change state
 */
class SubscriptionLifecycleService {

  /**
   * Handle subscription creation event
   */
  async handleSubscriptionCreated(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const admin = await Admin.findOne(); // Get first admin or specific one
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !admin || !subscription) {
        logger.error('Failed to handle subscription created: missing data', {
          userId, subscriptionId,
          userFound: !!user,
          adminFound: !!admin,
          subscriptionFound: !!subscription
        });
        return;
      }

      // Send in-app notifications
      await notificationService.notifySubscriptionCreated(user, subscription);

      // Send email notifications
      await emailService.sendSubscriptionCreatedEmail(user, subscription, admin);

      logger.info(`Successfully processed subscription creation for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleSubscriptionCreated:', error);
    }
  }

  /**
   * Handle subscription renewal event
   */
  async handleSubscriptionRenewed(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const admin = await Admin.findOne();
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !admin || !subscription) {
        logger.error('Failed to handle subscription renewal: missing data');
        return;
      }

      // Send in-app notifications
      await notificationService.notifySubscriptionRenewed(user, subscription);

      // Send email notifications
      await emailService.sendSubscriptionRenewedEmail(user, subscription, admin);

      logger.info(`Successfully processed subscription renewal for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleSubscriptionRenewed:', error);
    }
  }

  /**
   * Handle subscription cancellation event
   */
  async handleSubscriptionCancelled(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const admin = await Admin.findOne();
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !admin || !subscription) {
        logger.error('Failed to handle subscription cancellation: missing data');
        return;
      }

      // Send in-app notifications
      await notificationService.notifySubscriptionCancelled(user, subscription);

      // Send email notifications
      await emailService.sendSubscriptionCancelledEmail(user, subscription, admin);

      logger.info(`Successfully processed subscription cancellation for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleSubscriptionCancelled:', error);
    }
  }

  /**
   * Handle subscription expiring event (triggered by scheduler)
   */
  async handleSubscriptionExpiring(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId,
    daysRemaining: number
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !subscription) {
        logger.error('Failed to handle subscription expiring: missing data');
        return;
      }

      // Skip if renewal reminder already sent
      if (subscription.renewalReminderSent) {
        return;
      }

      // Send in-app notifications
      await notificationService.notifySubscriptionExpiring(user, subscription, daysRemaining);

      // Send email notifications
      await emailService.sendSubscriptionExpiringEmail(user, subscription, daysRemaining);

      // Mark reminder as sent
      subscription.renewalReminderSent = true;
      await subscription.save();

      logger.info(`Successfully processed subscription expiring for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleSubscriptionExpiring:', error);
    }
  }

  /**
   * Handle subscription expired event (triggered by scheduler)
   */
  async handleSubscriptionExpired(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const admin = await Admin.findOne();
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !admin || !subscription) {
        logger.error('Failed to handle subscription expired: missing data');
        return;
      }

      // Skip if already handled
      if (subscription.status === 'expired') {
        return;
      }

      // Update subscription status
      subscription.status = 'expired';
      await subscription.save();

      // Send in-app notifications
      await notificationService.notifySubscriptionExpired(user, subscription);

      // Send email notifications
      await emailService.sendSubscriptionExpiredEmail(user, subscription, admin);

      logger.info(`Successfully processed subscription expiration for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleSubscriptionExpired:', error);
    }
  }

  /**
   * Handle auto-renew toggle event
   */
  async handleAutoRenewToggled(
    userId: mongoose.Types.ObjectId,
    subscriptionId: mongoose.Types.ObjectId,
    enabled: boolean
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      const subscription = await Subscription.findById(subscriptionId).populate('number');

      if (!user || !subscription) {
        logger.error('Failed to handle auto-renew toggle: missing data');
        return;
      }

      // Create a custom notification for auto-renew toggle
      await notificationService.createUserNotification(
        user._id as mongoose.Types.ObjectId,
        "Auto-renewal Settings Updated",
        `Auto-renewal for your subscription to ${subscription.number?.toString()} has been ${enabled ? 'enabled' : 'disabled'}.`,
        'subscription',
        'info',
        subscription._id as mongoose.Types.ObjectId
      );

      logger.info(`Successfully processed auto-renew toggle for user ${userId}, subscription ${subscriptionId}`);
    } catch (error) {
      logger.error('Error in handleAutoRenewToggled:', error);
    }
  }
}

export default new SubscriptionLifecycleService();