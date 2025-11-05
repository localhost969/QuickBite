import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['canteen']);

    if (req.method === 'GET') {
      // Get sales statistics
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_time
          )
        `);

      if (error) throw error;

      // Calculate stats
      const stats = {
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        total_revenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.total_amount, 0),
        today_orders: orders.filter(o => {
          const orderDate = new Date(o.created_at);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).length,
        // Sales graph data (last 7 days)
        sales_graph: []
      };

      // Generate sales graph for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === dateStr && o.status === 'completed';
        });

        stats.sales_graph.push({
          date: dateStr,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0)
        });
      }

      return res.status(200).json({ success: true, stats });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return res.status(401).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
