import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FaHeart, FaShoppingCart, FaChevronRight, FaPlus, FaMinus 
} from 'react-icons/fa';
import { IoStar, IoSparkles } from 'react-icons/io5';
import { MdExplore } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  discount?: number;
  rating?: number;
  badge?: string;
  order_count?: number;
  description?: string;
}

interface FoodDiscoveriesSectionProps {
  products: Product[];
  onToggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

interface FoodDiscoveryCardProps {
  product: Product;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
}

export default function FoodDiscoveriesSection({ 
  products, 
  onToggleFavorite, 
  isFavorite 
}: FoodDiscoveriesSectionProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <MdExplore className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Trending Items</h2>
              <p className="text-sm text-slate-600">Popular choices today</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-blue-200"
          >
              <span>View all</span>
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FoodDiscoveryCard
                  product={product}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={isFavorite(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdExplore className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No trending items</h3>
            <p className="text-slate-500 text-sm mb-4">Check back later for popular picks!</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FoodDiscoveryCard({ product, onToggleFavorite, isFavorite }: FoodDiscoveryCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setIsAdding(false), 800);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add to cart');
    }
  };

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="bg-white border border-slate-200/60 rounded-lg overflow-hidden hover:shadow-sm transition-all duration-200 group w-full max-w-xs mx-auto">
      {/* Image Section */}
      <div className="relative w-full h-32 bg-white flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product.image_url || '/images/placeholder-food.jpg'}
          alt={product.name}
          className={`w-full h-full object-contain transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'white' }}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-food.jpg';
            setImageLoaded(true);
          }}
        />
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded">
              -{product.discount}%
            </span>
          </div>
        )}
        {/* Rating */}
        {product.rating && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded">
              <IoStar className="w-3 h-3 text-slate-700" />
              <span className="font-semibold text-slate-700 text-xs">{product.rating}</span>
            </div>
          </div>
        )}
      </div>
      {/* Content Section */}
      <div className="p-3">
        {/* Product Info */}
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 text-sm mb-0.5 leading-tight line-clamp-2 break-words">
            {product.name}
          </h3>
        </div>
        {/* Price & Add Button Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">₹{discountedPrice.toFixed(0)}</span>
            {product.discount && (
              <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-xs border border-slate-300 transition-all duration-150 h-6 ${
              isAdding
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
            style={{ minWidth: 56 }}
          >
            {isAdding ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Adding</span>
              </>
            ) : (
              <>
                <FaShoppingCart className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
