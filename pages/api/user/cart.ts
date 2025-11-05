import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get user's cart
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.userId);

      if (error) throw error;

      return res.status(200).json({ success: true, cart: data });
    } else if (req.method === 'POST') {
      // Add item to cart
      const { product_id, quantity } = req.body;

      if (!product_id || !quantity) {
        return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.userId)
        .eq('product_id', product_id)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({ success: true, cart_item: data });
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.userId,
            product_id,
            quantity
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({ success: true, cart_item: data });
      }
    } else if (req.method === 'DELETE') {
      // Clear cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.userId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Cart cleared' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
