import { Utensils } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#0040ffea' }}
              >
                {/* Use Utensils icon for Quickbite logo */}
                <Utensils className="w-5 h-5" color="#ffffffff" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-black">Quickbite</span>
            </div>
            <p className="text-gray-600 font-sans">
              College canteen management system for quick and convenient meals.
            </p>
          </div>
          {/* Quick Links and Support side by side on all screens */}
          <div className="flex flex-row gap-8 md:gap-8 md:justify-end col-span-2">
            <div className="min-w-[120px]">
              <h4 className="font-display font-semibold text-black mb-4">Quick Links</h4>
              <ul className="space-y-2 font-sans text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="min-w-[120px]">
              <h4 className="font-display font-semibold text-black mb-4">Support</h4>
              <ul className="space-y-2 font-sans text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600 font-sans">
          <p>&copy; 2025 Quickbite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
