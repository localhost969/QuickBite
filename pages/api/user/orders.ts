import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get user's orders
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, orders: data });
    } else if (req.method === 'POST') {
      // Create new order
      const { cart_items, delivery_type, room_number, notes, wallet_amount_used, razorpay_payment_id } = req.body;

      if (!cart_items || cart_items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      if (!delivery_type || !['canteen', 'classroom'].includes(delivery_type)) {
        return res.status(400).json({ success: false, message: 'Valid delivery type is required' });
      }

      if (delivery_type === 'classroom' && !room_number) {
        return res.status(400).json({ success: false, message: 'Room number is required for classroom delivery' });
      }

      // Calculate total
      let total = 0;
      for (const item of cart_items) {
        const { data: product } = await supabase
          .from('products')
          .select('price')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          total += product.price * item.quantity;
        }
      }

      // Verify wallet balance if using wallet
      if (wallet_amount_used > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', user.userId)
          .single();

        if (!userData || userData.wallet_balance < wallet_amount_used) {
          return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct from wallet
        const { error: walletError } = await supabase
          .from('users')
          .update({ 
            wallet_balance: userData.wallet_balance - wallet_amount_used,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.userId);

        if (walletError) throw walletError;

        // Record wallet transaction
        await supabase.from('wallet_transactions').insert({
          user_id: user.userId,
          amount: -wallet_amount_used,
          type: 'debit',
          description: 'Order payment'
        });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.userId,
          total_amount: total,
          wallet_amount_used: wallet_amount_used || 0,
          razorpay_payment_id,
          status: 'pending',
          delivery_type,
          room_number,
          notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of cart_items) {
        const { data: product } = await supabase
          .from('products')
          .select('price')
          .eq('id', item.product_id)
          .single();

        await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_time: product?.price || 0
        });
      }

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.userId);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.userId,
        type: 'order',
        title: 'Order Placed',
        message: `Your order #${order.id.substring(0, 8)} has been placed successfully`,
        is_read: false
      });

      return res.status(201).json({ success: true, order });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
