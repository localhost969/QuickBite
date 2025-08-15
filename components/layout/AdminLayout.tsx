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
      width: 220,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      width: 64,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Compact Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200/50 fixed w-full z-50">
        <div className="px-2 lg:px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QB</span>
                </div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    QuickBite
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">{getCurrentPageTitle()}</p>
                </div>
              </div>
            </div>
            {/* Right Section */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-xs text-gray-600">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 text-xs"
                title="Logout"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Redesigned Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || isLargeScreen) && (
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate={isSidebarOpen || isLargeScreen ? "open" : "closed"}
              exit="closed"
              className={`
                group
                fixed
                top-14
                left-0
                z-40
                bg-white/95 backdrop-blur-xl border-r border-gray-200/50
                flex flex-col justify-between
                transition-all duration-200
                ${isSidebarOpen || isLargeScreen ? 'block' : 'hidden lg:block'}
                h-screen
              `}
              style={{ minWidth: 64, maxWidth: 220 }}
            >
              <div className="flex-1 flex flex-col gap-1 py-3">
                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                  {menuItems.map((item, index) => {
                    const isActive = router.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} href={item.path}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            group flex items-center gap-3 px-3 py-2 rounded-lg mx-2 my-0.5 cursor-pointer
                            transition-all duration-150
                            ${isActive 
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow'
                              : 'text-gray-700 hover:bg-gray-100/90 hover:text-primary-600'
                            }
                          `}
                          title={item.name}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                          }`} />
                          <span className={`
                            transition-all duration-200
                            overflow-hidden whitespace-nowrap
                            ${isSidebarOpen || isLargeScreen ? 'opacity-100 w-auto ml-1 text-sm font-medium' : 'opacity-0 w-0 ml-0'}
                          `}>
                            {item.name}
                          </span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
             
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main
          className={`flex-1 min-h-screen transition-all duration-200 ${
            isLargeScreen ? 'ml-[220px]' : ''
          }`}
        >
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
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}