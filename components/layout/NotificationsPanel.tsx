import { motion } from 'framer-motion';
import { FaBell, FaCheck, FaTimes, FaBellSlash } from 'react-icons/fa';

interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'refund_processed';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClose: () => void;
  unreadCount?: number;
}

export default function NotificationsPanel({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClose,
  unreadCount = 0
}: NotificationsPanelProps) {
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_ready':
        return '🍽️';
      case 'order_cancelled':
        return '❌';
      case 'refund_processed':
        return '💰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_ready':
        return 'border-l-green-400';
      case 'order_cancelled':
        return 'border-l-red-400';
      case 'refund_processed':
        return 'border-l-blue-400';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBell className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                  notification.read 
                    ? 'border-l-gray-200 bg-gray-25' 
                    : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${
                        notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        {new Date(notification.timestamp).toLocaleString()}
                        {notification.orderId && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                            #{notification.orderId}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="p-1.5 hover:bg-primary-100 rounded-full text-primary-600 hover:text-primary-700 transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <FaCheck className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaBellSlash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
