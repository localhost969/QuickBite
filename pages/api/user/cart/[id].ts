import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'PUT') {
      // Update cart item quantity
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Valid quantity is required' });
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.userId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, cart_item: data });
    } else if (req.method === 'DELETE') {
      // Remove item from cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.userId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
