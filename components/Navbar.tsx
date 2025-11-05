import Link from 'next/link';
import { Utensils, LogOut, User, ChevronDown, Package, ShoppingCart, Wallet, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize cart count from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedWalletBalance = localStorage.getItem('walletBalance');
    if (storedWalletBalance) setWalletBalance(parseFloat(storedWalletBalance));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Background sync - fetch wallet balance only
  useEffect(() => {
    if (!token || user?.role !== 'user') return;

    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the fetch to avoid multiple requests
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        // Fetch wallet balance
        const walletRes = await fetch('/api/user/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData.success) {
            const balance = walletData.wallet_balance || 0;
            setWalletBalance(balance);
            localStorage.setItem('walletBalance', balance.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    }, 1000); // 1 second debounce

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [token, user?.role, router.pathname]);

  const isRootPage = router.pathname === '/';
  const isUserDashboard = router.pathname.includes('/user/');

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-md bg-[#0040ffea] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Utensils className="w-5 h-5 text-[white]" strokeWidth={2.2} />
          </div>
          <span className="font-bold text-lg text-[#011152] tracking-tight">Quickbite</span>
        </Link>

        {/* Right Side - Dashboard (if root), Profile Dropdown or Login */}
        <div className="flex items-center gap-4">
          {isRootPage && user && (
            <Link
              href={`/${user.role}/dashboard`}
              className="px-4 py-2 font-medium rounded-lg bg-[#0040ffea] text-white transition-all duration-200 hover:bg-[#336dff] hover:shadow-sm active:scale-[0.98]"
            >
              Dashboard
            </Link>
          )}

          {/* Dashboard Quick Links - Only on user dashboard */}
          {isUserDashboard && user?.role === 'user' && (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/user/menu"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Package className="w-4 h-4 text-[#0040ffea]" />
                Browse Menu
              </Link>
              <Link
                href="/user/cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <ShoppingCart className="w-4 h-4 text-[#0040ffea]" />
                My Cart
                
              </Link>
              <Link
                href="/user/wallet"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Wallet className="w-4 h-4 text-[#0040ffea]" />
                ₹{walletBalance.toFixed(2)}
              </Link>
              <Link
                href="/user/notifications"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Bell className="w-4 h-4 text-[#0040ffea]" />
                Notifications
              </Link>
            </div>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                        router.push('/');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 font-medium rounded-lg bg-[#0040ffea] text-[white] transition-all duration-200 hover:bg-[#336dff] hover:shadow-sm active:scale-[0.98]"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}