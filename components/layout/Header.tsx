import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaUserCog,
  FaUtensils,
  FaHistory,
  FaShoppingCart,
  FaWallet,
  FaTachometerAlt,
  FaCheck,
  FaTimes,
  FaBellSlash
} from 'react-icons/fa';
import NotificationsDropdown, { Notification } from './NotificationsDropdown';

export default function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch user info
    const token = localStorage.getItem('token');
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
          headers: {
            Authorization: token || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (token) {
      fetchUserInfo();
      fetchNotifications();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/auth');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://localhost969.pythonanywhere.com/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: token || '',
        },
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => fetch(`https://localhost969.pythonanywhere.com/notifications/${n.id}/read`, {
            method: 'PUT',
            headers: { Authorization: token || '' },
          }))
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
    { name: 'Menu', href: '/menu', icon: FaUtensils },
    { name: 'Orders', href: '/orders', icon: FaHistory },
    { name: 'Cart', href: '/cart', icon: FaShoppingCart },
    { name: 'Wallet', href: '/wallet', icon: FaWallet },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <FaUtensils className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              QuickBite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  router.pathname === item.href
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                {router.pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-50 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Wallet Balance */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-150 rounded-lg border border-primary-200 transition-all duration-200"
              onClick={() => router.push('/wallet')}
            >
              <FaWallet className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-primary-700">₹{userInfo?.wallet_balance || 0}</span>
              <span className="text-xs text-primary-500 hidden xl:block">Add Money</span>
            </motion.button>

            {/* Notifications trigger */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <FaBell className="w-5 h-5"/>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications dropdown */}
              <NotificationsDropdown
                show={showNotifications}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all duration-200 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
                aria-expanded={dropdownOpen}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden md:block max-w-24 truncate">
                  {userInfo?.name || 'User'}
                </span>
              </motion.button>

              {/* Redesigned compact dropdown: only profile, email, sign out */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                    role="menu"
                    aria-label="User menu"
                  >
                    {/* Top: user preview */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userInfo?.name}</p>
                          <p className="text-xs text-gray-600 truncate">{userInfo?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Simple profile link */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        <FaUserCog className="w-4 h-4 flex-shrink-0" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
                        role="menuitem"
                      >
                        <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
                      