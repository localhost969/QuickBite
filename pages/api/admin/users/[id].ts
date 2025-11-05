import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const user = requireAuth(req, ['admin']);

    if (req.method === 'GET') {
      // Get user details
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone_number, wallet_balance, role, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, user: data });
    } else if (req.method === 'PUT') {
      // Update user info (admin cannot edit wallet balance directly)
      const { name, email, phone_number, role } = req.body;

      const updateData: any = { updated_at: new Date().toISOString() };
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      if (role && ['user', 'canteen'].includes(role)) updateData.role = role;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, name, email, phone_number, wallet_balance, role, created_at, updated_at')
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, user: data });
    } else if (req.method === 'DELETE') {
      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
