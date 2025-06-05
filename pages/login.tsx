import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils, FaCoffee, FaPizzaSlice } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Food-related SVG illustrations
const FoodIllustration = () => (
  <div className="relative h-full flex flex-col items-center justify-center text-white/20">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <pattern id="food-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#food-pattern)" />
      </svg>
    </div>

    {/* Main Illustration */}
    <div className="relative z-10 flex flex-col items-center space-y-8">
      {/* Restaurant/Canteen Building */}
      <svg width="200" height="160" viewBox="0 0 200 160" className="text-white/30">
        {/* Building Base */}
        <rect x="40" y="80" width="120" height="70" fill="currentColor" rx="4" />
        {/* Roof */}
        <polygon points="30,80 100,40 170,80" fill="currentColor" />
        {/* Door */}
        <rect x="90" y="120" width="20" height="30" fill="rgba(255,255,255,0.3)" rx="2" />
        {/* Windows */}
        <rect x="60" y="100" width="15" height="15" fill="rgba(255,255,255,0.3)" rx="2" />
        <rect x="125" y="100" width="15" height="15" fill="rgba(255,255,255,0.3)" rx="2" />
        {/* Sign */}
        <rect x="70" y="60" width="60" height="15" fill="rgba(255,255,255,0.4)" rx="3" />
      </svg>

      {/* Floating Food Icons */}
      <div className="flex space-x-12 text-4xl">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        >
          <FaPizzaSlice className="text-white/40" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <FaUtensils className="text-white/40" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <FaCoffee className="text-white/40" />
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-white/30 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>

    {/* Bottom Decoration */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <svg width="120" height="40" viewBox="0 0 120 40" className="text-white/20">
        {/* Plate */}
        <ellipse cx="60" cy="30" rx="50" ry="8" fill="currentColor" />
        {/* Food Items */}
        <circle cx="45" cy="25" r="6" fill="currentColor" />
        <circle cx="60" cy="20" r="8" fill="currentColor" />
        <circle cx="75" cy="25" r="5" fill="currentColor" />
      </svg>
    </div>
  </div>
);

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fillDemoCredentials = async (email: string, password: string) => {
    setFormData({
      email,
      password
    });
    
    // Trigger login after filling credentials
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);

        // Set cookies properly
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        document.cookie = `userRole=${data.role}; path=/; max-age=86400`;

        toast.success('Login successful!');

        // Use window.location.replace for clean redirect
        switch (data.role) {
          case 'admin':
            window.location.replace('/admin/dashboard');
            break;
          case 'canteen':
            window.location.replace('/canteen/dashboard');
            break;
          default:
            window.location.replace('/dashboard');
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);

        // Set cookies properly
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        document.cookie = `userRole=${data.role}; path=/; max-age=86400`;

        toast.success('Login successful!');

        // Use window.location.replace for clean redirect
        switch (data.role) {
          case 'admin':
            window.location.replace('/admin/dashboard');
            break;
          case 'canteen':
            window.location.replace('/canteen/dashboard');
            break;
          default:
            window.location.replace('/dashboard');
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Head>
        <title>Login - QuickBite</title>
        <meta name="description" content="Login to your QuickBite account" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous:wght@400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Left Side - Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        <FoodIllustration />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-4xl font-righteous mb-4" style={{ fontFamily: 'Righteous, cursive' }}>
              QuickBite
            </h1>
            <p className="text-primary-100 text-lg font-light">
              Your campus canteen companion
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Welcome back!</h2>
              <p className="text-primary-100 font-light leading-relaxed">
                Access your account to order delicious meals from your favorite campus canteens. 
                Fast, convenient, and always fresh.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">20+</div>
                <div className="text-sm text-primary-200">Menu Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2+</div>
                <div className="text-sm text-primary-200">Canteens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-primary-200">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-righteous bg-gradient-to-r from-primary-600 to-primary-500 
              bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Righteous, cursive' }}>
              QuickBite
            </h1>
            <p className="text-gray-600">Your campus dining companion</p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all placeholder-gray-400 text-gray-900"
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all placeholder-gray-400 text-gray-900"
                    placeholder="Enter your password"
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                      hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold text-base
                bg-gradient-to-r from-primary-600 to-primary-500 
                hover:from-primary-700 hover:to-primary-600 
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-500 font-semibold">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Access Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fillDemoCredentials('vardan@qb.com', '12345678')}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 
                  rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 
                  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Student'}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fillDemoCredentials('test@test.com', '12345678')}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 
                  rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 
                  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Canteen'}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fillDemoCredentials('admin@quickbyte.com', 'admin@123')}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 
                  rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 
                  focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Admin'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const { req, res } = context;
  
  // Clear any existing cookies on the login page
  res.setHeader('Set-Cookie', [
    'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT',
    'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  ]);
  
  return {
    props: {}
  };
}
