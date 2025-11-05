import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import CanteenLayout from '@/components/canteen/CanteenLayout';
import { useAuth } from '@/context/AuthContext';
import { canteenApi } from '@/lib/canteenApi';
import {
  ClipboardList,
  Loader,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ChefHat,
  Eye,
  X,
} from 'lucide-react';

interface OrderItemProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products: OrderItemProduct;
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  wallet_amount_used: number;
  delivery_type: string;
  room_number?: string;
  notes?: string;
  created_at: string;
  order_items: OrderItem[];
  users?: {
    name: string;
    email: string;
  };
}

export default function CanteenOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
        const data = await canteenApi.orders.getAll(token, statusParam);
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, selectedStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;

    setUpdatingOrder(orderId);
    try {
      const response = await canteenApi.orders.updateStatus(token, orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus as any } : order
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        label: 'Pending',
      },
      accepted: {
        icon: CheckCircle,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        label: 'Accepted',
      },
      preparing: {
        icon: ChefHat,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        label: 'Preparing',
      },
      ready: {
        icon: Package,
        color: 'text-green-600',
        bg: 'bg-green-50',
        label: 'Ready',
      },
      completed: {
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        label: 'Completed',
      },
      cancelled: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        label: 'Cancelled',
      },
    };
    return configs[status] || configs.pending;
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    return flow[currentStatus] || null;
  };

  const statusTabs = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <ProtectedRoute allowedRoles={['canteen']}>
      <CanteenLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-[#0040ffea]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
                <p className="text-gray-600 mt-1">View and manage incoming orders</p>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStatus === tab.value
                      ? 'bg-[#0040ffea] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-[#0040ffea] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all'
                  ? 'No orders have been placed yet.'
                  : `No ${selectedStatus} orders at the moment.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const nextStatus = getNextStatus(order.status);
                const firstProduct = order.order_items[0]?.products;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Product Image and Name */}
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={firstProduct?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                              alt={firstProduct?.name || 'Product'}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800">
                                Order #{order.id.slice(0, 8)}
                              </h3>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                              >
                                {statusConfig.label}
                              </span>
                            </div>
                            {/* Show first product name */}
                            {firstProduct?.name && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Item:</span> {firstProduct.name}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 mb-2">
                              {order.users?.name} • {order.users?.email}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Items: {order.order_items.length}</span>
                              <span>Total: ₹{order.total_amount}</span>
                              <span>
                                Delivery: {order.delivery_type === 'classroom' ? `Room ${order.room_number}` : 'Canteen Pickup'}
                              </span>
                              <span>
                                {new Date(order.created_at).toLocaleString()}
                              </span>
                            </div>
                            {order.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                <span className="font-medium">Note:</span> {order.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {nextStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, nextStatus)}
                            disabled={updatingOrder === order.id}
                            className="px-4 py-2 bg-[#0040ffea] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingOrder === order.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Mark as {getStatusConfig(nextStatus).label}</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="
                  bg-white
                  shadow-xl
                  border border-gray-200
                  max-w-4xl w-full
                  max-h-[90vh]
                  overflow-y-auto
                  rounded-lg
                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                  flex flex-col
                  no-scrollbar
                  "
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between rounded-t-lg z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Order #{selectedOrder.id.slice(0, 8)}
                    </h2>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).color}`}>
                      {getStatusConfig(selectedOrder.status).label}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col md:flex-row gap-8 px-8 py-6 overflow-auto">
                  {/* Left Column: Info */}
                  <div className="flex-1 min-w-0 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded border border-gray-100 p-4">
                      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-gray-400" /> Customer
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Name:</span> {selectedOrder.users?.name}</div>
                        <div><span className="font-medium">Email:</span> {selectedOrder.users?.email}</div>
                      </div>
                    </div>
                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded border border-gray-100 p-4">
                      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" /> Delivery
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Type:</span>{' '}
                          {selectedOrder.delivery_type === 'classroom' ? 'Classroom Delivery' : 'Canteen Pickup'}
                        </div>
                        {selectedOrder.room_number && (
                          <div>
                            <span className="font-medium">Room:</span> {selectedOrder.room_number}
                          </div>
                        )}
                        {selectedOrder.notes && (
                          <div>
                            <span className="font-medium">Notes:</span> {selectedOrder.notes}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Placed:</span>{' '}
                          {new Date(selectedOrder.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded border border-gray-100 p-4">
                      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" /> Payment
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Wallet Used</span>
                          <span className="font-medium text-gray-800">₹{selectedOrder.wallet_amount_used}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Online Payment</span>
                          <span className="font-medium text-gray-800">
                            ₹{selectedOrder.total_amount - selectedOrder.wallet_amount_used}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Column: Items */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded border border-gray-100 p-4">
                      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-gray-400" /> Order Items
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 bg-white rounded border border-gray-100 p-3"
                          >
                            <img
                              src={item.products.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                              alt={item.products.name}
                              className="w-14 h-14 rounded object-cover border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{item.products.name}</div>
                              <div className="text-xs text-gray-500">{item.products.category}</div>
                            </div>
                            <div className="text-right min-w-[70px]">
                              <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                              <div className="font-semibold text-gray-800">₹{item.price_at_time * item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sticky Summary Bar */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between rounded-b-lg z-10">
                  <div className="font-semibold text-gray-700">
                    Total Items: <span className="text-gray-900">{selectedOrder.order_items.length}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-600 font-medium">Total:</span>
                    <span className="font-bold text-[#0040ffea] text-xl">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CanteenLayout>
    </ProtectedRoute>
  );
}
