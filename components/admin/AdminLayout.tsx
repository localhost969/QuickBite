import { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 canteen-scrollbar">
      {/* Sidebar only, no navbar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main content with left margin for sidebar on desktop */}
      <div className="lg:ml-64 pt-2">
        {/* Mobile menu button at top-right */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white border rounded-lg shadow hover:bg-gray-100 transition-colors"
        >
          {/* Hamburger icon */}
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
