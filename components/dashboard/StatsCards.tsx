import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaGift, FaHeadset } from 'react-icons/fa';
import Link from 'next/link';

interface StatsCardsProps {
  totalSaved: number;
}

export default function StatsCards({ totalSaved }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Saved",
      value: `₹${totalSaved.toFixed(0)}`,
      icon: FaMoneyBillWave,
      subtitle: "Through discounts & offers",
      link: null
    },
    {
      title: "Special Offers",
      value: "View Deals",
      icon: FaGift,
      subtitle: "Limited time offers",
      link: null
    },
    {
      title: "Need Help?",
      value: "24/7 Support",
      icon: FaHeadset,
      subtitle: "We're here to assist",
      link: null
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
          >
            {card.link ? (
              <Link href={card.link}>
                <StatCard {...card} />
              </Link>
            ) : (
              <StatCard {...card} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  subtitle: string;
  link?: string | null;
}

function StatCard({ title, value, icon: Icon, subtitle, link }: StatCardProps) {
  return (
    <div className={`group ${link ? 'cursor-pointer' : ''} h-full`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full 
                    hover:shadow-md hover:border-primary-200 transition-all duration-300">
        {/* Header with icon */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors duration-300">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            {link && (
              <div className="w-2 h-2 bg-primary-200 rounded-full group-hover:bg-primary-400 transition-colors duration-300" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
              {value}
            </p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        
        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 
                      group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </div>
  );
}
