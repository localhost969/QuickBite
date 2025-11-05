import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = requireAuth(req, ['admin']);

    if (req.method === 'GET') {
      // Get comprehensive dashboard statistics
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_time
          )
        `);

      const { data: users } = await supabase
        .from('users')
        .select('*');

      const { data: products } = await supabase
        .from('products')
        .select('*');

      // Calculate stats
      const stats = {
        total_users: users?.length || 0,
        total_orders: orders?.length || 0,
        total_products: products?.length || 0,
        pending: orders?.filter((o: any) => o.status === 'pending').length || 0,
        accepted: orders?.filter((o: any) => o.status === 'accepted').length || 0,
        preparing: orders?.filter((o: any) => o.status === 'preparing').length || 0,
        ready: orders?.filter((o: any) => o.status === 'ready').length || 0,
        completed: orders?.filter((o: any) => o.status === 'completed').length || 0,
        cancelled: orders?.filter((o: any) => o.status === 'cancelled').length || 0,
        total_revenue: orders
          ?.filter((o: any) => o.status === 'completed')
          .reduce((sum: number, o: any) => sum + o.total_amount, 0) || 0,
        today_orders: orders?.filter((o: any) => {
          const orderDate = new Date(o.created_at);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        }).length || 0,
        // Sales graph data (last 30 days)
        sales_graph: [],
        // User role distribution
        user_roles: {
          users: users?.filter((u: any) => u.role === 'user').length || 0,
          canteen: users?.filter((u: any) => u.role === 'canteen').length || 0,
          admin: users?.filter((u: any) => u.role === 'admin').length || 0
        }
      };

      // Generate sales graph for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = orders?.filter((o: any) => {
          const orderDate = new Date(o.created_at);
          return orderDate.toISOString().split('T')[0] === dateStr && o.status === 'completed';
        }) || [];

        (stats.sales_graph as any[]).push({
          date: dateStr,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0)
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
