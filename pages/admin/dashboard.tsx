import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  FaUsers, FaStore, FaChartBar, FaMoneyBillWave, 
  FaTimesCircle, FaUndo, FaArrowUp, FaArrowDown 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsData {
  date: string;
  value: number;
}

interface StatsData {
  totalUsers: number;
  totalCanteens: number;
  totalOrders: number;
  totalRevenue: number;
  cancelledOrders: number;
  totalRefunded: number;
  analytics: {
    daily: AnalyticsData[];
    weekly: AnalyticsData[];
    monthly: AnalyticsData[];
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCanteens: 0,
    totalOrders: 0,
    totalRevenue: 0,
    cancelledOrders: 0,
    totalRefunded: 0,
    analytics: {
      daily: [],
      weekly: [],
      monthly: []
    }
  });

  const [analyticsType, setAnalyticsType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const authHeader = `Bearer ${token}`;
      
      const response = await fetch('https://localhost969.pythonanywhere.com/admin/dashboard', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load dashboard data');
        
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendPercentage = () => {
    if (!stats.analytics?.daily || stats.analytics.daily.length < 2) return 0;
    const lastTwo = stats.analytics.daily.slice(-2);
    const prevValue = lastTwo[0]?.value || 0;
    const currentValue = lastTwo[1]?.value || 0;
    if (prevValue === 0) return 100;
    return ((currentValue - prevValue) / prevValue) * 100;
  };

  const StatCard = ({ title, value, icon: Icon, color, trend = 0 }: StatCardProps) => (
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100"
      whileHover={{ y: -2, shadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`w-24 h-24 ${color} rounded-full absolute -right-6 -top-6 blur-2xl`} />
        </div>
        
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-3 sm:p-4 rounded-xl ${color} bg-opacity-10 backdrop-blur-xl flex-shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-0.5">{title}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-2xl font-bold truncate text-gray-900">
                  {typeof value === 'string' && value.toString().startsWith('₹') ? (
                    <span className="flex items-baseline gap-1">
                      <span className="text-base">₹</span>
                      <span>{value.toString().slice(1)}</span>
                    </span>
                  ) : value}
                </p>
                {trend !== 0 && (
                  <span className={`flex items-center text-xs sm:text-sm flex-shrink-0 ${
                    trend > 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {trend > 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const chartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    colors: ['#10B981'],
    xaxis: {
      categories: stats.analytics?.[analyticsType]?.map(d => d.date) || [],
      labels: {
        style: {
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `₹${value.toFixed(0)}`,
        style: {
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => `₹${value.toFixed(2)}`
      }
    }
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout title="Dashboard">
        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50/50 to-white min-h-screen">
          {/* Quick Actions Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-600">Welcome back, Admin!.</p>
              </div>
              <button
                onClick={() => fetchDashboardData()}
                className="w-full sm:w-auto bg-white px-4 py-2.5 rounded-xl hover:bg-gray-50 border border-gray-200 
                         transition-all flex items-center justify-center gap-2 text-gray-700 shadow-sm hover:shadow"
                disabled={isLoading}
              >
                <FaChartBar className="text-primary-500" />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Responsive Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Revenue"
              value={`₹${Math.round(stats.totalRevenue).toLocaleString()}`}
              icon={FaMoneyBillWave}
              color="bg-emerald-500"
              trend={getTrendPercentage()}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={FaUsers}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Canteens"
              value={stats.totalCanteens}
              icon={FaStore}
              color="bg-green-500"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={FaChartBar}
              color="bg-purple-500"
            />
            <StatCard
              title="Cancelled Orders"
              value={stats.cancelledOrders}
              icon={FaTimesCircle}
              color="bg-red-500"
            />
            <StatCard
              title="Total Refunded"
              value={`₹${stats.totalRefunded.toLocaleString()}`}
              icon={FaUndo}
              color="bg-orange-500"
            />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Revenue Analytics</h2>
                  {/* Period Selector */}
                  <div className="flex rounded-xl bg-gray-50 p-1">
                    {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAnalyticsType(type)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          analyticsType === type
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="h-[300px] sm:h-[400px] -mx-4 sm:mx-0">
                  <Chart
                    options={{
                      ...chartOptions,
                      chart: {
                        ...chartOptions.chart,
                        toolbar: {
                          show: false
                        },
                        zoom: {
                          enabled: false
                        }
                      },
                      grid: {
                        padding: {
                          left: 10,
                          right: 10
                        },
                        strokeDashArray: 4,
                      },
                      xaxis: {
                        ...chartOptions.xaxis,
                        labels: {
                          style: {
                            fontSize: '10px',
                            fontFamily: 'Inter, sans-serif'
                          },
                          rotate: -45,
                          hideOverlappingLabels: true
                        }
                      }
                    }}
                    series={[{
                      name: 'Revenue',
                      data: stats.analytics?.[analyticsType]?.map(d => d.value) || []
                    }]}
                    type="area"
                    height="100%"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                    {[
                      { 
                        label: 'Avg. Order',
                        value: `₹${((stats.totalRevenue || 0) / (stats.totalOrders || 1)).toFixed(0)}`,
                        change: '+12.5%',
                        isPositive: true
                      },
                      {
                        label: 'Cancel Rate',
                        value: `${((stats.cancelledOrders || 0) / (stats.totalOrders || 1) * 100).toFixed(1)}%`,
                        change: '-2.3%',
                        isPositive: true
                      },
                      {
                        label: 'User Growth',
                        value: `${stats.totalUsers}`,
                        change: '+5.6%',
                        isPositive: true
                      },
                      {
                        label: 'Canteens',
                        value: stats.totalCanteens,
                        change: '0%',
                        isPositive: true
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors border border-gray-100"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-lg sm:text-xl font-semibold text-gray-900">{stat.value}</span>
                          <span className={`text-xs ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {stat.change}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </RoleBasedGuard>
  );
}
