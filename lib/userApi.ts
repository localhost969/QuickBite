/**
 * User API Utilities
 * All API calls for user functionality with centralized token handling
 */

const getAuthHeaders = (token: string | null) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Profile APIs
export const userApi = {
  // Profile
  profile: {
    get: async (token: string | null) => {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    update: async (token: string | null, data: { name?: string; phone_number?: string }) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  // Cart APIs
  cart: {
    get: async (token: string | null) => {
      const response = await fetch('/api/user/cart', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    add: async (token: string | null, data: { product_id: string; quantity: number }) => {
      const response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (token: string | null, cartItemId: string, data: { quantity: number }) => {
      const response = await fetch(`/api/user/cart/${cartItemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
    remove: async (token: string | null, cartItemId: string) => {
      const response = await fetch(`/api/user/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
  },

  // Orders APIs
  orders: {
    get: async (token: string | null) => {
      const response = await fetch('/api/user/orders', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    create: async (token: string | null, data: {
      cart_items: { product_id: string; quantity: number }[];
      delivery_type: 'canteen' | 'classroom';
      room_number?: string;
      notes?: string;
      wallet_amount_used?: number;
      razorpay_payment_id?: string;
    }) => {
      const response = await fetch('/api/user/orders', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
    cancel: async (token: string | null, orderId: string) => {
      const response = await fetch(`/api/user/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ action: 'cancel' }),
      });
      return response.json();
    },
  },

  // Wallet APIs
  wallet: {
    get: async (token: string | null) => {
      const response = await fetch('/api/user/wallet', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    createOrder: async (token: string | null, data: { amount: number }) => {
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
    topUp: async (token: string | null, data: { amount: number; razorpay_payment_id?: string }) => {
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  // Notifications APIs
  notifications: {
    get: async (token: string | null) => {
      const response = await fetch('/api/user/notifications', {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    markAllAsRead: async (token: string | null) => {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
    markAsRead: async (token: string | null, notificationId: string) => {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
      });
      return response.json();
    },
  },

  // Coupons APIs
  coupons: {
    redeem: async (token: string | null, coupon_code: string) => {
      const response = await fetch('/api/user/coupons/redeem', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ coupon_code }),
      });
      return response.json();
    },
  },
};
