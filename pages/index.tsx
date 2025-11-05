import Navbar from '@/components/Navbar';
import BannerSlideshow from '@/components/BannerSlideshow';
import Products from '@/components/Products';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Banner Slideshow */}
        <BannerSlideshow />

        {/* Available Products Section */}
        <Products />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}