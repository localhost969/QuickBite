import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['admin']);

    if (req.method === 'GET') {
      // Get all coupons
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, coupons: data });
    } else if (req.method === 'POST') {
      // Create new coupon
      const { code, amount, description, valid_until, user_ids } = req.body;

      if (!code || !amount) {
        return res.status(400).json({ success: false, message: 'Code and amount are required' });
      }

      // Check if coupon code already exists
      const { data: existingCoupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', code)
        .single();

      if (existingCoupon) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }

      // Create coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .insert({
          code,
          amount,
          description,
          valid_until,
          is_active: true,
          created_by: user.userId
        })
        .select()
        .single();

      if (error) throw error;

      // Assign coupon to users
      if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
        const userCoupons = user_ids.map((userId: string) => ({
          user_id: userId,
          coupon_id: coupon.id,
          is_redeemed: false
        }));

        await supabase.from('user_coupons').insert(userCoupons);

        // Send notifications to users
        const notifications = user_ids.map((userId: string) => ({
          user_id: userId,
          type: 'coupon',
          title: 'New Coupon Available',
          message: `You've received a coupon: ${code} worth ₹${amount}`,
          is_read: false
        }));

        await supabase.from('notifications').insert(notifications);
      }

      return res.status(201).json({ success: true, coupon });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
