import mongoose, { Schema, Document } from 'mongoose';

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'subscription' | 'user' | 'payment' | 'account' | 'system';
export type RecipientType = 'user' | 'admin';
export type NotificationChannel = 'email' | 'push' | 'in-app';

// Notification Preferences Interface
export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  categories: {
    [key in NotificationCategory]: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    }
  };
}

// Notification Interface
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientType: RecipientType;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;
  channels: NotificationChannel[];
  createdAt: Date;
}

// Notification Preferences Schema
const notificationPreferencesSchema = new Schema<INotificationPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  channels: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  },
  categories: {
    subscription: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    user: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    payment: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    account: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    system: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  }
});

// Notification Schema
const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['subscription', 'user', 'payment', 'account', 'system'],
    required: true
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  channels: [{
    type: String,
    enum: ['email', 'push', 'in-app']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationPreferencesSchema.index({ userId: 1 });

const NotificationPreferences = mongoose.model<INotificationPreferences>('NotificationPreferences', notificationPreferencesSchema);
const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export { Notification, NotificationPreferences };