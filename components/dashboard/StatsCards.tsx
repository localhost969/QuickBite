import { motion } from 'framer-motion';
import { FaShoppingBag, FaMoneyBillWave, FaClock } from 'react-icons/fa';

interface StatsCardsProps {
  totalSaved: number;
}

export default function StatsCards({ totalSaved }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: "23",
      icon: FaShoppingBag,
      subtitle: "This month",
      color: "blue"
    },
    {
      title: "Total Spent",
      value: `₹${(totalSaved * 10).toFixed(0)}`,
      icon: FaMoneyBillWave,
      subtitle: "All time",
      color: "green"
    },
    {
      title: "Avg. Delivery",
      value: "28 min",
      icon: FaClock,
      subtitle: "Last 10 orders",
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          accent: 'from-blue-500 to-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'text-green-600',
          accent: 'from-green-500 to-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          icon: 'text-purple-600',
          accent: 'from-purple-500 to-purple-600'
        };
      default:
        return {
          bg: 'bg-slate-50',
          icon: 'text-slate-600',
          accent: 'from-slate-500 to-slate-600'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => {
  const colorClasses = { bg: 'bg-blue-50', icon: 'text-blue-700', accent: 'from-blue-600 to-blue-700' };
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${colorClasses.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-300">
                {card.value}
              </p>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </div>
            
            {/* Bottom accent bar */}
            <div className={`mt-4 h-1 bg-gradient-to-r ${colorClasses.accent} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
          </motion.div>
        );
      })}
    </div>
  );
}
