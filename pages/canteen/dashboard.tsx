import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { 
  FaUtensils, FaMoneyBillWave, FaShoppingCart, 
  FaCheckCircle, FaChartLine, FaClock 
} from 'react-icons/fa';

export default function CanteenDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/orders/canteen', {
        headers: {
          Authorization: localStorage.getItem('token') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const orders = data.orders || [];
          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            totalRevenue: orders.reduce((sum, o) => 
              o.status !== 'cancelled' ? sum + o.total : sum, 0
            ),
            recentOrders: orders.slice(0, 5)
          });
        }
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CanteenLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CanteenLayout>
    );
  }

  return (
    <CanteenLayout>
      <Head>
        <title>Dashboard | QuickBite Canteen</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        {/* Header section (unchanged) */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Canteen Dashboard</h1>
            <p className="text-base text-blue-700 mt-2">Monitor your canteen's performance and orders</p>
          </div>
        </div>

        {/* Stats cards (unchanged) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Today's Orders"
            value={stats.totalOrders}
            icon={FaShoppingCart}
            color="blue"
          />
          <DashboardCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={FaClock}
            color="blue"
          />
          <DashboardCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={FaCheckCircle}
            color="blue"
          />
          <DashboardCard
            title="Today's Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="blue"
          />
        </div>

        {/* Redesigned sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders - Compact, professional table */}
          <div className="bg-white rounded-xl shadow border border-blue-100 flex flex-col min-h-[320px] p-0">
            <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-blue-100">
              <h2 className="text-xl font-bold text-blue-900">Recent Orders</h2>
              <a href="/canteen/orders" className="text-blue-600 hover:underline text-sm font-medium">View all</a>
            </div>
            <div className="overflow-x-auto flex-1">
              {stats.recentOrders.length === 0 ? (
                <div className="text-center text-blue-700 py-12">No recent orders</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-2 text-left font-semibold text-blue-800">Order</th>
                      <th className="px-4 py-2 text-left font-semibold text-blue-800">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-blue-800">Status</th>
                      <th className="px-4 py-2 text-right font-semibold text-blue-800">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-blue-50 hover:bg-blue-50 transition"
                      >
                        <td className="px-4 py-2 font-medium text-blue-900">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-2 text-blue-700">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <StatusBadge status={order.status} size="sm" />
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-blue-900">₹{order.total.toLocaleString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Actions - Compact, modern buttons */}
          <div className="bg-white rounded-xl shadow border border-blue-100 flex flex-col min-h-[320px] p-0">
            <div className="px-6 pt-6 pb-2 border-b border-blue-100">
              <h2 className="text-xl font-bold text-blue-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6">
              <button
                onClick={() => window.location.href = '/canteen/orders'}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-white hover:bg-blue-50 text-blue-700 rounded-lg shadow-sm border border-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold"
              >
                <FaShoppingCart className="w-6 h-6 text-blue-700" />
                <span className="font-semibold text-base">View Orders</span>
              </button>
              <button
                onClick={() => window.location.href = '/canteen/menu'}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-white hover:bg-blue-50 text-blue-700 rounded-lg shadow-sm border border-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold"
              >
                <FaUtensils className="w-6 h-6 text-blue-700" />
                <span className="font-semibold text-base">Manage Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CanteenLayout>
  );
}
