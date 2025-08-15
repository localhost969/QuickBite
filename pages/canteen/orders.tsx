import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUtensils, FaClock, FaCheckCircle, FaTimes, 
  FaBell, FaMotorcycle, FaFilter 
} from 'react-icons/fa';

export default function CanteenOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [filterStatus, page]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`https://localhost969.pythonanywhere.com/orders/canteen?status=${filterStatus}&page=${page}&limit=12`, {
        headers: {
          Authorization: localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setOrders(data.orders || []);
        } else {
          setOrders((prev: any[]) => [...prev, ...(data.orders || [])]);
        }
        setHasMore((data.orders || []).length === 12);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite scroll observer
  const handleObserver = useCallback((entries: any) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [handleObserver]);

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

  // Redesigned OrderCard
  const OrderCard = ({ order }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-3"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-800">#{order.id.slice(0, 8)}</span>
          {/* Removed StatusBadge */}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-800">₹{order.total.toFixed(2)}</span>
          <span className="block text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="flex flex-col gap-2">
        {order.items?.map((item: any, index: number) => (
          <div key={index} className="flex items-start gap-2 bg-gray-100 rounded-md p-2">
            <div className="w-10 h-10 rounded overflow-hidden bg-white border">
              <img 
                src={item.image_url || '/placeholder.png'} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 break-words">{item.name}</p>
              <span className="text-xs text-gray-600">×{item.quantity}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">₹{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Delivery Info */}
      {order.delivery_option === 'classroom' && (
        <div className="bg-gray-100 rounded-md p-2">
          <div className="flex items-center gap-2">
            <FaMotorcycle className="text-gray-600 w-4 h-4" />
            <span className="text-sm font-medium text-gray-800">Classroom Delivery</span>
          </div>
          <div className="text-xs text-gray-600">
            <div><span className="font-semibold">Location:</span> {order.classroom}</div>
            {order.scheduled_time && (
              <div><span className="font-semibold">Scheduled:</span> {new Date(order.scheduled_time).toLocaleString()}</div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <>
            <button
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Accept
            </button>
            <button
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'completed')}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition"
          >
            Mark Completed
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <CanteenLayout>
      <Head>
        <title>Order Management | QuickBite</title>
      </Head>

  <div className="max-w-7xl mx-auto px-6 pt-6 pb-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Order Management</h1>
            <p className="text-base text-blue-700 mt-2">View, filter, and manage all canteen orders in real time</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'ready', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-lg text-base font-semibold transition-colors duration-200
                  ${filterStatus === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 hover:border-blue-300'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="flex flex-col justify-center items-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
            <p className="text-base text-blue-700">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 p-6 rounded-xl inline-block">
              <FaBell className="mx-auto h-10 w-10 text-blue-400" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-blue-900">No {filterStatus} orders</h3>
            <p className="mt-2 text-base text-blue-700">
              {filterStatus === 'pending' 
                ? 'New orders will appear here when placed.'
                : `No ${filterStatus} orders at the moment.`
              }
            </p>
            {filterStatus !== 'pending' && (
              <button
                onClick={() => setFilterStatus('pending')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
              >
                <FaBell className="w-4 h-4" />
                View Pending
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {orders.map((order: any) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
            </div>
            <div ref={loader} />
            {isLoading && page > 1 && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                <span className="ml-3 text-blue-700">Loading more...</span>
              </div>
            )}
            {!hasMore && orders.length > 0 && (
              <div className="text-center py-8 text-blue-400 text-sm">No more orders to load.</div>
            )}
          </>
        )}
      </div>
    </CanteenLayout>
  );
}
