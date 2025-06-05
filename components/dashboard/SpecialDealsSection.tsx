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
      className="bg-white rounded-xl shadow-lg border border-gray-50 overflow-hidden"
    >
      {/* Compact Header */}
      <div className="relative px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <RiFireFill className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hot Deals</h2>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MdOutlineTimer className="w-3 h-3" />
                <span>Limited time</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            <RiEBike2Fill className="w-3 h-3" />
            <span>Free delivery</span>
          </div>
        </div>
      </div>

      {/* Compact Products Grid */}
      <div className="p-4">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product, index) => (
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
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MdLocalOffer className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-500 text-sm">No deals available</p>
          </div>
        )}
      </div>
    </MotionDiv>
  );
}

function SpecialDealCard({ product, onToggleFavorite, isFavorite }: SpecialDealCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`Added ${product.name}`, { autoClose: 1000 });
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add');
    }
  };

  const handleBulkAddToCart = () => {
    try {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      toast.success(`Added ${quantity}x ${product.name}`, { autoClose: 1000 });
    } catch (error) {
      toast.error('Failed to add');
    }
  };

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;
  
  const savings = product.price - discountedPrice;
    
  return (
    <MotionDiv
      layout
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
      whileHover={{ y: -2 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">
            {product.discount}% OFF
          </div>
        </div>
      )}

      {/* Same Image Styling */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/default-food.jpg';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Compact Favorite Heart */}
        <MotionDiv
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-md cursor-pointer"
        >
          <FaHeart className={`w-3 h-3 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} />
        </MotionDiv>

        {/* Compact Rating */}
        {product.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs">
            <IoStar className="text-yellow-500 w-3 h-3" />
            <span className="font-medium">{product.rating}</span>
          </div>
        )}
      </div>
      
      {/* Compact Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg text-gray-900">₹{discountedPrice.toFixed(0)}</span>
            {product.discount && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
          
          {savings > 0 && (
            <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
              Save ₹{savings.toFixed(0)}
            </div>
          )}
        </div>

        {/* Compact Actions */}
        <div className="flex items-center gap-2">
          <MotionDiv
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isAdding 
                ? 'bg-gray-200 text-gray-500' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isAdding ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaShoppingCart className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </MotionDiv>
          
          <MotionDiv
            whileHover={{ rotate: isExpanded ? 90 : 180 }}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
          >
            <FaChevronRight className={`w-3 h-3 text-gray-600 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </MotionDiv>
        </div>
      </div>

      {/* Compact Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-gray-50 px-3 pb-3"
          >
            <div className="py-2 text-center text-xs font-medium text-green-700">
              🎉 Save ₹{savings.toFixed(0)} with this deal!
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Qty:</span>
              
              <div className="flex items-center gap-2">
                <MotionDiv
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="w-6 h-6 rounded-full bg-white border flex items-center justify-center cursor-pointer"
                >
                  <IoRemove className="w-3 h-3" />
                </MotionDiv>
                
                <span className="font-medium w-6 text-center text-sm">{quantity}</span>
                
                <MotionDiv
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(quantity + 1);
                  }}
                  className="w-6 h-6 rounded-full bg-white border flex items-center justify-center cursor-pointer"
                >
                  <IoAdd className="w-3 h-3" />
                </MotionDiv>
              </div>
            </div>
            
            <MotionDiv
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={(e) => {
                e.stopPropagation();
                handleBulkAddToCart();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-500 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-red-600"
            >
              <FaShoppingCart className="w-3 h-3" />
              <span>Add {quantity} • ₹{(discountedPrice * quantity).toFixed(0)}</span>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}