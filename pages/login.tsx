import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Utensils, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'canteen':
          router.push('/canteen/dashboard');
          break;
        case 'user':
          router.push('/user/dashboard');
          break;
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'canteen' | 'user') => {
    switch (role) {
      case 'admin':
        setEmail('admin@qb.com');
        setPassword('admin123');
        break;
      case 'canteen':
        setEmail('canteen1@qb.com');
        setPassword('admin123');
        break;
      case 'user':
        setEmail('localhost@qb.com');
        setPassword('user123');
        break;
    }
    setError('');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
    >
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto flex flex-col">
          {/* Logo and Brand at top of form */}
          <Link href="/" className="flex items-center gap-4 group mb-2 justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0040ff0d] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl shadow-xl">
              <Utensils className="w-9 h-9 text-[#0040ffea]" strokeWidth={2.6} />
            </div>
            <span className="font-extrabold text-4xl tracking-tight text-[#0040ffea]">
              Quickbite
            </span>
          </Link>
          <h1 className="text-[#0040ffea] font-medium text-lg md:text-xl text-center mb-4">
            Sign in to your account
          </h1>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0040ffea] text-white font-medium rounded-lg hover:bg-[#336dff] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-2">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('canteen')}
                className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                Canteen
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user')}
                className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                User
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click above to auto-fill demo credentials
            </p>
          </div>

          {/* Sign up text inside form at bottom */}
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#0040ffea] hover:text-[#336dff] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
