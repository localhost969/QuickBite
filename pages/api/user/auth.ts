import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { action, name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (action === 'signup') {
      // Sign up
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required for signup' });
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
          role: 'user',
          wallet_balance: 0
        })
        .select()
        .single();

      if (error) throw error;

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          wallet_balance: newUser.wallet_balance
        }
      });
    } else if (action === 'login') {
      // Login
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password_hash);
      
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          wallet_balance: user.wallet_balance,
          phone_number: user.phone_number
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
