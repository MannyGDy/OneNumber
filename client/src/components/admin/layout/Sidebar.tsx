'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAdminLogoutMutation } from '@/redux/features/auth/adminAuthApi';
import { RootState, useSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useLogOutMutation } from '@/redux/features/auth/userAuthApi';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  dropdownItems?: {
    name: string;
    href: string;
  }[];
};

type SidebarProps = {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [logout, { isLoading }] = useAdminLogoutMutation();
  const [logoutUser] = useLogOutMutation();

  const isAdmin = user?.role === 'admin';

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  if (!user) {
    router.push('/login');
  }

  const navItems: NavItem[] = [
    {
      name: 'Home',
      href: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      name: 'Transaction History',
      href: '/admin/dashboard/transactions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Personal Info',
      href: '/dashboard/personal_info',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      userOnly: true
    },
    {
      name: 'User Management',
      href: '/admin/dashboard/users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Manage Phone Number',
      href: '/admin/dashboard/phone_number',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
      adminOnly: true
    },
    {
      name: 'Subscription',
      href: '/dashboard/subscription',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      ),
      userOnly: true
    },
    {
      name: 'Settings',
      href: isAdmin ? '/admin/dashboard/settings/notification' : '/dashboard/settings/notification',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      hasDropdown: true,
      dropdownItems: [
        { name: 'Notification', href: isAdmin ? '/admin/dashboard/settings/notification' : '/dashboard/settings/notification' },
      ]
    },
    {
      name: 'Logout',
      href: '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      onClick: async () => {
        try {
          if (user?.role === 'admin') {
            await logout().unwrap();
            window.location.href = '/admin/login';
          } else {
            await logoutUser({}).unwrap();
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly && isAdmin) return false;
    return true;
  });

  return (
    <div className={`bg-white border-r border-[#F2F4F8] h-screen transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} fixed top-0 left-0 z-10`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 border-b border-[#F2F4F8] px-4">
          <Link href={"/"} className="flex items-center">
            {isExpanded ? (
              <Image
                src="/assets/svgs/logos/OneNumber Orange logo.svg"
                width={120}
                height={36}
                alt="ONE Communications"
                className="h-8"
              />
            ) : (
              <Image
                src="/assets/svgs/logos/OneNumber Orange logo.svg"
                width={35}
                height={35}
                alt="ONE"
                className="h-8 w-8"
              />
            )}
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isExpanded ? (
                <path d="M19 12H5M12 19l-7-7 7-7" />
              ) : (
                <path d="M5 12h14M12 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        <div className="py-4 flex-grow overflow-y-auto">
          {isExpanded && (
            <>
              <div className="uppercase text-xs text-center font-bold text-gray-500 px-4 mb-2">
                {user?.role} DASHBOARD
              </div>

              {!isAdmin && user?.phoneNumber && (
                <div className="px-4 flex w-full flex-col justify-center item-center">
                  <h2 className="mt-3 text-3xl font-semibold text-center">
                    {user.phoneNumber.phoneNumber}
                  </h2>

                  <div className="text-center gap-2 mt-1">
                    <span className={`text-sm font-medium text-green-600 capitalize `}>
                      {user.phoneNumber.status}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <nav className="mt-2">
            <ul>
              {filteredNavItems.map((item) => (
                <li key={item.name} className="mb-1">
                  {item.name === 'Logout' ? (
                    <button
                      onClick={item.onClick}
                      className="w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 cursor-pointer text-gray-700 hover:text-white hover:bg-red-600"
                      disabled={isLoading}
                    >
                      {item.icon}
                      {isExpanded && <span className="ml-3">{item.name}</span>}
                    </button>
                  ) : (
                    <div>
                      <div
                        className={`
                          flex items-center px-4 py-3 text-sm transition-colors duration-200 cursor-pointer
                          ${(pathname === item.href || (item.hasDropdown && item.dropdownItems?.some(subItem => pathname === subItem.href)))
                            ? 'bg-secondary text-white'
                            : 'text-gray-700 hover:bg-gray-100'}
                        `}
                      >
                        {/* Icon */}
                        <span className="inline-flex">{item.icon}</span>

                        {isExpanded && (
                          <div className="flex items-center justify-between w-full ml-3">
                            {item.hasDropdown ? (
                              <span onClick={() => toggleDropdown(item.name)}>
                                {item.name}
                              </span>
                            ) : (
                              <Link href={item.href}>
                                {item.name}
                              </Link>
                            )}

                            {/* Dropdown arrow for items with subitems */}
                            {item.hasDropdown && (
                              <button
                                onClick={() => toggleDropdown(item.name)}
                                className="focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={`transition-transform duration-200 ${openDropdown === item.name ? 'transform rotate-180' : ''}`}
                                >
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dropdown menu for items with subitems */}
                      {isExpanded && item.hasDropdown && openDropdown === item.name && (
                        <ul className="pl-12 mt-1 mb-2">
                          {item.dropdownItems?.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={`
                                  block py-2 text-sm transition-colors duration-200
                                  ${pathname === subItem.href
                                    ? 'text-secondary font-bold'
                                    : 'text-gray-600 hover:text-gray-900'}
                                `}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;