import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartBar, 
  FaStore, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTicketAlt,
  FaUserCircle
} from 'react-icons/fa';

const menuItems = [
  {
    name: 'Dashboard',
    icon: FaChartBar,
    path: '/admin/dashboard',
    description: 'Overview & Analytics'
  },
  {
    name: 'Users',
    icon: FaUsers,
    path: '/admin/users',
    description: 'Manage Users'
  },
  {
    name: 'Canteens',
    icon: FaStore,
    path: '/admin/canteens',
    description: 'Manage Canteens'
  },
  {
    name: 'Coupons',
    icon: FaTicketAlt,
    path: '/admin/coupons',
    description: 'Manage Coupons'
  },
  {
    name: 'Settings',
    icon: FaCog,
    path: '/admin/settings',
    description: 'System Settings'
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const router = useRouter();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => setIsSidebarOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const getCurrentPageTitle = () => {
    if (title) return title;
    const currentItem = menuItems.find(item => item.path === router.pathname);
    return currentItem?.name || 'Admin';
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 fixed w-full z-50">
        <div className="px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSidebarOpen ? 'close' : 'open'}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QB</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    QuickBite Admin
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">{getCurrentPageTitle()}</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Time Display */}
              <div className="hidden md:block text-sm text-gray-600">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>

              {/* User Menu */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
                title="Logout"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Modern Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || isLargeScreen) && (
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={`
                fixed lg:relative inset-y-0 left-0 z-40 
                w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200/50
                ${isSidebarOpen ? 'block' : 'hidden lg:block'}
              `}
            >
              <div className="p-6 h-full overflow-y-auto">
                {/* Navigation */}
                <nav className="space-y-2">
                  {menuItems.map((item, index) => {
                    const isActive = router.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                              : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600'
                            }
                            ${index === 0 ? 'mt-0' : ''}
                          `}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
                              initial={false}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          
                          <div className="relative z-10 flex items-center gap-4 w-full">
                            <Icon className={`w-5 h-5 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${isActive ? 'text-white' : ''}`}>
                                {item.name}
                              </p>
                              <p className={`text-xs opacity-75 ${
                                isActive ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom Section - Only show when sidebar is visible */}
                {(isSidebarOpen || isLargeScreen) && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                          <FaUserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary-900">Admin User</p>
                          <p className="text-xs text-primary-600">System Administrator</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
