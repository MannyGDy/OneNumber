import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  return (
    <div
      className={`mb-4 p-4 rounded-md ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}
    >
      {message}
    </div>
  );
};

export default Notification;