import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { cartStorage } from '@/lib/cartStorage';
import { userApi } from '@/lib/userApi';
import { Trash2, ShoppingBag, ArrowLeft, Loader } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string;
  is_available: boolean;
}

interface CartItemData {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [allProducts, setAllProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Delivery options
  const [deliveryType, setDeliveryType] = useState<'canteen' | 'classroom'>('canteen');
  const [roomNumber, setRoomNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== 'user') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch products and cart items on mount
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch all products
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();

        if (!isMounted) return;

        const productMap = new Map<string, Product>();
        if (productsData.success && productsData.products) {
          productsData.products.forEach((product: Product) => {
            productMap.set(product.id, product);
          });
          setAllProducts(productMap);

          // Load cart from localStorage after products are loaded
          const cart = cartStorage.getCart();
          const cartItemsData: CartItemData[] = [];
          cart.forEach((quantity, productId) => {
            const product = productMap.get(productId);
            if (product) {
              cartItemsData.push({ product, quantity });
            }
          });

          if (isMounted) {
            setCartItems(cartItemsData);
          }
        }

        // Fetch user profile to refresh wallet
        const profileData = await userApi.profile.get(token);
        if (profileData.success && profileData.user && isMounted) {
          refreshUser(profileData.user);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Listen for cart changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && isMounted) {
        const cart = cartStorage.getCart();
        const cartItemsData: CartItemData[] = [];
        cart.forEach((quantity, productId) => {
          const product = allProducts.get(productId);
          if (product) {
            cartItemsData.push({ product, quantity });
          }
        });
        setCartItems(cartItemsData);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, refreshUser]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setUpdatingItem(productId);
    try {
      cartStorage.setQuantity(productId, newQuantity);
      const cart = cartStorage.getCart();
      const cartItemsData: CartItemData[] = [];
      cart.forEach((quantity, id) => {
        const product = allProducts.get(id);
        if (product) {
          cartItemsData.push({ product, quantity });
        }
      });
      setCartItems(cartItemsData);
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setRemovingItem(productId);
    try {
      cartStorage.removeFromCart(productId);
      const cart = cartStorage.getCart();
      const cartItemsData: CartItemData[] = [];
      cart.forEach((quantity, id) => {
        const product = allProducts.get(id);
        if (product) {
          cartItemsData.push({ product, quantity });
        }
      });
      setCartItems(cartItemsData);
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = async () => {
    if (!token || cartItems.length === 0) return;

    // Validate classroom delivery
    if (deliveryType === 'classroom' && !roomNumber.trim()) {
      alert('Please enter your room number for classroom delivery');
      return;
    }

    setCheckingOut(true);
    try {
      const totalAmount = totalPrice;

      // Check if wallet has sufficient balance
      if (!user) {
        alert('User not authenticated');
        setCheckingOut(false);
        return;
      }

      if (user.wallet_balance < totalAmount) {
        alert(`Insufficient wallet balance. You need ₹${totalAmount} but have ₹${user.wallet_balance}`);
        setCheckingOut(false);
        return;
      }

      const orderData = {
        cart_items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        delivery_type: deliveryType,
        room_number: deliveryType === 'classroom' ? roomNumber : undefined,
        notes: notes || '',
        wallet_amount_used: totalAmount
      };

      const response = await userApi.orders.create(token, orderData);
      if (response.success) {
        // Clear cart from localStorage
        cartStorage.clearCart();
        
        // Refresh user profile to update wallet balance
        const profileData = await userApi.profile.get(token);
        if (profileData.success && profileData.user) {
          refreshUser(profileData.user);
        }
        
        setCartItems([]);
        alert('Order placed successfully! Your wallet has been debited.');
        router.push('/user/orders');
      } else {
        alert(response.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!user || user.role !== 'user') return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/user/menu">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-black">My Cart</h1>
            <p className="text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#0040ffea' }} />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items to get started!</p>
            <Link href="/user/menu">
              <button className="px-6 py-3 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#0040ffea' }}>
                Browse Menu
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{item.product.name}</h3>
                      <p className="text-lg font-bold text-black">₹{item.product.price}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={updatingItem === item.product.id}
                          className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={updatingItem === item.product.id}
                          className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <span className="text-lg font-bold text-black">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={removingItem === item.product.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Delivery Options */}
            <div className="space-y-6">
              {/* Delivery Options */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-black mb-4">Delivery Type</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: deliveryType === 'canteen' ? '#0040ffea' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="delivery"
                      value="canteen"
                      checked={deliveryType === 'canteen'}
                      onChange={(e) => setDeliveryType(e.target.value as 'canteen' | 'classroom')}
                      className="w-4 h-4"
                    />
                    <span className="text-black font-medium">Canteen Pickup</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: deliveryType === 'classroom' ? '#0040ffea' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="delivery"
                      value="classroom"
                      checked={deliveryType === 'classroom'}
                      onChange={(e) => setDeliveryType(e.target.value as 'canteen' | 'classroom')}
                      className="w-4 h-4"
                    />
                    <span className="text-black font-medium">College Delivery</span>
                  </label>
                </div>

                {/* Room Number Input */}
                {deliveryType === 'classroom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-black mb-2">Room Number</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g., A-101"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-black mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Extra spicy, no onions..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-black">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold text-black">{totalItems}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-black text-lg">Total</span>
                  <span className="font-bold text-lg" style={{ color: '#0040ffea' }}>
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between mb-6 text-sm">
                  <span className="text-gray-600">Wallet Balance</span>
                  <span className={`font-semibold ${user.wallet_balance >= totalPrice ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{user.wallet_balance.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0 || user.wallet_balance < totalPrice}
                  className="w-full py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#0040ffea' }}
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : user.wallet_balance < totalPrice ? (
                    'Insufficient Balance'
                  ) : (
                    'Place Order'
                  )}
                </button>

                <Link href="/user/menu">
                  <button className="w-full mt-3 py-3 rounded-lg font-medium border border-gray-200 text-black hover:bg-gray-50 transition-colors">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
