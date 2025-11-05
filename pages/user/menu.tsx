import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { cartStorage } from '@/lib/cartStorage';
import { Search, Loader } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

export default function MenuPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [categories, setCategories] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== 'user') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
          
          // Extract categories
          const uniqueCategories = ['All', ...new Set((data.products as Product[]).map((p: Product) => p.category))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch cart items from localStorage on mount
  useEffect(() => {
    const cart = cartStorage.getCart();
    setCartItems(cart);
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToCart = (productId: string) => {
    setAddingToCart(productId);
    try {
      cartStorage.addToCart(productId, 1);
      const updatedCart = cartStorage.getCart();
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setAddingToCart(productId);
    try {
      cartStorage.removeFromCart(productId, 1);
      const updatedCart = cartStorage.getCart();
      setCartItems(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/user/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {/* lucide-react ArrowLeft icon for consistency */}
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Browse Menu</h1>
            <p className="text-gray-600">Discover our delicious food items</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0040ffea] transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#0040ffea] text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#0040ffea' }} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                price={product.price}
                description={product.description}
                is_available={product.is_available}
                image_url={product.image_url}
                quantity={cartItems.get(product.id) || 0}
                isLoading={addingToCart === product.id}
                onAdd={handleAddToCart}
                onRemove={handleRemoveFromCart}
              />
            ))}
          </div>
        )}

        {/* Go to Cart Button */}
        {cartItems.size > 0 && (
          <div className="fixed bottom-8 right-8 z-40">
            <Link href="/user/cart">
              <div className="relative">
                <button className="px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all hover:shadow-xl"
                  style={{ backgroundColor: '#0040ffea' }}>
                  View Cart ({cartItems.size})
                </button>
              </div>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
