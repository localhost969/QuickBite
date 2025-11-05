'use client';

import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    title: 'Fresh Daily Meals',
    subtitle: 'Quality food prepared fresh every day',
    gradient: 'from-[#76b9ff] to-[#5a9dd8]',
  },
  {
    id: 2,
    title: 'Quick & Convenient',
    subtitle: 'Order now and enjoy delicious food on campus',
    gradient: 'from-[#5a9dd8] to-[#76b9ff]',
  },
  {
    id: 3,
    title: 'Healthy Choices',
    subtitle: 'Nutritious meals for students',
    gradient: 'from-[#76b9ff] to-[#4a8bc7]',
  },
];

export default function BannerSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} flex items-center justify-center transition-opacity duration-1000 ease-in-out`}
          style={{
            opacity: index === currentSlide ? 1 : 0,
          }}
        >
          <div className="text-center text-white px-8">
            <h2 className="font-display font-bold text-5xl mb-4">{banner.title}</h2>
            <p className="font-sans text-lg text-white/90">{banner.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
