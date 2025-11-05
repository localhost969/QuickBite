import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['canteen', 'admin']);

    if (req.method === 'GET') {
      // Get all products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, products: data });
    } else if (req.method === 'POST') {
      // Create new product
      const { name, description, price, image_url, category } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          name,
          description,
          price,
          image_url,
          category,
          is_available: true,
          created_by: user.userId
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, product: data });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
