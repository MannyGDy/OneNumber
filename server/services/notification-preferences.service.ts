import mongoose from 'mongoose';
import { INotificationPreferences, NotificationPreferences } from '../models/notificaton.model';
import logger from '../utils/logger';

export class NotificationPreferencesService {
  /**
   * Get notification preferences for a user
   * @param userId - The ID of the user
   * @returns Notification preferences or null if not found
   */
  async getNotificationPreferences(userId: mongoose.Types.ObjectId): Promise<INotificationPreferences | null> {
    try {
      // Try to find existing preferences, create if not exists
      let preferences = await NotificationPreferences.findOne({ userId });

      if (!preferences) {
        preferences = new NotificationPreferences({
          userId,
          channels: {
            email: true,
            push: true,
            inApp: true
          },
          categories: {
            subscription: { email: true, push: true, inApp: true },
            user: { email: true, push: true, inApp: true },
            payment: { email: true, push: true, inApp: true },
            account: { email: true, push: true, inApp: true },
            system: { email: true, push: true, inApp: true }
          }
        });

        await preferences.save();
      }

      return preferences;
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences for a user
   * @param userId - The ID of the user
   * @param updates - Partial update to notification preferences
   * @returns Updated preferences or null if update fails
   */
  async updateNotificationPreferences(
    userId: mongoose.Types.ObjectId,
    updates: Partial<INotificationPreferences>
  ): Promise<INotificationPreferences | null> {
    try {
      const preferences = await NotificationPreferences.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true }
      );

      return preferences;
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      return null;
    }
  }

  /**
   * Toggle a specific notification channel or category
   * @param userId - The ID of the user
   * @param type - Whether to toggle a channel or category
   * @param name - Name of the channel or category to toggle
   * @param subType - Specific channel to toggle (email, push, inApp)
   * @returns Updated preferences or null if toggle fails
   */
  async toggleNotificationPreference(
    userId: mongoose.Types.ObjectId,
    type: 'channel' | 'category',
    name: string,
    subType: 'email' | 'push' | 'inApp'
  ): Promise<INotificationPreferences | null> {
    try {
      // Validate input
      const validChannels = ['email', 'push', 'inApp'];
      const validCategories = ['subscription', 'user', 'payment', 'account', 'system'];

      if (type === 'channel' && !validChannels.includes(name)) {
        throw new Error(`Invalid channel: ${name}`);
      }

      if (type === 'category' && !validCategories.includes(name)) {
        throw new Error(`Invalid category: ${name}`);
      }

      let updateQuery: any;
      if (type === 'channel') {
        updateQuery = { $set: { [`channels.${name}`]: false } };
      } else {
        updateQuery = { $set: { [`categories.${name}.${subType}`]: false } };
      }

      const preferences = await NotificationPreferences.findOneAndUpdate(
        { userId },
        updateQuery,
        { new: true }
      );

      if (!preferences) {
        throw new Error('Notification preferences not found');
      }

      return preferences;
    } catch (error) {
      logger.error('Error toggling notification preference:', error);
      return null;
    }
  }
}

export default new NotificationPreferencesService();