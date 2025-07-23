"use client"

import React, { useState } from 'react';
import { X, Bell, CheckCircle, Trash2 } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '@/redux/features/notification/notificationApi';

import { Notification } from '@/types/notification';

// Modal Component for Notification Details
const NotificationModal = ({
  notification,
  onClose,
  onMarkAsRead,
  onDelete
}: {
  notification: Notification,
  onClose: () => void,
  onMarkAsRead: () => void,
  onDelete: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold truncate pr-4">{notification.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-gray-700 mb-4">{notification.message}</p>
        <div className="text-sm text-gray-500 mb-4 space-y-1">
          <p>Sent: {new Date(notification.createdAt).toLocaleString()}</p>
          <p>Channels: {notification.channels.join(', ')}</p>
          <p>Category: {notification.category}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {!notification.isRead && (
            <button
              onClick={onMarkAsRead}
              className="w-full sm:w-auto flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Read
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-full sm:w-auto flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const NotificationPanel = () => {
  const { data, refetch } = useGetNotificationsQuery();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      <div className={`
        fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        sm:static sm:translate-x-0 sm:block
        w-full sm:w-96 bg-white sm:rounded-lg sm:shadow-sm overflow-hidden
      `}>
        {/* Notification Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F2F4F8]">
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              Unread ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
          {data?.notifications?.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No notifications
            </div>
          ) : (
            data?.notifications?.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedNotification(notification as Notification | null);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-start">
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onMarkAsRead={() => handleMarkAsRead(selectedNotification._id)}
          onDelete={() => handleDeleteNotification(selectedNotification._id)}
        />
      )}
    </div>
  );
};

export default NotificationPanel;