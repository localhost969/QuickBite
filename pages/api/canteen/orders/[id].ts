import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const user = requireAuth(req, ['canteen']);

    if (req.method === 'PUT') {
      // Update order status
      const { status } = req.body;

      const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid status is required' });
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        type: 'order',
        title: 'Order Status Updated',
        message: `Your order #${order.id.substring(0, 8)} is now ${status}`,
        is_read: false
      });

      return res.status(200).json({ success: true, order });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
