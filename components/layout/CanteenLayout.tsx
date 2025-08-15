import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaSignOutAlt, FaChartBar, FaClipboardList, FaCog, FaBell } from 'react-icons/fa';

export default function CanteenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
        headers: { Authorization: token || '' }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadNotifications(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const menuItems = [
    { 
      href: '/canteen/orders', 
      label: 'Orders', 
      icon: <FaClipboardList className="text-xl" />,
      activePattern: /^\/canteen\/orders/
    },
    { 
      href: '/canteen/menu', 
      label: 'Menu', 
      icon: <FaUtensils className="text-xl" />,
      activePattern: /^\/canteen\/menu/
    },
    { 
      href: '/canteen/dashboard', 
      label: 'Stats', 
      icon: <FaChartBar className="text-xl" />,
      activePattern: /^\/canteen\/dashboard/
    },
    {
      href: '#',
      label: 'Logout',
      icon: <FaSignOutAlt className="text-xl" />,
      onClick: () => {
        localStorage.removeItem('token');
        router.push('/login');
      },
      activePattern: /^$/  // Never matches, so never shows as active
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-0 flex">
      {/* Sidebar Navigation */}
      <aside className="fixed top-0 left-0 h-full w-24 bg-white shadow-lg z-50 flex flex-col items-center border-r border-gray-100">
        {/* Logo */}
        <Link href="/canteen/dashboard" className="mt-8 mb-12 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-2xl shadow">
              QB
            </span>
          </div>
        </Link>
        {/* Centered nav */}
        <nav className="flex flex-col gap-8 flex-1 items-center justify-center w-full">
          {menuItems.map((item) => {
            const isActive = item.activePattern.test(router.pathname);
            return (
              <button
                key={item.href}
                onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
                className={`relative flex flex-col items-center justify-center w-full group`}
                title={item.label}
              >
                <span
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors
                    ${isActive
                      ? 'bg-primary-100 text-primary-600 shadow'
                      : 'text-gray-400 group-hover:text-primary-600 group-hover:bg-gray-100'}
                  `}
                >
                  {item.icon}
                </span>
                <span className={`text-[11px] mt-2 font-medium ${isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-600'}`}>
                  {item.label}
                </span>
                {/* Removed active dot indicator */}
              </button>
            );
          })}
        </nav>
        {/* Notification bell at bottom */}
        <div className="mb-8 flex flex-col items-center">
          {unreadNotifications > 0 && (
            <div className="relative">
              <FaBell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            </div>
          )}
        </div>
      </aside>

     

      {/* Main Content */}
      <main className="pt-16 pl-24 w-full">
        {children}
      </main>
    </div>
  );
}


