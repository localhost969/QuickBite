export interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'refund_processed' | 'general';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  userId?: string;
}

export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'order_ready':
      return '🍽️';
    case 'order_cancelled':
      return '❌';
    case 'refund_processed':
      return '💰';
    case 'general':
    default:
      return '📢';
  }
};

export const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'order_ready':
      return 'border-l-green-400';
    case 'order_cancelled':
      return 'border-l-red-400';
    case 'refund_processed':
      return 'border-l-blue-400';
    case 'general':
    default:
      return 'border-l-gray-400';
  }
};

export const getNotificationBgColor = (type: Notification['type']): string => {
  switch (type) {
    case 'order_ready':
      return 'bg-green-50 border-green-200';
    case 'order_cancelled':
      return 'bg-red-50 border-red-200';
    case 'refund_processed':
      return 'bg-blue-50 border-blue-200';
    case 'general':
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const getNotificationTitle = (type: Notification['type']): string => {
  switch (type) {
    case 'order_ready':
      return 'Order Ready';
    case 'order_cancelled':
      return 'Order Cancelled';
    case 'refund_processed':
      return 'Refund Processed';
    case 'general':
    default:
      return 'Notification';
  }
};

export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  }
};

export const sendNotification = async (
  userEmail: string,
  type: string,
  message: string,
  orderId: string,
  token: string
) => {
  try {
    const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        user_email: userEmail,
        type,
        message,
        order_id: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

export const formatOrderStatus = (status: string): string => {
  const statusMessages = {
    ready: '🍽️ Your order is ready for pickup!',
    cancelled: '❌ Your order has been cancelled',
    completed: '✅ Order completed',
  };
  return statusMessages[status] || status;
};
