import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  FaUsers, FaStore, FaChartBar, FaMoneyBillWave, 
  FaTimesCircle, FaUndo, FaArrowUp, FaArrowDown, FaUserCircle
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
      className="bg-white rounded-lg overflow-hidden shadow border border-gray-100 px-3 py-3 flex items-center gap-3"
      whileHover={{ y: -2, shadow: "0 10px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold truncate text-gray-900">
            {typeof value === 'string' && value.toString().startsWith('₹') ? (
              <span className="flex items-baseline gap-0.5">
                <span className="text-xs">₹</span>
                <span>{value.toString().slice(1)}</span>
              </span>
            ) : value}
          </span>
          {trend !== 0 && (
            <span className={`flex items-center text-xs flex-shrink-0 ${
              trend > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {trend > 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
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
      <AdminLayout title="Admin">
        <div className="min-h-[calc(100vh-56px)] w-full p-0 sm:p-0 bg-gradient-to-br from-gray-50/70 to-white">
          <div className="mx-2 sm:mx-4 mt-2 sm:mt-4">
            {/* Welcome Section */}
            <div className="mb-4">
              <div className="flex items-center gap-3 bg-white rounded-lg shadow border border-gray-100 px-4 py-3">
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Welcome back, Admin!</p>
                  <p className="text-xs text-gray-500 truncate">Here's a quick overview of your platform as of today.</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => fetchDashboardData()}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs
                      bg-gradient-to-r from-primary-500 to-primary-600 text-white
                      shadow-md transition-all duration-150
                      hover:from-primary-600 hover:to-primary-700 hover:shadow-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                      active:scale-95
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                    disabled={isLoading}
                    aria-label="Refresh dashboard"
                    style={{ minHeight: 'unset', height: '32px' }}
                  >
                    <FaChartBar className="w-4 h-4" />
                    {isLoading ? (
                      <span className="animate-pulse">Refreshing...</span>
                    ) : (
                      <span>Refresh</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              <StatCard
                title="Revenue"
                value={`₹${Math.round(stats.totalRevenue).toLocaleString()}`}
                icon={FaMoneyBillWave}
                color="bg-emerald-500"
                trend={getTrendPercentage()}
              />
              <StatCard
                title="Users"
                value={stats.totalUsers}
                icon={FaUsers}
                color="bg-blue-500"
              />
              <StatCard
                title="Canteens"
                value={stats.totalCanteens}
                icon={FaStore}
                color="bg-green-500"
              />
              <StatCard
                title="Orders"
                value={stats.totalOrders}
                icon={FaChartBar}
                color="bg-purple-500"
              />
              <StatCard
                title="Cancelled"
                value={stats.cancelledOrders}
                icon={FaTimesCircle}
                color="bg-red-500"
              />
              <StatCard
                title="Refunded"
                value={`₹${stats.totalRefunded.toLocaleString()}`}
                icon={FaUndo}
                color="bg-orange-500"
              />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow overflow-hidden">
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-base font-semibold text-gray-800">Revenue Analytics</h2>
                    {/* Period Selector */}
                    <div className="flex rounded-lg bg-gray-50 p-0.5 border border-gray-200 shadow-sm">
                      {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setAnalyticsType(type)}
                          className={`
                            flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150
                            ${
                              analyticsType === type
                                ? 'bg-primary-500 text-white shadow focus:ring-2 focus:ring-primary-400'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                            }
                            focus:outline-none
                          `}
                          style={{
                            boxShadow: analyticsType === type ? '0 2px 8px 0 rgba(16,185,129,0.10)' : undefined,
                            minHeight: 'unset',
                            height: '28px'
                          }}
                          aria-pressed={analyticsType === type}
                        >
                          {type === 'daily' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                          )}
                          {type === 'weekly' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="7" width="18" height="13" rx="2" />
                              <path d="M16 3v4M8 3v4" />
                            </svg>
                          )}
                          {type === 'monthly' && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                          )}
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Chart Container */}
                  <div className="h-[220px] sm:h-[260px] -mx-2 sm:mx-0">
                    <Chart
                      options={{
                        ...chartOptions,
                        chart: {
                          ...chartOptions.chart,
                          toolbar: { show: false },
                          zoom: { enabled: false }
                        },
                        grid: {
                          padding: { left: 5, right: 5 },
                          strokeDashArray: 4,
                        },
                        xaxis: {
                          ...chartOptions.xaxis,
                          labels: {
                            style: {
                              fontSize: '9px',
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
              <div className="space-y-2">
                <div className="bg-white rounded-lg border border-gray-100 shadow">
                  <div className="p-3">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-2">
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
                          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 hover:bg-gray-100 transition-colors border border-gray-100"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                          <div className="flex items-end justify-between">
                            <span className="text-base font-semibold text-gray-900">{stat.value}</span>
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
        </div>
      </AdminLayout>
    </RoleBasedGuard>
  );
}
