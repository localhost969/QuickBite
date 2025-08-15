import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';

import { FaShoppingBag, FaMoneyBillWave, FaClock } from 'react-icons/fa';

interface WelcomeHeroProps {
  userName: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  totalOrders: number;
  totalSpent: number;
  avgDelivery: string;
}

export default function WelcomeHero({ userName, totalOrders, totalSpent, avgDelivery }: WelcomeHeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeBasedInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 11) {
      return {
        greeting: 'Good Morning',
        icon: FaSun,
        message: 'Start your day with a delicious breakfast',
        gradient: 'from-orange-500 to-amber-500'
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: 'Good Afternoon',
        icon: FaCloudSun,
        message: "Time for a refreshing lunch",
        gradient: 'from-blue-500 to-cyan-500'
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        greeting: 'Good Evening',
        icon: FaCloudSun,
        message: "Perfect time for some snacks",
        gradient: 'from-purple-500 to-pink-500'
      };
    } else {
      return {
        greeting: 'Good Evening',
        icon: FaMoon,
        message: "Dinner time - what sounds good?",
        gradient: 'from-indigo-600 to-blue-600'
      };
    }
  };

  const timeInfo = getTimeBasedInfo();
  const IconComponent = timeInfo.icon;

  return (
  <div className="relative bg-blue-700 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Section - Greeting */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            {/* Date */}
            <p className="text-white/80 text-sm font-medium mb-2">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
            {/* Greeting with Icon */}
            <div className="flex items-center gap-3 mb-2">
              <IconComponent className="w-6 h-6 text-white/90" />
              <h1 className="text-2xl sm:text-3xl font-bold">
                {timeInfo.greeting}, {userName.split(' ')[0] || 'Welcome'}
              </h1>
            </div>
            {/* Message */}
            <p className="text-white/80 text-sm sm:text-base">
              {timeInfo.message}
            </p>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
