import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/adminApi';
import {
  TrendingUp,
  Loader,
  Users,
  ShoppingBag,
  DollarSign,
  Ticket,
  Activity,
  Zap,
  CheckCircle,
  BarChart3,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SalesGraphData {
  date: string;
  orders: number;
  revenue: number;
}

interface AdminStats {
  total_users: number;
  total_canteens: number;
  total_orders: number;
  total_revenue: number;
  total_coupons: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  today_orders?: number;
  sales_graph?: SalesGraphData[];
  total_products?: number;
  accepted?: number;
  preparing?: number;
  ready?: number;
  user_roles?: {
    users: number;
    canteen: number;
    admin: number;
  };
}

// Color palette - Blue theme only
const COLORS = {
  primary: '#0040ffea',
  light: '#f3f4f6',
  dark: '#1f2937',
};

// Blue theme shades for status colors
const STATUS_COLORS = [
  '#7dd3fc',    // pending - light blue
  '#3b82f6',    // accepted - blue
  '#0040ffea',  // preparing - primary blue
  '#1d4ed8',    // ready - dark blue
  '#1e3a8a',    // completed - darker blue
  '#64748b'     // cancelled - gray-blue
];

const StatusLegendDot = ({ color }: { color: string }) => (
  <span
    className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
    style={{ backgroundColor: color }}
  />
);

// Map names to existing status colors (no new colors)
const ORDER_STATUS_COLOR_MAP: Record<string, string> = {
  Pending: STATUS_COLORS[0],
  Completed: STATUS_COLORS[4],
  Cancelled: STATUS_COLORS[5],
};

const USER_DIST_COLOR_MAP: Record<string, string> = {
  'Regular Users': STATUS_COLORS[1],
  'Canteen Managers': STATUS_COLORS[3],
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  // New: production-grade state
  const [error, setError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState<number>(10);

  // New: centralize fetching with retry
  const fetchStats = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const data = await adminApi.dashboard.get(token);
      if (data.success && data.stats) {
        setStats({
          ...data.stats,
          total_canteens: data.stats.user_roles?.canteen || 0,
          pending_orders: data.stats.pending || 0,
          completed_orders: data.stats.completed || 0,
          cancelled_orders: data.stats.cancelled || 0,
          total_coupons: 0,
        });
      } else {
        setError('Unable to load dashboard right now. Please try again.');
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
      setError('Unable to load dashboard right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchStats();
  }, [token, fetchStats]);

  // Prepare data for order status pie chart
  const getOrderStatusData = () => {
    if (!stats) return [];
    return [
      { name: 'Pending', value: stats.pending_orders || 0 },
      { name: 'Completed', value: stats.completed_orders || 0 },
      { name: 'Cancelled', value: stats.cancelled_orders || 0 },
    ].filter(item => item.value > 0);
  };

  // Prepare sales graph data - respect selected range
  const getSalesGraphData = () => {
    if (!stats?.sales_graph?.length) return [];
    return stats.sales_graph.slice(-chartDays).map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: day.revenue,
      orders: day.orders
    }));
  };

  // User distribution data
  const getUserDistributionData = () => {
    if (!stats) return [];
    return [
      { name: 'Regular Users', value: stats.user_roles?.users || 0 },
      { name: 'Canteen Managers', value: stats.user_roles?.canteen || 0 },
    ].filter(item => item.value > 0);
  };

  // Calculate analytics metrics
  const avgOrderValue = stats && stats.total_orders > 0 
    ? Math.round((stats.total_revenue || 0) / stats.total_orders)
    : 0;

  const completionRate = stats && stats.total_orders > 0
    ? Math.round((stats.completed_orders || 0) / stats.total_orders * 100)
    : 0;

  const cancellationRate = stats && stats.total_orders > 0
    ? Math.round((stats.cancelled_orders || 0) / stats.total_orders * 100)
    : 0;

  const handleRefresh = () => fetchStats();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Welcome Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-600 mt-2">System-wide analytics and management</p>
                </div>
              </div>
            </div>

            {/* New: Error banner (keeps theme colors) */}
            {error && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{error}</span>
                  <button
                    onClick={handleRefresh}
                    className="ml-auto text-sm text-blue-600 hover:underline"
                    aria-label="Retry loading dashboard"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-gray-600">Loading your dashboard...</p>
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Top KPI Cards - 4 Main Metrics in Single Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {/* Total Revenue */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">₹{stats.total_revenue?.toLocaleString() || 0}</h3>
                    <p className="text-xs text-blue-600 font-medium">All time</p>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stats.total_orders || 0}</h3>
                    <p className="text-xs text-blue-600 font-medium">All time</p>
                  </div>

                  {/* Total Users */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stats.total_users || 0}</h3>
                    <p className="text-xs text-blue-600 font-medium">Regular users</p>
                  </div>

                  {/* Canteen Managers */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Canteens</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stats.total_canteens || 0}</h3>
                    <p className="text-xs text-blue-600 font-medium">Active canteens</p>
                  </div>
                </div>

                {/* Charts Section with range selector and refresh */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                      <p className="text-xs text-gray-500 mt-1">Recent performance</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {[7, 10, 30].map((n) => (
                          <button
                            key={n}
                            onClick={() => setChartDays(n)}
                            className={`px-3 py-1.5 text-xs font-medium transition ${
                              chartDays === n
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            aria-pressed={chartDays === n}
                            aria-label={`Show last ${n} days`}
                          >
                            {n}D
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleRefresh}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                        aria-label="Refresh data"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {getSalesGraphData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getSalesGraphData()}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: `2px solid ${COLORS.primary}`,
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={COLORS.primary}
                          strokeWidth={3}
                          dot={{ fill: COLORS.primary, r: 5 }}
                          activeDot={{ r: 7 }}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-gray-400">
                      <TrendingUp className="w-16 h-16 opacity-30 mr-4" />
                      <p>No data available</p>
                    </div>
                  )}
                </div>

                {/* Orders Volume Chart - same palette */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Orders Volume</h2>
                      <p className="text-xs text-gray-500 mt-1">Daily order count trend</p>
                    </div>
                  </div>

                  {getSalesGraphData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getSalesGraphData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: `2px solid ${COLORS.primary}`,
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any) => `${value} orders`}
                        />
                        <Bar dataKey="orders" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-gray-400">
                      <p>No data available</p>
                    </div>
                  )}
                </div>

                {/* New: Distribution Section (Order Status + User Distribution) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Order Status Distribution */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                        <p className="text-xs text-gray-500 mt-1">Pending vs Completed vs Cancelled</p>
                      </div>
                    </div>

                    {getOrderStatusData().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: `2px solid ${COLORS.primary}`,
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value: any, name: any) => [`${value}`, name]}
                            />
                            <Pie
                              data={getOrderStatusData()}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                              stroke="#ffffff"
                              strokeWidth={2}
                            >
                              {getOrderStatusData().map((entry, index) => (
                                <Cell key={`cell-status-${index}`} fill={ORDER_STATUS_COLOR_MAP[entry.name]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-3">
                          {getOrderStatusData().map((d) => (
                            <div key={d.name} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: ORDER_STATUS_COLOR_MAP[d.name] }}
                                />
                                <span className="text-sm text-gray-700">{d.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>

                  {/* User Distribution */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">User Distribution</h2>
                        <p className="text-xs text-gray-500 mt-1">Users vs Canteen Managers</p>
                      </div>
                    </div>

                    {getUserDistributionData().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: `2px solid ${COLORS.primary}`,
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value: any, name: any) => [`${value}`, name]}
                            />
                            <Pie
                              data={getUserDistributionData()}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                              stroke="#ffffff"
                              strokeWidth={2}
                            >
                              {getUserDistributionData().map((entry, index) => (
                                <Cell key={`cell-user-${index}`} fill={USER_DIST_COLOR_MAP[entry.name]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-3">
                          {getUserDistributionData().map((d) => (
                            <div key={d.name} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: USER_DIST_COLOR_MAP[d.name] }}
                                />
                                <span className="text-sm text-gray-700">{d.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ...you can continue with more sections if needed... */}

              </>
            ) : null}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
