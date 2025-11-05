import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['user']);

    if (req.method === 'GET') {
      // Get notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return res.status(200).json({ success: true, notifications: data });
    } else if (req.method === 'PUT') {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.userId)
        .eq('is_read', false);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
