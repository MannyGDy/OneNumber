import mongoose from 'mongoose';
import User from '../models/user.model';
import Admin from '../models/admin.model';
import { IUser } from '../models/user.model';
import { IAdmin } from '../models/admin.model';
import { ISubscription, ISubscriptions } from '../models/subscription.model';
// import logger from '../utils/logger';
import { INotification, Notification, NotificationCategory, NotificationChannel, NotificationType, RecipientType } from '../models/notificaton.model';

// Populate the notification channels based on user preferences
const getNotificationChannels = async (category: string): Promise<NotificationChannel[]> => {
  return ['in-app', 'email', 'push']; // Default implementation, can be customized
};

// Create notification for user
export const createUserNotification = async (
  userId: mongoose.Types.ObjectId,
  title: string,
  message: string,
  category: NotificationCategory = 'system',
  type: NotificationType = 'info',
  relatedId?: mongoose.Types.ObjectId
): Promise<INotification | null> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    const channels = await getNotificationChannels(category);

    const notification = new Notification({
      recipient: userId,
      recipientType: 'user',
      title,
      message,
      type,
      category,
      relatedId,
      isRead: false,
      channels
    });

    await notification.save();
    return notification;
  } catch (error) {
    return null;
  }
};

// Create notification for admin
export const createAdminNotification = async (
  title: string,
  message: string,
  category: NotificationCategory = 'system',
  type: NotificationType = 'info',
  relatedId?: mongoose.Types.ObjectId
): Promise<INotification[] | null> => {
  try {
    // Get all admin users
    const admins = await Admin.find({});
    if (!admins.length) {
      return null;
    }

    const channels = await getNotificationChannels(category);

    const notifications = [];
    for (const admin of admins) {
      const notification = new Notification({
        recipient: admin._id,
        recipientType: 'admin',
        title,
        message,
        type,
        category,
        relatedId,
        isRead: false,
        channels
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    return null;
  }
};

// Get user notifications
export const getUserNotifications = async (
  userId: mongoose.Types.ObjectId,
  limit: number = 10,
  offset: number = 0,
  includeRead: boolean = false
): Promise<{ notifications: INotification[]; unreadCount: number; total: number }> => {
  try {
    const query: any = {
      recipient: userId,
      recipientType: 'user'
    };

    if (!includeRead) {
      query.isRead = false;
    }

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      Notification.countDocuments({ ...query, isRead: false }),
      Notification.countDocuments(query)
    ]);

    return { notifications, unreadCount, total };
  } catch (error) {
    return { notifications: [], unreadCount: 0, total: 0 };
  }
};



// Get admin notifications
export const getAdminNotifications = async (
  adminId: mongoose.Types.ObjectId,
  limit: number = 10,
  offset: number = 0,
  includeRead: boolean = false
): Promise<{ notifications: INotification[]; unreadCount: number; total: number }> => {
  try {
    const query: any = {
      recipient: adminId,
      recipientType: 'admin'
    };

    if (!includeRead) {
      query.isRead = false;
    }

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      Notification.countDocuments({ ...query, isRead: false }),
      Notification.countDocuments(query)
    ]);

    return { notifications, unreadCount, total };
  } catch (error) {
    return { notifications: [], unreadCount: 0, total: 0 };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  userType: RecipientType
): Promise<boolean> => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
      recipientType: userType
    });

    if (!notification) {
      return false;
    }

    notification.isRead = true;
    await notification.save();

    return true;
  } catch (error) {
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  userId: mongoose.Types.ObjectId,
  userType: RecipientType
): Promise<boolean> => {
  try {
    await Notification.updateMany(
      {
        recipient: userId,
        recipientType: userType,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    return true;
  } catch (error) {
    return false;
  }
};

// Delete notification
export const deleteNotification = async (
  notificationId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  userType: RecipientType
): Promise<boolean> => {
  try {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
      recipientType: userType
    });

    return result.deletedCount > 0;
  } catch (error) {
    return false;
  }
};

// Notification helper functions for specific events
export const notifyUserRegistration = async (user: IUser): Promise<void> => {
  try {
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Welcome to our platform!',
      'Your account has been successfully created. Explore our services to get started.',
      'account',
      'success'
    );

    // Create notification for admins
    await createAdminNotification(
      'New User Registration',
      `${user.firstName} ${user.lastName} (${user.email}) has joined the platform.`,
      'user',
      'info'
    );
  } catch (error) {
  }
};

export const notifySubscriptionCreated = async (
  user: IUser,
  subscription: ISubscription
): Promise<void> => {
  try {
    // Ensure subscription is populated with number details
    await subscription.populate('number');
    const phoneNumber = (subscription.number as any)?.phoneNumber || 'your subscription';

    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Subscription Activated',
      `Your subscription for ${phoneNumber} has been successfully activated.`,
      'subscription',
      'success',
      subscription._id as mongoose.Types.ObjectId
    );

    // Create notification for admins
    await createAdminNotification(
      'New Subscription',
      `${user.firstName} ${user.lastName} has subscribed to ${phoneNumber} (${subscription.plan}).`,
      'subscription',
      'info',
      subscription._id as mongoose.Types.ObjectId
    );
  } catch (error) {
  }
};

export const notifySubscriptionRenewed = async (
  user: IUser,
  subscription: ISubscription
): Promise<void> => {
  try {
    // Ensure subscription is populated with number details
    await subscription.populate('number');
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Subscription Renewed',
      `Your subscription for ${(subscription.number as any)?.phoneNumber || 'your subscription'} has been successfully renewed until ${new Date(subscription.endDate).toLocaleDateString()}.`,
      'subscription',
      'success',
      subscription._id as mongoose.Types.ObjectId
    );

    // Create notification for admins
    await createAdminNotification(
      'Subscription Renewed',
      `${user.firstName} ${user.lastName} has renewed their subscription for ${(subscription.number as any)?.phoneNumber || 'Unknown number'}.`,
      'subscription',
      'info',
      subscription._id as mongoose.Types.ObjectId
    );
  } catch (error) {
  }
};

export const notifySubscriptionExpiring = async (
  user: IUser,
  subscription: ISubscription,
  daysRemaining: number
): Promise<void> => {
  try {
    // Ensure subscription is populated with number details
    await subscription.populate('number');
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Subscription Expiring Soon',
      `Your subscription for ${(subscription.number as any)?.phoneNumber || 'your subscription'} will expire in ${daysRemaining} days. Renew now to avoid service interruption.`,
      'subscription',
      'warning',
      subscription._id as mongoose.Types.ObjectId
    );
  } catch (error) {
  }
};

export const notifySubscriptionExpired = async (
  user: IUser,
  subscription: ISubscription
): Promise<void> => {
  try {
    // Ensure subscription is populated with number details
    await subscription.populate('number');
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Subscription Expired',
      `Your subscription for ${(subscription.number as any)?.phoneNumber || 'your subscription'} has expired. Renew now to continue using the service.`,
      'subscription',
      'error',
      subscription._id as mongoose.Types.ObjectId
    );

    // Create notification for admins
    await createAdminNotification(
      'Subscription Expired',
      `${user.firstName} ${user.lastName}'s subscription for ${(subscription.number as any)?.phoneNumber || 'Unknown number'} has expired.`,
      'subscription',
      'warning',
      subscription._id as mongoose.Types.ObjectId
    );
  } catch (error) {
  }
};

export const notifySubscriptionCancelled = async (
  user: IUser,
  subscription: ISubscription

): Promise<void> => {
  try {
    // Ensure subscription is populated with number details
    await subscription.populate('number');
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Subscription Cancelled',
      `Your subscription for ${(subscription.number as any)?.phoneNumber || 'your subscription'} has been cancelled. It will remain active until ${new Date(subscription.endDate).toLocaleDateString()}.`,
      'subscription',
      'info',
      subscription._id as mongoose.Types.ObjectId
    );

    // Create notification for admins
    await createAdminNotification(
      'Subscription Cancelled',
      `${user.firstName} ${user.lastName} has cancelled their subscription for ${(subscription.number as any)?.phoneNumber || 'Unknown number'}.`,
      'subscription',
      'warning',
      subscription._id as mongoose.Types.ObjectId
    );
  } catch (error) {
  }
};


export const notifyUserActivation = async (user: IUser): Promise<void> => {
  try {
    // Create notification for the user
    await createUserNotification(
      user._id as mongoose.Types.ObjectId,
      'Account Activated',
      'Your account has been successfully activated. You can now access all platform features.',
      'account',
      'success'
    );

    // Create notification for admins
    await createAdminNotification(
      'User Account Activated',
      `${user.firstName} ${user.lastName}'s account has been activated.`,
      'user',
      'info',
      user._id as mongoose.Types.ObjectId
    );
  } catch (error) {
    // Silent error handling as per existing pattern
  }
};


export default {
  createUserNotification,
  createAdminNotification,
  getUserNotifications,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  notifyUserRegistration,
  notifySubscriptionCreated,
  notifySubscriptionRenewed,
  notifySubscriptionExpiring,
  notifySubscriptionExpired,
  notifyUserActivation,
  notifySubscriptionCancelled
};