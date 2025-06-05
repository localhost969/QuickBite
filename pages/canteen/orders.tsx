import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  FaUtensils, FaClock, FaCheckCircle, FaTimes, 
  FaBell, FaMotorcycle, FaFilter 
} from 'react-icons/fa';

export default function CanteenOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`https://localhost969.pythonanywhere.com/orders/canteen?status=${filterStatus}`, {
        headers: {
          Authorization: localStorage.getItem('token') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`https://localhost969.pythonanywhere.com/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') || ''
        },
        body: JSON.stringify({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        toast.success(`Order ${newStatus} successfully`);
        fetchOrders(); // Refresh orders list
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const OrderCard = ({ order }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
    >
      {/* Order Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900">#{order.id.slice(0, 8)}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {order.items?.length || 0} items
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                <img 
                  src={item.image_url || '/placeholder.png'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">
                    ×{item.quantity}
                  </span>
                  <span>₹{item.price}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">₹{(item.quantity * item.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        {order.delivery_option === 'classroom' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FaMotorcycle className="text-blue-600 w-4 h-4" />
              <span className="font-medium text-blue-900 text-sm">Classroom Delivery</span>
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div><span className="font-medium">Location:</span> {order.classroom}</div>
              {order.scheduled_time && (
                <div><span className="font-medium">Scheduled:</span> {new Date(order.scheduled_time).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}

        {/* Order Actions */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <FaUtensils className="w-3 h-3" />
                  Accept
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                  Cancel
                </button>
              </>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <FaCheckCircle className="w-3 h-3" />
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <CanteenLayout>
      <Head>
        <title>Order Management | QuickByte</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
          
          <div className="flex flex-wrap gap-2">
            {['pending', 'ready', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${filterStatus === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-4 rounded-lg inline-block">
              <FaBell className="mx-auto h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No {filterStatus} orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'pending' 
                ? 'New orders will appear here when placed.'
                : `No ${filterStatus} orders at the moment.`
              }
            </p>
            {filterStatus !== 'pending' && (
              <button
                onClick={() => setFilterStatus('pending')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <FaBell className="w-3 h-3" />
                View Pending
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CanteenLayout>
  );
}
