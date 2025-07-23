import cron from 'node-cron';
import mongoose from 'mongoose';
import Subscription from '../models/subscription.model';
import subscriptionLifecycleService from './subscription-lifecycle.service';
import logger from '../utils/logger';

/**
 * Service to schedule and run subscription-related jobs
 */
class SubscriptionSchedulerService {
  private isInitialized = false;

  /**
   * Initialize all schedulers
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Schedule the expired subscription check to run every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkAndProcessExpiredSubscriptions();
    });

    // Schedule the expiring subscription reminder check to run daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.checkAndProcessExpiringSubscriptions();
    });

    this.isInitialized = true;
    logger.info('Subscription scheduler service initialized');
  }

  /**
   * Check for and process subscriptions that have expired
   */
  async checkAndProcessExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();

      // Find active subscriptions that have passed their expiration date
      const expiredSubscriptions = await Subscription.find({
       endDate: { $lt: now },
        status: { $ne: 'expired' }
      });

      logger.info(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

      // Process each expired subscription
      for (const subscription of expiredSubscriptions) {
        await subscriptionLifecycleService.handleSubscriptionExpired(
          subscription.user as mongoose.Types.ObjectId,
          subscription._id as mongoose.Types.ObjectId
        );
      }
    } catch (error) {
      logger.error('Error checking for expired subscriptions:', error);
    }
  }

  /**
   * Check for and process subscriptions that are about to expire
   * Sends reminders for subscriptions expiring in 7, 3, and 1 days
   */
  async checkAndProcessExpiringSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      const reminderDays = [7, 3, 1]; // Days before expiration to send reminders

      for (const days of reminderDays) {
        // Calculate the date range for this reminder period
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + days);

        // Find active subscriptions expiring in exactly 'days' days
        // This checks subscriptions expiring between the start and end of the target day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const expiringSubscriptions = await Subscription.find({
         endDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: 'active',
          renewalReminderSent: false
        });

        logger.info(`Found ${expiringSubscriptions.length} subscriptions expiring in ${days} days`);

        // Process each expiring subscription
        for (const subscription of expiringSubscriptions) {
          await subscriptionLifecycleService.handleSubscriptionExpiring(
            subscription.user as mongoose.Types.ObjectId,
            subscription._id as mongoose.Types.ObjectId,
            days
          );
        }
      }
    } catch (error) {
      logger.error('Error checking for expiring subscriptions:', error);
    }
  }

  /**
   * Run an immediate check for expired subscriptions
   * Useful for testing or when recovering from downtime
   */
  async runExpiredSubscriptionsCheck(): Promise<void> {
    logger.info('Running manual check for expired subscriptions');
    await this.checkAndProcessExpiredSubscriptions();
  }
}

export default new SubscriptionSchedulerService();