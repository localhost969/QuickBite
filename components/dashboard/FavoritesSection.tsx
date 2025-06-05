import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaHeart, FaChevronRight } from 'react-icons/fa';
import { IoAdd, IoRemove } from 'react-icons/io5';

const MotionDiv = motion.div;

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  discount?: number;
}

interface FavoritesSectionProps {
  favorites: FavoriteProduct[];
  onAddToCart: (product: FavoriteProduct, quantity: number) => Promise<void>;
  onRemoveFavorite: (productId: string) => Promise<void>;
  isLoading?: boolean;
}

interface FavoriteItemProps {
  product: FavoriteProduct;
  onAddToCart: (product: FavoriteProduct, quantity: number) => Promise<void>;
  onRemoveFavorite: (productId: string) => Promise<void>;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function FavoriteItem({ 
  product, 
  onAddToCart, 
  onRemoveFavorite, 
  isExpanded, 
  onToggleExpand 
}: FavoriteItemProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await onAddToCart(product, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemoveFavorite(product.id);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isRemoving) return null;

  return (
    <MotionDiv
      layout
      className="bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-lg transition-all duration-200"
      onClick={onToggleExpand}
    >
      {/* Main Content */}
      <div className="flex items-center gap-2.5 p-2.5">
        {/* Image */}
        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0">
          {product.discount && (
            <div className="absolute -top-0.5 -right-0.5 z-10">
              <div className="bg-green-500 text-white text-xs font-medium px-1 py-0.5 rounded-full leading-none">
                {product.discount}%
              </div>
            </div>
          )}
          
          <img
            src={product.image_url || '/images/default-food.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/default-food.jpg';
            }}
          />
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-semibold text-red-600 text-sm">₹{discountedPrice.toFixed(0)}</span>
            {product.discount && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, 1);
          }}
          className="w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-200 flex items-center justify-center group"
          disabled={isAdding}
          title="Add to cart"
        >
          <FaShoppingCart className="w-3 h-3 group-active:scale-90 transition-transform duration-150" />
        </button>

        {/* Expand Icon */}
        <MotionDiv
          animate={{ rotate: isExpanded ? 90 : 0 }}
          className="text-gray-400 transition-transform duration-200"
        >
          <FaChevronRight className="w-2 h-2" />
        </MotionDiv>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-white px-2.5 py-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled={quantity <= 1}
                >
                  <IoRemove className="w-2.5 h-2.5 text-gray-700" />
                </button>
                
                <span className="font-medium w-6 text-center text-sm">{quantity}</span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(quantity + 1);
                  }}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <IoAdd className="w-2.5 h-2.5 text-gray-700" />
                </button>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={isRemoving}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {isAdding ? 'Adding...' : `Add ${quantity}`}
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}

export default function FavoritesSection({ 
  favorites = [], 
  onAddToCart, 
  onRemoveFavorite,
  isLoading = false 
}: FavoritesSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-50 rounded-lg">
            <FaHeart className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Your Favorites</h2>
            <p className="text-xs text-gray-500">{favorites.length} saved items</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-100">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
              <FaHeart className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1 text-sm">No favorites yet</h3>
            <p className="text-xs text-gray-500 mb-3">
              Start adding items to your favorites to see them here
            </p>
            <button
              onClick={() => window.location.href = '/menu'}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((product) => (
              <FavoriteItem
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onRemoveFavorite={onRemoveFavorite}
                isExpanded={expandedId === product.id}
                onToggleExpand={() => 
                  setExpandedId(expandedId === product.id ? null : product.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
} 