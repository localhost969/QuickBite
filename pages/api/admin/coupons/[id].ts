import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const user = requireAuth(req, ['admin']);

    if (req.method === 'PUT') {
      // Update coupon (activate/deactivate)
      const { is_active, valid_until } = req.body;

      const updateData: any = {};
      if (is_active !== undefined) updateData.is_active = is_active;
      if (valid_until !== undefined) updateData.valid_until = valid_until;

      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, coupon: data });
    } else if (req.method === 'DELETE') {
      // Delete coupon
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Coupon deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
