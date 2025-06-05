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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Section Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 bg-primary-100 rounded-lg shadow-sm">
              <MdExplore className="w-4 h-4 text-primary-600" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Food Discoveries</h2>
              <p className="text-xs text-primary-600 font-medium">Curated just for you</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 border border-primary-200 hover:scale-105 active:scale-95"
          >
            <span>Browse all</span>
            <FaChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-5">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-inner">
              <MdExplore className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No discoveries available</h3>
            <p className="text-gray-500 text-xs mb-3">Check back later for amazing finds!</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors hover:scale-105 active:scale-95"
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
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setIsAdding(false), 1200);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add to cart');
    }
  };

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;
  
  const savings = product.price - discountedPrice;
    
  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Image Section - Increased Height */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&h=200&fit=crop'}
          alt={product.name}
          className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = '/images/default-food.jpg';
            setImageLoaded(true);
          }}
        />
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        
        {/* Compact Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-0 right-0 p-1 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <FaHeart className={`w-3 h-3 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`} />
        </button>
        
        {/* Compact Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2">
            <div className="px-1 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm">
              -{product.discount}%
            </div>
          </div>
        )}
        
        {/* Compact Special Badge */}
        {product.badge && (
          <div className="absolute bottom-2 left-2">
            <div className="px-1 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-0.5">
              <IoSparkles className="w-2 h-2" />
              <span>Special</span>
            </div>
          </div>
        )}
        
        {/* Compact Rating */}
        {product.rating && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-white/90 backdrop-blur-sm rounded shadow-sm">
              <IoStar className="text-yellow-500 w-2 h-2" />
              <span className="font-semibold text-gray-800 text-[10px]">{product.rating}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Compact Content Section */}
      <div className="p-2.5">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-sm font-bold text-gray-900 leading-tight mb-0.5 truncate">
              {product.name}
            </h3>
            {(product.order_count || 0) > 0 && (
              <p className="text-[10px] text-gray-500 font-medium">{product.order_count} orders</p>
            )}
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm font-bold text-primary-600">₹{discountedPrice.toFixed(0)}</span>
              {product.discount && (
                <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
              )}
            </div>
            {savings > 0 && (
              <div className="text-[10px] text-green-600 font-semibold">
                Save ₹{savings.toFixed(0)}
              </div>
            )}
          </div>
        </div>
        
        {/* Compact Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAdding}
            className={`flex items-center justify-center gap-1 px-2 py-1 rounded font-medium text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${
              isAdding 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Adding</span>
              </>
            ) : (
              <>
                <FaShoppingCart className="w-2.5 h-2.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
              <FaChevronRight className="w-2 h-2 text-gray-500" />
            </div>
          </button>
        </div>
      </div>

      {/* Compact Expanded Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-primary-50/20 transition-all duration-300">
          <div className="p-2.5">
            {/* Compact Quantity Controls */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-700">Qty:</span>
                <div className="flex items-center bg-white rounded shadow-sm border border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="p-1 hover:bg-gray-50 rounded-l transition-colors active:scale-95"
                  >
                    <FaMinus className="w-2 h-2 text-gray-600" />
                  </button>
                  
                  <span className="px-2 py-1 font-bold text-gray-900 min-w-[2rem] text-center text-xs">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(quantity + 1);
                    }}
                    className="p-1 hover:bg-gray-50 rounded-r transition-colors active:scale-95"
                  >
                    <FaPlus className="w-2 h-2 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[10px] text-gray-500 mb-0.5">Total</div>
                <div className="text-sm font-bold text-primary-600">
                  ₹{(discountedPrice * quantity).toFixed(0)}
                </div>
              </div>
            </div>
            
            {/* Compact Add to Cart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                for (let i = 0; i < quantity; i++) {
                  addItem(product);
                }
                toast.success(`${quantity} ${product.name} added to cart!`);
              }}
              className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 text-xs"
            >
              <FaShoppingCart className="w-3 h-3" />
              Add {quantity} to Cart
            </button>
            
            {/* Compact Description */}
            {product.description && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 