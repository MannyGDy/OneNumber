'use client';

import { RootState, useSelector } from '@/redux/store';
import { useState, useEffect } from 'react';
import NotificationPanel from './notifications';


interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isSidebarExpanded, }: HeaderProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);



  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header
      className={`bg-white border-b border-[#F2F4F8] fixed top-0 right-0 z-20 transition-all  duration-300 ${isSidebarExpanded ? 'left-64' : 'left-20'
        }`}
    >
      <div className="flex items-center  justify-end  h-16 px-4">
        {/* Left side with toggle button for sidebar on mobile */}

  

        {/* Right side icons */}
        <div className="flex items-center  space-x-4">
          {/* Notifications */}
          <div className="relative notification-container">
            <NotificationPanel />
          </div>

          {/* User Profile */}
          <div className="relative">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {(user?.firstName?.charAt(0)?.toUpperCase() || '') + (user?.lastName?.charAt(0)?.toUpperCase() || '')}
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.firstName + " " + user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;