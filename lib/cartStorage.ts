/**
 * Cart Storage Utilities
 * Manages cart operations using localStorage
 */

const CART_STORAGE_KEY = 'cart';

export interface CartItem {
  productId: string;
  quantity: number;
}

export const cartStorage = {
  /**
   * Get all cart items from localStorage
   */
  getCart: (): Map<string, number> => {
    try {
      if (typeof window === 'undefined') return new Map();
      
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData) return new Map();
      
      const cartArray = JSON.parse(cartData) as [string, number][];
      return new Map(cartArray);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return new Map();
    }
  },

  /**
   * Save cart to localStorage
   */
  saveCart: (cart: Map<string, number>): void => {
    try {
      if (typeof window === 'undefined') return;
      
      const cartArray = Array.from(cart.entries());
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartArray));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  /**
   * Add or increment product quantity in cart
   */
  addToCart: (productId: string, quantity: number = 1): void => {
    const cart = cartStorage.getCart();
    const currentQuantity = cart.get(productId) || 0;
    cart.set(productId, currentQuantity + quantity);
    cartStorage.saveCart(cart);
  },

  /**
   * Remove or decrement product from cart
   */
  removeFromCart: (productId: string, quantity: number = 1): void => {
    const cart = cartStorage.getCart();
    const currentQuantity = cart.get(productId) || 0;
    const newQuantity = currentQuantity - quantity;

    if (newQuantity <= 0) {
      cart.delete(productId);
    } else {
      cart.set(productId, newQuantity);
    }

    cartStorage.saveCart(cart);
  },

  /**
   * Set exact quantity for a product
   */
  setQuantity: (productId: string, quantity: number): void => {
    const cart = cartStorage.getCart();
    
    if (quantity <= 0) {
      cart.delete(productId);
    } else {
      cart.set(productId, quantity);
    }

    cartStorage.saveCart(cart);
  },

  /**
   * Get quantity of a specific product
   */
  getQuantity: (productId: string): number => {
    return cartStorage.getCart().get(productId) || 0;
  },

  /**
   * Get total number of items in cart
   */
  getTotalItems: (): number => {
    const cart = cartStorage.getCart();
    let total = 0;
    cart.forEach((quantity) => {
      total += quantity;
    });
    return total;
  },

  /**
   * Clear entire cart
   */
  clearCart: (): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  /**
   * Check if product is in cart
   */
  isInCart: (productId: string): boolean => {
    return cartStorage.getCart().has(productId);
  },
};
