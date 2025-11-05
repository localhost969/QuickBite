import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get order details
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user.userId)
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, order: data });
    } else if (req.method === 'PUT') {
      // Cancel order
      const { action } = req.body;

      if (action !== 'cancel') {
        return res.status(400).json({ success: false, message: 'Invalid action' });
      }

      // Check if order can be cancelled
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.userId)
        .single();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status !== 'pending' && order.status !== 'accepted') {
        return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
      }

      // Cancel order
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refund to wallet
      if (order.wallet_amount_used > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', user.userId)
          .single();

        await supabase
          .from('users')
          .update({ 
            wallet_balance: userData!.wallet_balance + order.wallet_amount_used,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.userId);

        await supabase.from('wallet_transactions').insert({
          user_id: user.userId,
          amount: order.wallet_amount_used,
          type: 'credit',
          description: 'Order cancellation refund'
        });
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.userId,
        type: 'order',
        title: 'Order Cancelled',
        message: `Your order #${order.id.substring(0, 8)} has been cancelled`,
        is_read: false
      });

      return res.status(200).json({ success: true, order: data });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
