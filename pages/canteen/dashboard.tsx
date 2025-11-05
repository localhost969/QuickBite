import ProtectedRoute from '@/components/ProtectedRoute';
import CanteenLayout from '@/components/canteen/CanteenLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { canteenApi } from '@/lib/canteenApi';
import Link from 'next/link';
import { 
  ChefHat, 
  Package, 
  TrendingUp, 
  ClipboardList, 
  Loader, 
  ArrowRight,
  DollarSign,
  ShoppingBag,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  Zap,
  BarChart3
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
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SalesGraphData {
  date: string;
  orders: number;
  revenue: number;
}

interface Stats {
  total_orders: number;
  pending: number;
  accepted: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  today_orders: number;
  total_revenue: number;
  sales_graph: SalesGraphData[];
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

// Add at the top, after imports, for custom legend dot
const StatusLegendDot = ({ color }: { color: string }) => (
  <span
    className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
    style={{ backgroundColor: color }}
  />
);

export default function CanteenDashboardPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const data = await canteenApi.stats.get(token);
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // Prepare data for order status pie chart
  const getOrderStatusData = () => {
    if (!stats) return [];
    return [
      { name: 'Pending', value: stats.pending },
      { name: 'Accepted', value: stats.accepted },
      { name: 'Preparing', value: stats.preparing },
      { name: 'Ready', value: stats.ready },
      { name: 'Completed', value: stats.completed },
      { name: 'Cancelled', value: stats.cancelled }
    ].filter(item => item.value > 0);
  };

  // Prepare sales graph data
  const getSalesGraphData = () => {
    if (!stats?.sales_graph?.length) return [];
    return stats.sales_graph.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: day.revenue,
      orders: day.orders
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['canteen']}>
      <CanteenLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Welcome Section */}
            <div className="mb-10">
              <div className="flex items-center gap-4">
               
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-600 mt-2">Real-time canteen operations dashboard</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-gray-600">Loading your dashboard...</p>
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Top Metrics Row - 4 Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {/* Total Revenue */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <Activity className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">₹{stats.total_revenue.toLocaleString()}</h3>
                    <p className="text-xs text-blue-600 font-medium">All time earnings</p>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      {stats.pending > 0 && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {stats.pending} pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stats.total_orders}</h3>
                    <p className="text-xs text-blue-600 font-medium">All time</p>
                  </div>

                  {/* Today's Orders */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <Zap className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Today's Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stats.today_orders}</h3>
                    <p className="text-xs text-blue-600 font-medium">Current day activity</p>
                  </div>

                  {/* Completion Rate */}
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:shadow transition-all">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Success Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-0.5">
                      {stats.total_orders > 0 ? Math.round((stats.completed / stats.total_orders) * 100) : 0}%
                    </h3>
                    <p className="text-xs text-blue-600 font-medium">Orders completed</p>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Sales Trend Chart - Takes 2 columns */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                        <p className="text-xs text-gray-500 mt-1">Last 7 days performance</p>
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
                            formatter={(value) => `₹${value.toLocaleString()}`}
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

                  {/* Order Status Pie Chart */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                        <p className="text-xs text-gray-500 mt-1">Distribution</p>
                      </div>
                    </div>

                    {getOrderStatusData().length > 0 ? (
                      <div className="flex flex-col items-center w-full">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={getOrderStatusData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={2}
                              dataKey="value"
                              startAngle={90}
                              endAngle={450}
                              stroke="#fff"
                              isAnimationActive={true}
                              label={false}
                            >
                              {getOrderStatusData().map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                                  className="transition-all duration-200"
                                />
                              ))}
                            </Pie>
                            {/* Center label for total orders */}
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-lg font-bold"
                              fill="#0040ffea"
                            >
                              {stats.total_orders}
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Custom Legend */}
                        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 w-full text-sm">
                          {getOrderStatusData().map((entry, idx) => (
                            <div key={entry.name} className="flex items-center">
                              <StatusLegendDot color={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                              <span className="font-medium text-gray-700">{entry.name}</span>
                              <span className="ml-auto font-semibold text-gray-900">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-72 flex items-center justify-center text-gray-400">
                        <p>No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Charts - Orders Volume */}
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
                          formatter={(value) => `${value} orders`}
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

              

                {/* Status Metrics Grid */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Order Status Metrics</h2>
                      <p className="text-xs text-gray-500 mt-1">Current order pipeline</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Pending', value: stats.pending, color: '#7dd3fc', icon: Clock },
                      { label: 'Accepted', value: stats.accepted, color: '#3b82f6', icon: CheckCircle },
                      { label: 'Preparing', value: stats.preparing, color: COLORS.primary, icon: ChefHat },
                      { label: 'Ready', value: stats.ready, color: '#1d4ed8', icon: Package },
                      { label: 'Completed', value: stats.completed, color: '#1e3a8a', icon: CheckCircle },
                      { label: 'Cancelled', value: stats.cancelled, color: '#64748b', icon: XCircle }
                    ].map((status, idx) => {
                      const IconComponent = status.icon;
                      return (
                        <div
                          key={idx}
                          className="text-center p-6 rounded-xl transition-all hover:shadow-md"
                          style={{ backgroundColor: status.color + '15', borderLeft: `4px solid ${status.color}` }}
                        >
                          <IconComponent className="w-8 h-8 mx-auto mb-3" style={{ color: status.color }} />
                          <div className="text-3xl font-bold text-gray-900 mb-2">{status.value}</div>
                          <p className="text-sm font-medium text-gray-700">{status.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </CanteenLayout>
    </ProtectedRoute>
  );
}
