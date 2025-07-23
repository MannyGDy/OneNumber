"use client"
import React, { useState } from 'react';
import PasswordChangeModal from './PasswordChangeModal';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  // State for notifications
  const [emailNotifications, setEmailNotifications] = useState<NotificationOption[]>([
    {
      id: 'news-updates',
      title: 'News and Updates',
      description: 'News about products and features updates',
      enabled: true,
    },
    {
      id: 'email-reminders',
      title: 'Reminders',
      description: 'These are notifications to remind you of updates you might have missed',
      enabled: true,
    },
  ]);

  const [pushNotifications, setPushNotifications] = useState<NotificationOption[]>([

    {
      id: 'push-reminders',
      title: 'Reminders',
      description: 'These are notifications to remind you of updates you might have missed',
      enabled: true,
    },
  ]);

  // State for password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);


  // Toggle notification option
  const toggleNotification = (type: 'email' | 'push', id: string) => {
    if (type === 'email') {
      setEmailNotifications(
        emailNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, enabled: !notification.enabled }
            : notification
        )
      );
    } else {
      setPushNotifications(
        pushNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, enabled: !notification.enabled }
            : notification
        )
      );
    }
  };

  return (
    <div >

      {/* Main content */}
      <div className="flex-1 overflow-auto ">
        <div >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h1>
            <p className="text-gray-600 mb-6 pb-4 border-b">
              Select the kinds of notifications you get about your activities and recommendations
            </p>

            {/* Email Notifications */}
            <div className="!mb-20 !mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Notifications</h2>
              <p className="text-gray-600 mb-4">
                Get emails to find out what is going on when you are not online
              </p>

              <div className="space-y-4">
                {emailNotifications.map((notification) => (
                  <div key={notification.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-700">{notification.title}</h3>
                      <p className="text-gray-500 text-sm">{notification.description}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notification.enabled ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        onClick={() => toggleNotification('email', notification.id)}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notification.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="!mb-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Push Notifications</h2>
              <p className="text-gray-600 mb-4">
                Get push notification in-app to find out what is going on when you are online
              </p>

              <div className="space-y-4">
                {pushNotifications.map((notification) => (
                  <div key={notification.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-700">{notification.title}</h3>
                      <p className="text-gray-500 text-sm">{notification.description}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notification.enabled ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        onClick={() => toggleNotification('push', notification.id)}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notification.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Security</h2>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-700">Password</h3>
                  <p className="text-gray-500 text-sm">
                    Change your password to keep your account secure
                  </p>
                </div>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <PasswordChangeModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
};


export default NotificationSettingsPage;


