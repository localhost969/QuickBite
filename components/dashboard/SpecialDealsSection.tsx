import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaShoppingCart, FaChevronRight 
} from 'react-icons/fa';
import { IoStar, IoAdd, IoRemove } from 'react-icons/io5';
import { MdLocalOffer, MdOutlineTimer } from 'react-icons/md';
import { RiEBike2Fill, RiFireFill } from 'react-icons/ri';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

const MotionDiv = motion.div;

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

interface SpecialDealsSectionProps {
  products: Product[];
  onToggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

interface SpecialDealCardProps {
  product: Product;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
}

export default function SpecialDealsSection({ 
  products, 
  onToggleFavorite, 
  isFavorite 
}: SpecialDealsSectionProps) {

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-slate-200/60 rounded-xl overflow-hidden"
    >
      {/* Section Header */}
  <div className="px-6 py-4 border-b border-slate-200/60 bg-blue-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <MdLocalOffer className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Special Deals</h2>
              <p className="text-sm text-slate-600">Limited time offers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200">
            <MdOutlineTimer className="w-3 h-3" />
            <span>Limited time</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(0, 4).map((product, index) => (
              <MotionDiv
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <SpecialDealCard
                  product={product}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={isFavorite(product.id)}
                />
              </MotionDiv>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdLocalOffer className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-slate-500 text-sm">No deals available</p>
          </div>
        )}
      </div>
    </MotionDiv>
  );
}

function SpecialDealCard({ product, onToggleFavorite, isFavorite }: SpecialDealCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`Added ${product.name}`, { autoClose: 1000 });
      setTimeout(() => setIsAdding(false), 800);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add');
    }
  };

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;
    
  return (
    <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300/60 transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative w-full h-40 overflow-hidden bg-slate-50">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product.image_url || '/images/placeholder-food.jpg'}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-contain bg-white transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-food.jpg';
            setImageLoaded(true);
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
       
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg animate-pulse">
              -{product.discount}% OFF
            </span>
          </div>
        )}
        
        {/* Rating */}
        {product.rating && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
              <IoStar className="text-amber-400 w-3 h-3" />
              <span className="font-semibold text-slate-800 text-xs">{product.rating}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Product Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-base mb-1 line-clamp-1">
            {product.name}
          </h3>
          {product.order_count && (
            <p className="text-xs text-slate-500">{product.order_count} orders</p>
          )}
        </div>
        
        {/* Price Section with Prominent Savings */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">₹{discountedPrice.toFixed(0)}</span>
            {product.discount && (
              <span className="text-sm text-slate-500 line-through">₹{product.price}</span>
            )}
          </div>
          
          {product.discount && (
            <div className="text-sm text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">
              Save ₹{(product.price - discountedPrice).toFixed(0)}
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full h-9 min-h-0 py-0 px-2 rounded font-semibold text-xs border border-slate-300 transition-all duration-150 flex items-center justify-center gap-1 ${
            isAdding 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-white text-slate-900 hover:bg-orange-50'
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
  );
}
