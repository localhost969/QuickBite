/**
 * useCart Hook
 * Provides real-time cart state updates from localStorage
 */

import { useEffect, useState } from 'react';
import { cartStorage } from '@/lib/cartStorage';

export function useCart() {
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [cartCount, setCartCount] = useState(0);

  // Initialize cart from localStorage
  useEffect(() => {
    const updateCart = () => {
      const cart = cartStorage.getCart();
      setCartItems(cart);
      const totalItems = cartStorage.getTotalItems();
      setCartCount(totalItems);
    };

    updateCart();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    cartItems,
    cartCount,
    addToCart: (productId: string, quantity?: number) => {
      cartStorage.addToCart(productId, quantity || 1);
      const cart = cartStorage.getCart();
      setCartItems(cart);
      setCartCount(cartStorage.getTotalItems());
    },
    removeFromCart: (productId: string, quantity?: number) => {
      cartStorage.removeFromCart(productId, quantity || 1);
      const cart = cartStorage.getCart();
      setCartItems(cart);
      setCartCount(cartStorage.getTotalItems());
    },
    setQuantity: (productId: string, quantity: number) => {
      cartStorage.setQuantity(productId, quantity);
      const cart = cartStorage.getCart();
      setCartItems(cart);
      setCartCount(cartStorage.getTotalItems());
    },
    clearCart: () => {
      cartStorage.clearCart();
      setCartItems(new Map());
      setCartCount(0);
    },
  };
}
