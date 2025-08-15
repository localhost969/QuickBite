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
      className="bg-white border border-slate-200 rounded-lg transition-all duration-200 hover:shadow-sm flex flex-col"
      onClick={onToggleExpand}
    >
      {/* Main Content */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Image */}
        <div className="relative w-11 h-11 rounded-md overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className="bg-blue-600 text-white text-[10px] font-semibold px-1 py-0.5 rounded-full leading-none">
                -{product.discount}%
              </div>
            </div>
          )}
          <img
            src={product.image_url || '/images/placeholder-food.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-food.jpg';
            }}
          />
        </div>
        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 text-sm truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-slate-900 text-sm">₹{discountedPrice.toFixed(0)}</span>
            {product.discount && (
              <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, 1);
            }}
            className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Add to cart"
            style={{ minWidth: 32, minHeight: 32 }}
          >
            <FaShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Remove from favorites"
            style={{ minWidth: 32, minHeight: 32 }}
          >
            <FaHeart className="w-4 h-4 fill-current" />
          </button>
          <MotionDiv
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-slate-400 transition-transform duration-200 flex items-center justify-center w-8 h-8"
            style={{ minWidth: 32, minHeight: 32 }}
          >
            <FaChevronRight className="w-3.5 h-3.5" />
          </MotionDiv>
        </div>
      </div>
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-slate-100 bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5"
            style={{
              minWidth: 0,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={quantity <= 1}
                  style={{ minWidth: 32, minHeight: 32 }}
                >
                  <IoRemove className="w-4 h-4 text-slate-700" />
                </button>
                <span className="font-medium w-8 text-center text-base select-none">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(quantity + 1);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ minWidth: 32, minHeight: 32 }}
                >
                  <IoAdd className="w-4 h-4 text-slate-700" />
                </button>
              </div>
              {/* Move both buttons to next line, stacked vertically */}
              <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={isRemoving}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ minHeight: 36 }}
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className="flex items-center justify-center gap-1 w-full px-0 py-2 bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-800 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-1"
                  style={{ minHeight: 32, fontSize: '0.95rem', fontWeight: 600, letterSpacing: 0.01, boxShadow: '0 1px 2px rgba(16,30,54,0.06)' }}
                >
                  <FaShoppingCart className="w-4 h-4 mr-1.5 -ml-1" />
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
      className="bg-white border border-slate-200/60 rounded-xl overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <FaHeart className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Favorites</h2>
            <p className="text-sm text-slate-600">{favorites.length} items</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-lg p-4 h-16"></div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm mb-4">No favorites yet</p>
            <p className="text-xs text-slate-400">Heart items to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.slice(0, 5).map((product) => (
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
            {favorites.length > 5 && (
              <div className="pt-2 text-center">
                <button className="text-sm text-blue-700 hover:text-blue-800 font-medium">
                  View all {favorites.length} favorites
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MotionDiv>
  );
}