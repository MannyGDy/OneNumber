import { Notification, NotificationPreferences } from "@/types/notification";
import { apiSlice } from "../api/apiSlice";

// Define TypeScript interfaces for requests and responses
interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
}

interface UpdateNotificationPreferencesRequest {
  preferences: Partial<NotificationPreferences>;
}

interface ToggleNotificationPreferenceRequest {
  preferenceKey: keyof NotificationPreferences;
}

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query<NotificationResponse, void>({
      query: () => "/notification",
      providesTags: ['Notifications']
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => "/notification/preferences",
      providesTags: ['NotificationPreferences']
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<NotificationPreferences, UpdateNotificationPreferencesRequest>({
      query: (data) => ({
        url: '/notification/preferences',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['NotificationPreferences']
    }),

    // Toggle specific notification preference
    toggleNotificationPreference: builder.mutation<NotificationPreferences, ToggleNotificationPreferenceRequest>({
      query: (data) => ({
        url: '/notification/preferences/toggle',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['NotificationPreferences']
    }),

    // Mark a specific notification as read
    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: 'PUT'
      }),
      invalidatesTags: ['Notifications']
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notification/read',
        method: 'PUT'
      }),
      invalidatesTags: ['Notifications']
    }),

    // Delete a specific notification
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notifications']
    })
  })
});

// Export hooks for usage in components
export const {
  useGetNotificationsQuery,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useToggleNotificationPreferenceMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;