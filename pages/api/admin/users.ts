import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth, hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['admin']);

    if (req.method === 'GET') {
      // Get users with pagination
      const { page = '1', limit = '10', role } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('users')
        .select('id, name, email, phone_number, wallet_balance, role, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        users: data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } else if (req.method === 'POST') {
      // Create new user (can be user or canteen)
      const { name, email, password, role, phone_number } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
      }

      if (!['user', 'canteen'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: passwordHash,
          role,
          phone_number,
          wallet_balance: 0
        })
        .select('id, name, email, phone_number, wallet_balance, role, created_at')
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, user: newUser });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
