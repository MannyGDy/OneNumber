import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  getUserNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../services/notification.service';
// import logger from '../utils/logger';
import NotificationPreferencesService from '../services/notification-preferences.service';
import { NotificationCategory, NotificationChannel } from '../models/notificaton.model';

class NotificationController {
  /**
   * Get notifications for the authenticated user
   * Supports pagination and filtering
   */
  async getUserNotifications(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      // Extract pagination parameters with defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Optional query to include read notifications
      const includeRead = req.query.includeRead === 'true';

      // Determine user type and ID
      const userId = req.user._id as mongoose.Types.ObjectId;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }

      const userType = req.user.role === 'admin' ? 'admin' : 'user';

      // Fetch notifications based on user type
      const result = userType === 'admin'
        ? await getAdminNotifications(userId, limit, offset, includeRead)
        : await getUserNotifications(userId, limit, offset, includeRead);

      return res.status(200).json({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to fetch notifications'
      });
    }
  }

  /**
   * Get notification preferences for the authenticated user
   */
  async getNotificationPreferences(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const userId = req.user._id as mongoose.Types.ObjectId;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const preferences = await NotificationPreferencesService.getNotificationPreferences(userId);

      if (!preferences) {
        return res.status(500).json({
          message: 'Unable to retrieve notification preferences'
        });
      }

      return res.status(200).json(preferences);
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to retrieve notification preferences'
      });
    }
  }

  /**
   * Update notification preferences for the authenticated user
   */
  async updateNotificationPreferences(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const userId = req.user._id as mongoose.Types.ObjectId;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      // Validate input
      const { channels, categories } = req.body;

      // Optional: Add input validation
      if (channels) {
        const validChannels: NotificationChannel[] = ['email', 'push', 'in-app'];
        const invalidChannels = Object.keys(channels).filter(
          channel => !validChannels.includes(channel as NotificationChannel)
        );
        if (invalidChannels.length > 0) {
          return res.status(400).json({
            message: `Invalid channels: ${invalidChannels.join(', ')}`
          });
        }
      }

      if (categories) {
        const validCategories: NotificationCategory[] = ['subscription', 'user', 'payment', 'account', 'system'];
        const invalidCategories = Object.keys(categories).filter(
          category => !validCategories.includes(category as NotificationCategory)
        );
        if (invalidCategories.length > 0) {
          return res.status(400).json({
            message: `Invalid categories: ${invalidCategories.join(', ')}`
          });
        }
      }

      const updatedPreferences = await NotificationPreferencesService.updateNotificationPreferences(
        userId,
        { channels, categories }
      );

      if (!updatedPreferences) {
        return res.status(500).json({
          message: 'Unable to update notification preferences'
        });
      }

      return res.status(200).json(updatedPreferences);
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to update notification preferences'
      });
    }
  }

  /**
   * Toggle a specific notification preference
   */
  async toggleNotificationPreference(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const userId = req.user._id as mongoose.Types.ObjectId;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const { type, name, subType } = req.body;

      // Validate input
      if (!['channel', 'category'].includes(type)) {
        return res.status(400).json({
          message: 'Invalid type. Must be "channel" or "category".'
        });
      }

      if (!name) {
        return res.status(400).json({
          message: 'Name is required'
        });
      }

      if (!['email', 'push', 'in-app'].includes(subType)) {
        return res.status(400).json({
          message: 'Invalid subType. Must be "email", "push", or "in-app".'
        });
      }

      const updatedPreferences = await NotificationPreferencesService.toggleNotificationPreference(
        userId,
        type as 'channel' | 'category',
        name,
        subType as 'email' | 'push' | 'inApp'
      );

      if (!updatedPreferences) {
        return res.status(500).json({
          message: 'Unable to toggle notification preference'
        });
      }

      return res.status(200).json(updatedPreferences);
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to toggle notification preference'
      });
    }
  }

  /**
   * Mark a specific notification as read
   */
  async markNotificationAsRead(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }



      const notificationId = req.params.id;
      const userId = req.user._id as mongoose.Types.ObjectId;;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }
      const userType = req.user.role === 'admin' ? 'admin' : 'user';

      // Validate notification ID
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({
          message: 'Invalid notification ID'
        });
      }

      const success = await markNotificationAsRead(
        new mongoose.Types.ObjectId(notificationId),
        userId,
        userType
      );

      if (!success) {
        return res.status(404).json({
          message: 'Notification not found or not authorized'
        });
      }

      return res.status(200).json({
        message: 'Notification marked as read'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to mark notification as read'
      });
    }
  }

  /**
   * Mark all notifications as read for the authenticated user
   */
  async markAllNotificationsAsRead(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const userId = req.user._id as mongoose.Types.ObjectId;;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }
      const userType = req.user.role === 'admin' ? 'admin' : 'user';

      const success = await markAllNotificationsAsRead(userId, userType);

      if (!success) {
        return res.status(500).json({
          message: 'Failed to mark all notifications as read'
        });
      }

      return res.status(200).json({
        message: 'All notifications marked as read'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to mark all notifications as read'
      });
    }
  }

  /**
   * Delete a specific notification
   */
  async deleteNotification(req: Request, res: Response): Promise<Response> {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      const notificationId = req.params.id;
      const userId = req.user._id as mongoose.Types.ObjectId;;
      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        })
      }
      const userType = req.user.role === 'admin' ? 'admin' : 'user';

      // Validate notification ID
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({
          message: 'Invalid notification ID'
        });
      }

      const success = await deleteNotification(
        new mongoose.Types.ObjectId(notificationId),
        userId,
        userType
      );

      if (!success) {
        return res.status(404).json({
          message: 'Notification not found or not authorized'
        });
      }

      return res.status(200).json({
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Unable to delete notification'
      });
    }
  }
}

export default new NotificationController();