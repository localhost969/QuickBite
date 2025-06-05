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

interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'refund_processed';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return '🍽️';
      case 'order_cancelled':
        return '❌';
      case 'refund_processed':
        return '💰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_ready':
        return 'bg-green-50 border-green-200';
      case 'order_cancelled':
        return 'bg-red-50 border-red-200';
      case 'refund_processed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
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

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 border border-transparent hover:border-primary-200"
              >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Enhanced Notifications Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBell className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                                notification.read 
                                  ? 'border-l-gray-200 bg-gray-25' 
                                  : getNotificationColor(notification.type).replace('bg-', 'border-l-').replace('-50', '-400')
                              }`}
                              onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="text-xl flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed ${
                                      notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                      {new Date(notification.timestamp).toLocaleString()}
                                      {notification.orderId && (
                                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                          #{notification.orderId}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markNotificationAsRead(notification.id);
                                    }}
                                    className="p-1.5 hover:bg-primary-100 rounded-full text-primary-600 hover:text-primary-700 transition-colors flex-shrink-0"
                                  >
                                    <FaCheck className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <FaBellSlash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No notifications yet</p>
                          <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all duration-200 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden md:block max-w-24 truncate">
                  {userInfo?.name || 'User'}
                </span>
              </motion.button>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userInfo?.name}</p>
                          <p className="text-xs text-gray-600 truncate">{userInfo?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Mobile Navigation */}
                      <div className="lg:hidden border-b border-gray-100 pb-2 mb-2">
                        {menuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              router.pathname === item.href
                                ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      {/* Profile and Logout */}
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaUserCog className="w-4 h-4 flex-shrink-0" />
                        Profile Settings
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
                        Sign Out
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
