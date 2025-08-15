import { AnimatePresence, motion } from 'framer-motion';
import { FaBell, FaCheck, FaTimesCircle, FaUtensils, FaMoneyBillAlt } from 'react-icons/fa';

export interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'refund_processed';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

interface NotificationsDropdownProps {
  show: boolean;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClose: () => void;
}

export default function NotificationsDropdown({
  show,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose
}: NotificationsDropdownProps) {
  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const delta = (Date.now() - new Date(iso).getTime()) / 1000;
    if (delta < 60) return `${Math.floor(delta)}s`;
    if (delta < 3600) return `${Math.floor(delta / 60)}m`;
    if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
    return `${Math.floor(delta / 86400)}d`;
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_ready':        return <FaUtensils />;
      case 'order_cancelled':    return <FaTimesCircle />;
      case 'refund_processed':   return <FaMoneyBillAlt />;
      default:                   return <FaBell />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-[28rem] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          role="menu"
          aria-label="Notifications"
        >
          {/* header */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-900">
              <FaBell className="w-3 h-3 text-primary-600"/>
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-[10px] text-primary-600 hover:text-primary-700"
                >
                  Mark all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                aria-label="Close notifications"
              >
                <FaTimesCircle className="w-3 h-3"/>
              </button>
            </div>
          </div>

          {/* list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {notifications.length > 0 ? (
              notifications.map(n => {
                // Always use border-blue-500 for unread, border-gray-100 for read
                const border = n.read
                  ? 'border-gray-100 bg-white'
                  : `border-blue-600 bg-white`;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${border}`}
                    onClick={() => !n.read && onMarkAsRead(n.id)}
                    role="menuitem"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                        n.read ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-700'
                      }`}>
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${
                          n.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                        }`}>
                          {n.message}
                        </p>
                        {!n.read && (
                          <button
                            onClick={e => { e.stopPropagation(); onMarkAsRead(n.id); }}
                            className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded transition-colors"
                            aria-label="Mark as read"
                          >
                            <FaCheck className="w-3 h-3"/>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                        <span>{timeAgo(n.timestamp)}</span>
                        {n.orderId && <span className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">#{n.orderId}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs">
                No notifications
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
