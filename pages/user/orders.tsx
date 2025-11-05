import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/userApi';
import { ArrowLeft, Package, Loader, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface OrderItemProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string;
  is_available: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  products: OrderItemProduct;
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

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelingOrder, setCancelingOrder] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== 'user') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const ordersData = await userApi.orders.get(token);
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleCancelOrder = async (orderId: string) => {
    if (!token || !window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelingOrder(orderId);
    try {
      const response = await userApi.orders.cancel(token, orderId);
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
    } finally {
      setCancelingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fff3cd', text: '#856404' };
      case 'accepted':
        return { bg: '#cfe2ff', text: '#084298' };
      case 'preparing':
        return { bg: '#d1e7dd', text: '#0f5132' };
      case 'ready':
        return { bg: '#d1ecf1', text: '#0c5460' };
      case 'completed':
        return { bg: '#d1e7dd', text: '#0f5132' };
      case 'cancelled':
        return { bg: '#f8d7da', text: '#842029' };
      default:
        return { bg: '#e2e3e5', text: '#383d41' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

  <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/user/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-black">My Orders</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#0040ffea' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start ordering delicious food!</p>
            <Link href="/user/menu">
              <button className="px-6 py-3 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#0040ffea' }}>
                Browse Menu
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {orders.map((order) => {
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle blue accent top border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  
                  {/* Header with Icon, Order ID, and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"></p>
                        <p className="font-mono text-sm font-semibold text-black">
                          {order.order_items.map(item => item.products.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      {order.status === 'pending' && <Clock className="w-4 h-4" />}
                      {order.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                      {order.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                      {(order.status !== 'pending' && order.status !== 'completed' && order.status !== 'cancelled') && <AlertCircle className="w-4 h-4" />}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="font-semibold text-black">
                        {order.order_items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)} items
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="font-semibold text-black" style={{ color: '#0040ffea' }}>₹{order.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery Type</p>
                      <p className="font-semibold text-black capitalize">{order.delivery_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Date</p>
                      <p className="font-semibold text-black text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Click Prompt */}
                  <p className="text-sm text-gray-700 font-medium">
                    Order ID: {order.id}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 border bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl border border-gray-300 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-black">Order Details</h2>
                <div
                  className="px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
                  style={{ backgroundColor: getStatusColor(selectedOrder.status).bg, color: getStatusColor(selectedOrder.status).text }}
                >
                  {selectedOrder.status === 'pending' && <Clock className="w-4 h-4" />}
                  {selectedOrder.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {selectedOrder.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                  {(selectedOrder.status !== 'pending' && selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled') && <AlertCircle className="w-4 h-4" />}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-black">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-black">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Type</p>
                  <p className="font-semibold text-black capitalize">{selectedOrder.delivery_type}</p>
                </div>
                {selectedOrder.room_number && (
                  <div>
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="font-semibold text-black">{selectedOrder.room_number}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-semibold text-black">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-black mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.products.name} x {item.quantity}
                      </span>
                      <span className="font-semibold text-black">
                        ₹{(item.price_at_time * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-black">Total Amount</span>
                  <span className="font-bold text-lg" style={{ color: '#0040ffea' }}>
                    ₹{selectedOrder.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cancel Button */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  disabled={cancelingOrder === selectedOrder.id}
                  className="w-full py-3 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {cancelingOrder === selectedOrder.id ? 'Canceling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
