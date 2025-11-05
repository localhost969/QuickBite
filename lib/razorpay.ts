/**
 * Razorpay Configuration
 * Handles Razorpay payment gateway integration
 */

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RU8OOOFMghgYYa',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'GHPN4eFLPzsyP7KGDGGOeOB1',
});

export default razorpay;

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}
