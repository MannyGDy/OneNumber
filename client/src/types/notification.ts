// Enum for different notification types
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  BILLING = 'BILLING',
  ACCOUNT = 'ACCOUNT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SECURITY = 'SECURITY',
  MARKETING = 'MARKETING'
}

// Enum for notification priorities
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Interface for notification preferences
export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingNotifications: boolean;
  securityAlerts: boolean;
  billingUpdates: boolean;
  subscriptionNotifications: boolean;
}

// Interface for notification object
export interface Notification {
  _id: string;
  recipient: string;
  recipientType: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  isRead: boolean;
  channels: string[];
  createdAt: string;
  __v?: number;
  relatedTo?: string;
  relatedId?: string;
}



// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingNotifications: false,
  securityAlerts: true,
  billingUpdates: true,
  subscriptionNotifications: true
};