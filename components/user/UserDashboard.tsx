import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Package, ShoppingCart, Wallet, Bell, ArrowRight, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import ProductCard from '../ProductCard';
import { cartStorage } from '@/lib/cartStorage';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string | null;
  description: string;
  is_available: boolean;
}

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: Product;
}

interface CartData {
  success: boolean;
  cart: CartItem[];
}

interface WalletData {
  success: boolean;
  wallet_balance: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order_status' | 'coupon' | 'wallet' | 'general';
  is_read: boolean;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  products: Product;
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  wallet_amount_used: number;
  razorpay_payment_id: string | null;
  delivery_type: string;
  room_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export default function UserDashboard() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // New: error buckets + refresh spinner
  const [errors, setErrors] = useState<{
    cart?: string;
    wallet?: string;
    products?: string;
    notifications?: string;
    orders?: string;
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  // New: derived data
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // New: currency formatter (consistent INR format)
  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);

  // Load cart from localStorage on mount
  useEffect(() => {
    const cart = cartStorage.getCart();
    setCartItems(cart);
    const totalItems = cartStorage.getTotalItems();
    setCartCount(totalItems);
  }, []);

  // Cart handlers
  const handleAddToCart = (productId: string) => {
    setAddingToCart(productId);
    try {
      cartStorage.addToCart(productId, 1);
      const updatedCart = cartStorage.getCart();
      setCartItems(updatedCart);
      const totalItems = cartStorage.getTotalItems();
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setAddingToCart(productId);
    try {
      cartStorage.removeFromCart(productId, 1);
      const updatedCart = cartStorage.getCart();
      setCartItems(updatedCart);
      const totalItems = cartStorage.getTotalItems();
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  // Centralized data loaders (reusable on refresh)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrors((e) => ({ ...e, wallet: undefined }));
    try {
      const walletRes = await fetch('/api/user/wallet', { headers: { Authorization: `Bearer ${token}` } });

      if (walletRes.ok) {
        const walletData: WalletData = await walletRes.json();
        if (walletData.success) {
          setWalletBalance(walletData.wallet_balance || 0);
        }
      } else {
        setErrors((e) => ({ ...e, wallet: 'Unable to load wallet.' }));
      }
    } catch {
      setErrors((e) => ({ ...e, wallet: 'Unable to load wallet.' }));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    setErrors((e) => ({ ...e, notifications: undefined }));
    try {
      const notifRes = await fetch('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success && notifData.notifications) {
          setNotifications(notifData.notifications);
        }
      } else {
        setErrors((e) => ({ ...e, notifications: 'Unable to load notifications.' }));
      }
    } catch {
      setErrors((e) => ({ ...e, notifications: 'Unable to load notifications.' }));
    } finally {
      setNotifLoading(false);
    }
  }, [token]);

  const fetchSpecialProducts = useCallback(async () => {
    setProductsLoading(true);
    setErrors((e) => ({ ...e, products: undefined }));
    try {
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (productsData.success && productsData.products) {
          setSpecialProducts(productsData.products.slice(0, 6));
        }
      } else {
        setErrors((e) => ({ ...e, products: 'Unable to load products.' }));
      }
    } catch {
      setErrors((e) => ({ ...e, products: 'Unable to load products.' }));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    setOrdersLoading(true);
    setErrors((e) => ({ ...e, orders: undefined }));
    try {
      const ordersRes = await fetch('/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          setRecentOrders(ordersData.orders.slice(0, 3));
        }
      } else {
        setErrors((e) => ({ ...e, orders: 'Unable to load orders.' }));
      }
    } catch {
      setErrors((e) => ({ ...e, orders: 'Unable to load orders.' }));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // New: mark all notifications as read (best-effort)
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/user/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // no-op
    }
  }, [token]);

  // New: one-tap refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchNotifications(), fetchSpecialProducts(), fetchRecentOrders()]);
    setRefreshing(false);
  }, [fetchDashboardData, fetchNotifications, fetchSpecialProducts, fetchRecentOrders]);

  useEffect(() => {
    if (!token) return;
    handleRefresh();
  }, [token, handleRefresh]);

  // Helper: Get emoji by notification type
  const getNotificationEmoji = (type: string) => {
    switch (type) {
      case 'order_status':
        return '📦';
      case 'coupon':
        return '🎟️';
      case 'wallet':
        return '💳';
      default:
        return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome + Refresh */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your orders, cart, wallet, and notifications</p>
          </div>
          
        </div>

        {/* KPI Tiles */}
          

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Specials */}
          <div className="lg:col-span-2 space-y-6">
            <section
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              aria-busy={productsLoading}
              aria-live="polite"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🌟 Today&apos;s Specials</h2>
                  <p className="text-sm text-gray-500 mt-1">Fresh picks curated for you</p>
                </div>
                <Link
                  href="/user/menu"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Error state */}
              {errors.products && !productsLoading ? (
                <div className="text-center py-10">
                  <p className="text-sm text-red-600">{errors.products}</p>
                </div>
              ) : productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : specialProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      category={product.category}
                      price={product.price}
                      description={product.description}
                      is_available={product.is_available}
                      image_url={product.image_url}
                      quantity={cartItems.get(product.id) || 0}
                      isLoading={addingToCart === product.id}
                      onAdd={handleAddToCart}
                      onRemove={handleRemoveFromCart}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shortcuts (polished) */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="space-y-3">
                <Link href="/user/menu" className="block group">
                  <div className="p-3 rounded-lg bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Browse Menu</p>
                          <p className="text-xs text-gray-600">Order now</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </Link>

                <Link href="/user/cart" className="block group">
                  <div className="p-3 rounded-lg bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">My Cart</p>
                          <p className="text-xs text-gray-600">{loading ? '…' : `${cartCount} items`}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </Link>

                <Link href="/user/wallet" className="block group">
                  <div className="p-3 rounded-lg bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">My Wallet</p>
                          <p className="text-xs font-medium text-blue-600">
                            {loading ? '…' : formatINR(walletBalance)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Recent Orders (improved empty state) */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Recent Orders
                </h2>
                <Link
                  href="/user/orders"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                >
                  All
                </Link>
              </div>
              <div className="border-t border-gray-100 pt-3" aria-busy={ordersLoading} aria-live="polite">
                {errors.orders && !ordersLoading ? (
                  <p className="text-red-600 text-xs text-center py-3">{errors.orders}</p>
                ) : ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse p-3">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center px-3 py-4">
                    <Package className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="mt-2 text-sm text-gray-600">Your recent orders will appear here</p>
                    <Link
                      href="/user/menu"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Start ordering <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentOrders.map((order) => (
                      <Link key={order.id} href="/user/orders">
                        <div className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {order.order_items.length > 0 ? order.order_items[0].products.name : 'Order'}
                                {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                              {order.status === 'pending' && <Clock className="w-3 h-3" />}
                              {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                              {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                              {(order.status !== 'pending' && order.status !== 'completed' && order.status !== 'cancelled') && <AlertCircle className="w-3 h-3" />}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className="text-xs text-gray-600">
                              {order.order_items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)} items
                            </p>
                            <p className="font-semibold text-blue-600 text-sm">{formatINR(order.total_amount)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Notifications (unread aware + mark-all-read) */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Notifications
                  {!notifLoading && unreadCount > 0 && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  {!notifLoading && notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    href="/user/notifications"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    All
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3" aria-busy={notifLoading} aria-live="polite">
                {errors.notifications && !notifLoading ? (
                  <p className="text-red-600 text-xs text-center py-3">{errors.notifications}</p>
                ) : notifLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-3">No notifications</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2.5 rounded-lg transition-colors cursor-pointer border ${
                          notification.is_read
                            ? 'bg-gray-50 hover:bg-gray-100 border-gray-100'
                            : 'bg-blue-50/60 hover:bg-blue-100 border-blue-100'
                        }`}
                      >
                        <div className="flex gap-2">
                          <span className="text-lg flex-shrink-0">{getNotificationEmoji(notification.type)}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-blue-600 text-xs truncate">{notification.title}</h4>
                              {!notification.is_read && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <div className="fixed bottom-8 right-8 z-40">
            <Link href="/user/cart">
              <button className="px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all hover:shadow-xl"
                style={{ backgroundColor: '#0040ffea' }}>
                View Cart ({cartCount})
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}