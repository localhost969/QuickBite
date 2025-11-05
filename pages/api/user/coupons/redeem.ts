import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'POST') {
      // Redeem coupon
      const { coupon_code } = req.body;

      if (!coupon_code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
      }

      // Get coupon
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .eq('is_active', true)
        .single();

      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
      }

      // Check if coupon is still valid
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }

      // Check if user has already redeemed this coupon
      const { data: userCoupon } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.userId)
        .eq('coupon_id', coupon.id)
        .single();

      if (userCoupon && userCoupon.is_redeemed) {
        return res.status(400).json({ success: false, message: 'Coupon already redeemed' });
      }

      // Add coupon amount to wallet
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.userId)
        .single();

      const newBalance = (userData?.wallet_balance || 0) + coupon.amount;

      await supabase
        .from('users')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.userId);

      // Record wallet transaction
      await supabase.from('wallet_transactions').insert({
        user_id: user.userId,
        amount: coupon.amount,
        type: 'credit',
        description: `Coupon redeemed: ${coupon_code}`
      });

      // Mark coupon as redeemed
      if (userCoupon) {
        await supabase
          .from('user_coupons')
          .update({ 
            is_redeemed: true,
            redeemed_at: new Date().toISOString()
          })
          .eq('id', userCoupon.id);
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.userId,
        type: 'coupon',
        title: 'Coupon Redeemed',
        message: `₹${coupon.amount} has been added to your wallet`,
        is_read: false
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Coupon redeemed successfully',
        amount: coupon.amount,
        wallet_balance: newBalance
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
