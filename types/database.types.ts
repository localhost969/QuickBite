// Database Types
export type UserRole = 'user' | 'canteen' | 'admin';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type DeliveryType = 'canteen' | 'classroom';

export type NotificationType = 'order' | 'wallet' | 'coupon' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone_number?: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  wallet_amount_used: number;
  razorpay_payment_id?: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  room_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  razorpay_payment_id?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  amount: number;
  description: string;
  valid_until?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
