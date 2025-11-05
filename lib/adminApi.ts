// Admin API Utility Functions
const API_BASE = '/api/admin';

export const adminApi = {
  // Dashboard Stats
  dashboard: {
    get: async (token: string) => {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  // Users Management
  users: {
    getAll: async (token: string, page?: number, limit?: number, role?: string) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (role) params.append('role', role);

      const url = params.toString() ? `${API_BASE}/users?${params}` : `${API_BASE}/users`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    getById: async (token: string, userId: string) => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (
      token: string,
      user: {
        name: string;
        email: string;
        password: string;
        role: 'user' | 'canteen';
        phone_number?: string;
      }
    ) => {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      return response.json();
    },

    update: async (
      token: string,
      userId: string,
      updates: {
        name?: string;
        email?: string;
        phone_number?: string;
        role?: 'user' | 'canteen';
      }
    ) => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return response.json();
    },

    delete: async (token: string, userId: string) => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  // Coupons Management
  coupons: {
    getAll: async (token: string) => {
      const response = await fetch(`${API_BASE}/coupons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (
      token: string,
      coupon: {
        code: string;
        amount: number;
        description?: string;
        valid_until?: string;
        user_ids?: string[];
      }
    ) => {
      const response = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(coupon),
      });
      return response.json();
    },

    update: async (
      token: string,
      couponId: string,
      updates: {
        is_active?: boolean;
        valid_until?: string;
      }
    ) => {
      const response = await fetch(`${API_BASE}/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return response.json();
    },

    delete: async (token: string, couponId: string) => {
      const response = await fetch(`${API_BASE}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },
};
