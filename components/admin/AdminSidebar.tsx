import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      color: 'text-[#0040ffea]',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Users',
      icon: Users,
      path: '/admin/users',
      color: 'text-[#0040ffea]',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Coupons',
      icon: Ticket,
      path: '/admin/coupons',
      color: 'text-[#0040ffea]',
      bgColor: 'bg-blue-50',
    },
    
  ];

  const isActive = (path: string) => router.pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen pt-0 transition-transform bg-white border-r border-gray-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '256px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-gray-100">
          <div className="w-9 h-9 rounded-md bg-[#0040ffea] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold text-gray-800">
            QuickBite Admin
          </span>
        </div>

        {/* Close button for mobile */}

        {/* Sidebar content as flex column */}
        <div className="flex flex-col h-[calc(100%-72px)]">
          {/* 72px = logo height */}
          {/* Navigation */}
          <div className="flex-1 px-3 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => onClose()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? `${item.bgColor} ${item.color} font-medium shadow-sm`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info and logout at bottom */}
          {user && (
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0040ffea]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
