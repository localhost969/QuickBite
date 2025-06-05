import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaUtensils, FaHamburger, FaAppleAlt, FaGlassCheers } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Food-related SVG illustrations for signup
const SignupIllustration = () => (
  <div className="relative h-full flex flex-col items-center justify-center text-white/20">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <pattern id="signup-pattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M12.5,5 L17.5,12.5 L12.5,20 L7.5,12.5 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#signup-pattern)" />
      </svg>
    </div>

    {/* Main Illustration */}
    <div className="relative z-10 flex flex-col items-center space-y-8">
      {/* Kitchen/Chef Scene */}
      <svg width="220" height="180" viewBox="0 0 220 180" className="text-white/30">
        {/* Kitchen Counter */}
        <rect x="20" y="120" width="180" height="40" fill="currentColor" rx="6" />
        {/* Chef Hat */}
        <ellipse cx="110" cy="50" rx="25" ry="15" fill="currentColor" />
        <rect x="85" y="45" width="50" height="20" fill="currentColor" rx="4" />
        {/* Chef Body */}
        <rect x="95" y="65" width="30" height="55" fill="currentColor" rx="15" />
        {/* Arms */}
        <circle cx="75" cy="85" r="8" fill="currentColor" />
        <circle cx="145" cy="85" r="8" fill="currentColor" />
        {/* Cooking Items */}
        <circle cx="60" cy="110" r="12" fill="rgba(255,255,255,0.4)" />
        <circle cx="160" cy="110" r="10" fill="rgba(255,255,255,0.4)" />
        <rect x="100" y="100" width="20" height="15" fill="rgba(255,255,255,0.4)" rx="2" />
        {/* Steam Lines */}
        <path d="M65,95 Q67,85 65,75" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        <path d="M165,95 Q167,85 165,75" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      </svg>

      {/* Floating Food Items */}
      <div className="flex space-x-8 text-3xl">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
        >
          <FaHamburger className="text-white/40" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <FaAppleAlt className="text-white/40" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        >
          <FaGlassCheers className="text-white/40" />
        </motion.div>
      </div>

      {/* Menu Board */}
      <svg width="140" height="100" viewBox="0 0 140 100" className="text-white/25">
        {/* Board */}
        <rect x="10" y="10" width="120" height="80" fill="currentColor" rx="4" />
        <rect x="15" y="15" width="110" height="70" fill="rgba(255,255,255,0.1)" rx="2" />
        {/* Menu Lines */}
        <rect x="25" y="25" width="60" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
        <rect x="25" y="35" width="80" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
        <rect x="25" y="45" width="70" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
        <rect x="25" y="55" width="65" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
        <rect x="25" y="65" width="75" height="3" fill="rgba(255,255,255,0.3)" rx="1" />
      </svg>

      {/* Animated Dots */}
      <div className="flex space-x-3">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-white/30 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>

    {/* Bottom Food Spread */}
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <svg width="160" height="50" viewBox="0 0 160 50" className="text-white/20">
        {/* Table */}
        <ellipse cx="80" cy="40" rx="70" ry="8" fill="currentColor" />
        {/* Food Items */}
        <circle cx="40" cy="30" r="8" fill="currentColor" />
        <rect x="65" y="22" width="16" height="16" fill="currentColor" rx="2" />
        <circle cx="100" cy="28" r="6" fill="currentColor" />
        <rect x="115" y="25" width="12" height="12" fill="currentColor" rx="6" />
        <circle cx="130" cy="32" r="5" fill="currentColor" />
      </svg>
    </div>
  </div>
);

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        window.location.replace('/login');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Head>
        <title>Sign Up - QuickBite</title>
        <meta name="description" content="Create your QuickBite account" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous:wght@400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Left Side - Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">
        <SignupIllustration />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-4xl font-righteous mb-4" style={{ fontFamily: 'Righteous, cursive' }}>
              QuickBite
            </h1>
            <p className="text-primary-100 text-lg font-light">
              Join the campus food revolution
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Start your journey!</h2>
              <p className="text-primary-100 font-light leading-relaxed">
                Create your account and discover amazing food options across campus. 
                Order from multiple canteens, track your favorites, and never wait in line again.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
                <span className="text-sm text-primary-100">Browse 20+ menu items</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
                <span className="text-sm text-primary-100">Order from 3+ canteens</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
                <span className="text-sm text-primary-100">Skip the queue, save time</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
                <span className="text-sm text-primary-100">Track your order in real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
            <p className="text-gray-600">Join the campus food revolution</p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
            <p className="text-gray-600">Join thousands of students already using QuickBite.</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all placeholder-gray-400 text-gray-900"
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                    placeholder="Enter your email address"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="password"
                    name="password"
                    type={showPasswords.password ? "text" : "password"}
                    required
                    value={formData.password}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all placeholder-gray-400 text-gray-900"
                    placeholder="Create a strong password"
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                      hover:text-gray-600 transition-colors"
                    onClick={() => setShowPasswords(prev => ({ ...prev, password: !prev.password }))}
                  >
                    {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength: <span className="font-medium">{strengthTexts[passwordStrength - 1] || 'Too short'}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all placeholder-gray-400 text-gray-900"
                    placeholder="Confirm your password"
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                      hover:text-gray-600 transition-colors"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  >
                    {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || formData.password !== formData.confirmPassword}
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-500 font-semibold">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>

          {/* Benefits Section */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h3 className="text-sm font-semibold text-primary-800 mb-2">What you'll get:</h3>
            <ul className="text-xs text-primary-700 space-y-1">
              <li>• Instant access to all campus canteens</li>
              <li>• Personalized menu recommendations</li>
              <li>• Order tracking and notifications</li>
              <li>• Exclusive student discounts</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}