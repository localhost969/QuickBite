import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get user profile
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone_number, wallet_balance, role, created_at')
        .eq('id', user.userId)
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, user: data });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, phone_number } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (name) updateData.name = name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.userId)
        .select('id, name, email, phone_number, wallet_balance, role, created_at')
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, user: data });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
