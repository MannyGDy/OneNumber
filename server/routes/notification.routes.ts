import express from 'express';
import NotificationController from '../controllers/notification.controller';
import { isAuthenticated } from '../middleware/auth';


const notificationRouter = express.Router();

// Get notifications (authenticated users only)
notificationRouter.get('/',
  isAuthenticated,    // Ensure user is authenticated
  NotificationController.getUserNotifications
);

// Get notification preferences (authenticated users only)
notificationRouter.get('/preferences',
  isAuthenticated,
  NotificationController.getNotificationPreferences
);

// Update notification preferences (authenticated users only)
notificationRouter.put('/preferences',
  isAuthenticated,
  NotificationController.updateNotificationPreferences
);

// Toggle specific notification preference (authenticated users only)
notificationRouter.post('/preferences/toggle',
  isAuthenticated,
  NotificationController.toggleNotificationPreference
);

// Mark a specific notification as read
notificationRouter.put('/:id/read',
  isAuthenticated,
  NotificationController.markNotificationAsRead
);

// Mark all notifications as read
notificationRouter.put('/read',
  isAuthenticated,
  NotificationController.markAllNotificationsAsRead
);

// Delete a specific notification
notificationRouter.delete('/:id',
  isAuthenticated,
  NotificationController.deleteNotification
);

export default notificationRouter;