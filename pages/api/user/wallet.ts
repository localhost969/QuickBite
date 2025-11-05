import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import razorpay, { RazorpayOrderResponse } from '@/lib/razorpay';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get wallet balance and transactions
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.userId)
        .single();

      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      return res.status(200).json({
        success: true,
        wallet_balance: userData?.wallet_balance || 0,
        transactions: transactions || []
      });
    } else if (req.method === 'POST') {
      // Create Razorpay order for wallet top-up
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      try {
        // Create Razorpay order
        const receipt = `wallet_${user.userId}_${Math.random().toString(36).substr(2, 9)}`.substring(0, 40);
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          receipt: receipt,
        } as any);

        const orderData = order as unknown as RazorpayOrderResponse;

        return res.status(200).json({
          success: true,
          order: {
            id: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency,
          },
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
      } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create payment order',
          error: error.message 
        });
      }
    } else if (req.method === 'PUT') {
      // Verify and complete Razorpay payment
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing payment verification details' 
        });
      }

      try {
        // Verify signature
        const hmac = crypto.createHmac(
          'sha256',
          process.env.RAZORPAY_KEY_SECRET || 'GHPN4eFLPzsyP7KGDGGOeOB1'
        );
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ 
            success: false, 
            message: 'Payment verification failed' 
          });
        }

        // Payment verified, update wallet
        const { data: userData } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', user.userId)
          .single();

        const newBalance = (userData?.wallet_balance || 0) + amount;

        const { error } = await supabase
          .from('users')
          .update({ 
            wallet_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.userId);

        if (error) throw error;

        // Record transaction
        await supabase.from('wallet_transactions').insert({
          user_id: user.userId,
          amount,
          type: 'credit',
          description: 'Wallet top-up via Razorpay',
          razorpay_payment_id,
          razorpay_order_id
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.userId,
          type: 'wallet',
          title: 'Wallet Topped Up',
          message: `₹${amount} has been added to your wallet`,
          is_read: false
        });

        return res.status(200).json({ 
          success: true, 
          wallet_balance: newBalance,
          message: 'Wallet topped up successfully'
        });
      } catch (error: any) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to process payment',
          error: error.message 
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
