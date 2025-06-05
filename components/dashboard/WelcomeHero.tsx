import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaCloudSun, FaCrown, FaCoins } from 'react-icons/fa';

interface WelcomeHeroProps {
  userName: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
}

export default function WelcomeHero({ userName, loyaltyPoints = 0, loyaltyTier = 'Bronze' }: WelcomeHeroProps) {
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
        message: 'Start your day with a delicious breakfast'
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: 'Good Afternoon',
        icon: FaCloudSun,
        message: "Time for a refreshing lunch"
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        greeting: 'Good Evening',
        icon: FaCloudSun,
        message: "Perfect time for some snacks"
      };
    } else {
      return {
        greeting: 'Good Evening',
        icon: FaMoon,
        message: "Dinner time"
      };
    }
  };

  const timeInfo = getTimeBasedInfo();
  const IconComponent = timeInfo.icon;

  return (
    <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07]" 
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section - Greeting */}
          <div className="text-center sm:text-left space-y-4">
            {/* Date */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary-100 text-sm font-medium"
            >
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </motion.p>
            
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 justify-center sm:justify-start"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {timeInfo.greeting}, {userName.split(' ')[0]}
              </h1>
             
            </motion.div>

            {/* Time-based message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary-100/80 text-sm md:text-base"
            >
              {timeInfo.message}
            </motion.p>
          </div>

          {/* Right Section - Compact Loyalty */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <FaCrown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{loyaltyTier}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white/90">Member</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaCoins className="w-3 h-3 text-yellow-300" />
                    <span className="text-white/90 text-sm font-medium">{loyaltyPoints} points</span>
                  </div>
                </div>
              </div>
              
              {/* Quick progress bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (loyaltyPoints % 1000) / 10)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400"
                  />
                </div>
                <p className="text-white/70 text-xs mt-1">
                  {1000 - (loyaltyPoints % 1000)} points to ₹100 cashback
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
