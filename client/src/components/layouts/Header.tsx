"use client"
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useRouter } from 'next/navigation';
// import { is } from '../../../.next/static/chunks/[root of the server]__1a2556b0._';
import { useAdminLogoutMutation } from '@/redux/features/auth/adminAuthApi';
import { useLogOutMutation } from '@/redux/features/auth/userAuthApi';
import toast from 'react-hot-toast';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout, { isLoading }] = useAdminLogoutMutation();
  const [logoutUser, { isLoading: userLogoutLoading }] = useLogOutMutation();



  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Refs for detecting clicks outside dropdown
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown and the account button
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node) &&
        accountButtonRef.current &&
        !accountButtonRef.current.contains(event.target as Node)
      ) {
        // setIsAccountDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      const logoutFn = isAdmin ? logout : logoutUser;
      await logoutFn({});
      toast.success("Logout successful, redirecting...");
      router.push(isAdmin ? '/admin/login' : '/login');
    } catch (error: Error | string | unknown) {
      toast.error("Logout failed:", error || "An unexpected error occurred");
      const errorMessage = (error as Error).message || "An unexpected error occurred";
      toast.error(`Logout failed: ${errorMessage}`);
    }
  };


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdown2 = () => {
    setIsDropdownOpen2(!isDropdownOpen2);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const AccountDropdown = ({ mobile = false }) => (
    <div
      ref={mobile ? null : accountDropdownRef}
      className={`${mobile ? 'pl-4 border-l-2 border-[#F2F4F8] space-y-2' : 'absolute z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1'}`}
    >
      <Link
        href={isAdmin ? '/admin/dashboard' : '/dashboard'}
        className={`block ${mobile ? 'py-1 text-gray-700' : 'px-4 py-2 text-gray-800'} hover:bg-gray-100 hover:text-primary`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsAccountDropdownOpen(false);
        }}
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard/subscription"
        className={`block ${mobile ? 'py-1 text-gray-700' : 'px-4 py-2 text-gray-800'} hover:bg-gray-100 hover:text-primary`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsAccountDropdownOpen(false);
        }}
      >
        Subscription
      </Link>
      <Link
        href="/vanity-number"
        className={`block ${mobile ? 'py-1 text-gray-700' : 'px-4 py-2 text-gray-800'} hover:bg-gray-100 hover:text-primary`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsAccountDropdownOpen(false);
        }}
      >
        Get OneNumber App
      </Link>
      <Link
        href={isAdmin ? '/admin/login' : '/login'}
        className={`block ${mobile ? 'py-1 text-gray-700' : 'px-4 py-2 text-gray-800'} hover:bg-gray-100 hover:text-primary`}
        onClick={() => {
          setIsMenuOpen(false);
          setIsAccountDropdownOpen(false);
          handleLogout();
        }}
      >
        {isLoading || userLogoutLoading ? 'Logging out...' : 'Logout'}
      </Link>
    </div>
  );

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Image
                  src="/assets/svgs/logos/OneNumber Orange logo.svg"
                  alt="OneNumber Logo"
                  width={40}
                  height={40}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about"
              className={`relative p-3 btn-link ${isActive('/about') ? 'text-primary !hover:text-primary font-medium' : 'text-dark !hover:text-primary'}`}>
              About
              {isActive('/about') && <span className="absolute bottom-2 left-0 w-full h-0.5 bg-primary"></span>}
            </Link>

            {/* Vanity Numbers dropdown */}
            <div className="relative">
              <Link
                href="/vanity-number"
                onClick={toggleDropdown}
                className={`flex items-center btn-link py-3 cursor-pointer focus:outline-none ${isActive('/vanity-number') ? 'text-primary font-medium !hover:text-primary' : 'text-dark !hover:text-primary'}`}
              >
                Vanity Numbers
                {isActive('/vanity-number') && <span className="absolute bottom-2 left-0 w-full h-0.5 bg-primary"></span>}
              </Link>
             
            </div>

            <Link href="/pricing"
              className={`relative p-3 btn-link ${isActive('/pricing') ? 'text-primary font-medium' : 'text-dark hover:text-primary'}`}>
              Pricing
              {isActive('/pricing') && <span className="absolute bottom-2 left-0 w-full h-0.5 bg-primary"></span>}
            </Link>

            {/* Account Dropdown for Desktop */}

          </nav>

          {/* Action Buttons */}
          {!user && <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              Log In
            </Link>
          </div>}

          {user && <div className="relative hidden md:block">
            <button
              ref={accountButtonRef}
              onClick={toggleAccountDropdown}
              className={`flex items-center cursor-pointer btn-link  ${isActive('/account') ? 'text-primary font-medium hover:!text-primary' : 'text-dark !hover:text-primary'}`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              My Account

            </button>
            {isAccountDropdownOpen && <AccountDropdown />}
          </div>}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/about"
              className={`block py-2 ${isActive('/about') ? 'text-primary font-medium' : 'text-gray-800 hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="relative">
              <Link
                href="/vanity-number"
                onClick={toggleDropdown}
                className={`flex items-center btn-link py-5 cursor-pointer focus:outline-none ${isActive('/vanity-number') ? 'text-primary font-medium !hover:text-primary' : 'text-dark !hover:text-primary'}`}
              >
                Vanity Numbers
                
                {isActive('/vanity-number') && <span className="absolute bottom-2 left-0 w-full h-0.5 bg-primary"></span>}
              </Link>
             
            </div>
            <Link
              href="/pricing"
              className={`block py-2 ${isActive('/pricing') ? 'text-primary font-medium' : 'text-gray-800 hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>

            <div className="pt-3 space-y-3">
              {!user && <Link
                href="/login"
                className="block w-full bg-primary hover:bg-primary text-white text-center px-4 py-2 rounded-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>}

              {user && <button
                onClick={toggleDropdown2}
                className={`flex items-center justify-between w-full py-2 ${isActive('/account') ? 'text-primary font-medium' : 'text-gray-800 hover:text-primary'}`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Account
                </div>
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${isDropdownOpen2 ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              }
              {isDropdownOpen2 && <AccountDropdown mobile={true} />}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;