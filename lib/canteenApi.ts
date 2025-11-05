// Canteen API Utility Functions
const API_BASE = '/api/canteen';

export const canteenApi = {
  // Orders Management
  orders: {
    getAll: async (token: string, status?: string) => {
      const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    updateStatus: async (token: string, orderId: string, status: string) => {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
  },

  // Products Management
  products: {
    getAll: async (token: string) => {
      const response = await fetch(`${API_BASE}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (
      token: string,
      product: {
        name: string;
        description: string;
        price: number;
        category: string;
        image_url?: string;
      }
    ) => {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      return response.json();
    },

    update: async (
      token: string,
      productId: string,
      updates: {
        name?: string;
        description?: string;
        price?: number;
        category?: string;
        image_url?: string;
        is_available?: boolean;
      }
    ) => {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return response.json();
    },

    delete: async (token: string, productId: string) => {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  // Statistics
  stats: {
    get: async (token: string) => {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },
};
