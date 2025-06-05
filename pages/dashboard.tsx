import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import FloatingCart from '../components/cart/FloatingCart';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useLoyalty } from '../hooks/useLoyalty';
import { toast } from 'react-toastify';

// Lazy load all dashboard components
const WelcomeHero = lazy(() => import('../components/dashboard/WelcomeHero'));
const FavoritesSection = lazy(() => import('../components/dashboard/FavoritesSection'));
const FoodDiscoveriesSection = lazy(() => import('../components/dashboard/FoodDiscoveriesSection'));
const SpecialDealsSection = lazy(() => import('../components/dashboard/SpecialDealsSection'));
const RecentOrdersSection = lazy(() => import('../components/dashboard/RecentOrdersSection'));
const StatsCards = lazy(() => import('../components/dashboard/StatsCards'));

const MotionDiv = motion.div;

interface User {
  name: string;
  email: string;
  wallet_balance: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  discount?: number;
  rating?: number;
  badge?: string;
  order_count?: number;
  description?: string;
}

// Loading component for Suspense fallback
const SectionSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white rounded-xl shadow-sm border ${className}`}>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// Custom hook for intersection observer-based lazy loading
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isVisible] as const;
};

// Lazy section wrapper component
const LazySection = ({ 
  children, 
  fallback = <SectionSkeleton />,
  className = ""
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}) => {
  const [ref, isVisible] = useIntersectionObserver(0.1);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [trendingItems, setTrendingItems] = useState<Product[]>([]);
  const [discountedItems, setDiscountedItems] = useState<Product[]>([]);
  const { addItem: addToCart, totalItems } = useCart();
  const { 
    favorites, 
    removeFromFavorites, 
    isLoading: favoritesLoading, 
    fetchFavorites,
    toggleFavorite,
    isFavorite
  } = useFavorites();
  const { loyaltyStatus } = useLoyalty();
  const [statsData, setStatsData] = useState({
    ordersThisWeek: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    orderFrequency: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData);

        const ordersResponse = await fetch(`https://localhost969.pythonanywhere.com/orders/user/${userEmail}`);
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }

        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      window.location.href = '/auth';
    }
  }, [router]);

  useEffect(() => {
    const fetchTrendingAndDiscounted = async () => {
      try {
        const trendingResponse = await fetch('https://localhost969.pythonanywhere.com/products/popular');
        const trendingData = await trendingResponse.json();
        
        const discountedResponse = await fetch('https://localhost969.pythonanywhere.com/products/discounted');
        const discountedData = await discountedResponse.json();

        if (trendingData.success) {
          setTrendingItems(trendingData.products);
        }
        
        if (discountedData.success) {
          setDiscountedItems(discountedData.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchTrendingAndDiscounted();
  }, []);
  
  useEffect(() => {
    if (recentOrders.length > 0) {
      const weekOrders = recentOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      });

      const totalSpent = recentOrders.reduce((sum, order) => sum + order.total, 0);
      
      setStatsData({
        ordersThisWeek: weekOrders.length,
        totalSpent,
        avgOrderValue: totalSpent / recentOrders.length,
        orderFrequency: Math.round((weekOrders.length / 7) * 100) / 100
      });
    }
  }, [recentOrders]);

  useEffect(() => {
    if (fetchFavorites) {
      fetchFavorites();
    }
  }, [fetchFavorites]);

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(`Added ${quantity} ${product.name} to cart`);
      await fetchFavorites();
      return Promise.resolve();
    } catch (error) {
      toast.error('Failed to add to cart');
      return Promise.reject(error);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    const product = favorites.find(fav => fav.id === productId);
    if (product) {
      try {
        await removeFromFavorites(product);
        await fetchFavorites();
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>QuickByte | Your Food Dashboard</title>
        <meta name="description" content="Your personalized food ordering dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50/50">
        <div className="space-y-6">
          <LazySection>
            <WelcomeHero 
              userName={user?.name || ''} 
              loyaltyPoints={loyaltyStatus?.points || 0}
              loyaltyTier={loyaltyStatus?.tier || 'Bronze'}
            />
          </LazySection>

          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <LazySection>
                <StatsCards totalSaved={(statsData.totalSpent * 0.1) || 0} />
              </LazySection>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* God Level Dashboard Layout - Master Grid */}
              <div className="grid grid-cols-12 gap-6">
                {/* Row 1: Food Discoveries (8 cols) + Recent Orders (4 cols) */}
                <div className="col-span-12 lg:col-span-8">
                  <LazySection>
                    <FoodDiscoveriesSection
                      products={trendingItems}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite}
                    />
                  </LazySection>
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <LazySection>
                    <RecentOrdersSection
                      orders={recentOrders}
                      onViewOrder={() => router.push('/orders')}
                    />
                  </LazySection>
                </div>

                {/* Row 2: Special Deals (8 cols) + Favorites (4 cols) */}
                <div className="col-span-12 lg:col-span-8">
                  <LazySection>
                    <SpecialDealsSection
                      products={discountedItems}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite}
                    />
                  </LazySection>
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <LazySection>
                    <FavoritesSection
                      favorites={favorites || []}
                      onAddToCart={handleAddToCart}
                      onRemoveFavorite={handleRemoveFavorite}
                      isLoading={favoritesLoading}
                    />
                  </LazySection>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FloatingCart />
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  const { req, res } = context;
  const cookies = req.cookies || {};
  
  if (!cookies.token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
  
  const currentPath = req.url;
  const userRole = cookies.userRole || 'user';
  
  if (currentPath.startsWith('/admin') && userRole !== 'admin') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  if (currentPath.startsWith('/canteen') && userRole !== 'canteen') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {}
  };
}
