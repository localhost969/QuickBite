import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPencilAlt, FaTrash, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  availability: string;
  image_url: string;
}

export default function CanteenMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    availability: 'available',
    image: null as File | null,
    image_url: '' // Add this to store current image URL
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/get-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      availability: product.availability,
      image: null,
      image_url: product.image_url // Store the current image URL
    });
    setEditingProduct(product);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('availability', formData.availability);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingProduct 
        ? `https://localhost969.pythonanywhere.com/update-product/${editingProduct.id}`
        : 'https://localhost969.pythonanywhere.com/add-product';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to process product');
      }
    } catch (error) {
      toast.error('Error processing product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      availability: 'available',
      image: null,
      image_url: ''
    });
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`https://localhost969.pythonanywhere.com/delete-product/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = filterCategory 
    ? products.filter(p => p.category === filterCategory)
    : products;

  return (
    <CanteenLayout>
      <Head>
        <title>Menu Management | QuickBite</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-10">
        {/* Heading section (unchanged) */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Menu Management</h1>
            <p className="text-base text-blue-700 mt-2">Add, edit, and manage your menu items</p>
          </div>
        </div>

        {/* Redesigned: Form and Product Grid visually unified and compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow border border-blue-100 p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-900">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-blue-900 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-blue-900 text-sm"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-blue-900 text-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-blue-900 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-900">Image</label>
                  {formData.image_url && !formData.image && (
                    <div className="mt-1 mb-2">
                      <img 
                        src={formData.image_url} 
                        alt="Current product" 
                        className="h-20 w-20 object-cover rounded-lg border border-blue-200"
                      />
                      <p className="text-xs text-blue-700 mt-1">Current image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="mt-1 block w-full text-xs text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editingProduct && (
                    <p className="mt-1 text-xs text-blue-700">
                      Upload a new image only if you want to change the current one
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full px-3 py-2 border border-blue-700 rounded-lg shadow text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
                    {editingProduct ? 'Update' : 'Add'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg shadow text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Products Grid - compact, modern */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow border border-blue-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-blue-900">Menu Items</h2>
                <div className="relative w-48">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none w-full rounded-lg border-blue-200 text-sm text-blue-900 px-3 py-2 pr-8 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700 text-xs">
                    
                  </span>
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-lg shadow border border-blue-100 hover:shadow-md transition-shadow min-h-[220px] flex flex-col"
                      >
                        <div className="relative bg-blue-50 h-32 border-b border-blue-100 flex items-center justify-center">
                          <img
                            src={product.image_url || '/placeholder.png'}
                            alt={product.name}
                            className="object-contain w-full h-full p-2"
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-blue-900 text-base truncate">{product.name}</h3>
                                <p className="text-blue-700 font-medium text-sm">₹{product.price}</p>
                              </div>
                              {product.availability === 'available' ? (
                                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                                  <FaCheckCircle className="text-blue-700 w-3.5 h-3.5" /> In stock
                                </span>
                              ) : (
                                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                  <FaTimesCircle className="text-gray-400 w-3.5 h-3.5" /> Out of Stock
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-blue-700 capitalize block mb-1">{product.category}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="flex-1 px-2 py-0.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors min-h-0"
                              style={{ minHeight: '0', height: '28px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 px-2 py-0.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors min-h-0"
                              style={{ minHeight: '0', height: '28px' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-6 text-blue-700">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CanteenLayout>
  );
}
