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

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Your order history</p>
            </div>
          </div>
          {orders.length > 0 && (
            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAllOrders}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-2">No recent orders</p>
            <MotionButton
              onClick={() => router.push('/menu')}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Menu
            </MotionButton>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <MotionDiv
                key={order.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onViewOrder?.(order.id)}
                className="bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 text-sm">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <span className="font-semibold text-primary-600">₹{order.total.toFixed(2)}</span>
                </div>
                
                {/* Order Items */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image_url || '/images/default-food.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-food.jpg';
                          }}
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </p>
                  </div>
                </div>
                
                {/* Order Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>View details</span>
                    <FaChevronRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </MotionDiv>
            ))}
            
            {/* View All Button */}
            <MotionButton
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleViewAllOrders}
              className="w-full py-3 text-center text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
            >
              View All Orders
            </MotionButton>
          </div>
        )}
      </div>
    </MotionDiv>
  );
} 