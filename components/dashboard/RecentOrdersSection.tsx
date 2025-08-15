import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { FaClock, FaChevronRight } from 'react-icons/fa';

const MotionDiv = motion.div;
const MotionButton = motion.button;

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
}

interface RecentOrdersSectionProps {
  orders: Order[];
  onViewOrder?: (orderId?: string) => void;
}

export default function RecentOrdersSection({ orders, onViewOrder }: RecentOrdersSectionProps) {
  const router = useRouter();

  const handleViewAllOrders = () => {
    router.push('/orders');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'preparing':
        return 'Preparing';
      default:
        return 'Processing';
    }
  };

  // Minimalist, uniform status color (subtle blue-gray)
  const statusClass =
    'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/60 rounded-xl overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <FaClock className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
              <p className="text-sm text-slate-600">Your order history</p>
            </div>
          </div>
          {orders.length > 0 && (
            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAllOrders}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              <span>View all</span>
              <FaChevronRight className="w-3 h-3" />
            </MotionButton>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm mb-4">No recent orders</p>
            <MotionButton
              onClick={() => router.push('/menu')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Menu
            </MotionButton>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <MotionDiv
                key={order.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onViewOrder?.(order.id)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-sm flex flex-col gap-2"
              >
                {/* Compact Order Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-700 tracking-tight">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <span className="text-base font-semibold text-slate-900">
                    ₹{order.total}
                  </span>
                </div>
                {/* Items and Date Row */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5"
                      >
                        {item.quantity}× {item.name}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-slate-400">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-normal">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
}
