import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/adminApi';
import {
  Loader,
  Trash2,
  Edit,
  Plus,
  Search,
  Ticket,
  Calendar,
  DollarSign,
  X,
  Check,
  Copy,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  amount: number;
  description?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  times_used?: number;
}

interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
}

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    amount: 0,
    description: '',
    valid_until: '',
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.coupons.getAll(token);
      if (response.success) {
        let filtered = response.coupons;

        // Filter by search term
        if (searchTerm) {
          filtered = filtered.filter((c: Coupon) =>
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Filter by status
        if (statusFilter === 'active') {
          filtered = filtered.filter((c: Coupon) => c.is_active);
        } else if (statusFilter === 'inactive') {
          filtered = filtered.filter((c: Coupon) => !c.is_active);
        }

        setCoupons(filtered);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [token, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [searchTerm]);

  const handleCreateCoupon = async () => {
    if (!token) return;
    try {
      const response = await adminApi.coupons.create(token, {
        code: formData.code,
        amount: formData.amount,
        description: formData.description,
        valid_until: formData.valid_until || undefined,
      });
      if (response.success) {
        fetchCoupons();
        setShowCreateModal(false);
        setFormData({ code: '', amount: 0, description: '', valid_until: '' });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!token || !editingCoupon) return;
    try {
      const response = await adminApi.coupons.update(token, editingCoupon.id, {
        is_active: !editingCoupon.is_active,
        valid_until: formData.valid_until || undefined,
      });
      if (response.success) {
        fetchCoupons();
        setEditingCoupon(null);
        setFormData({ code: '', amount: 0, description: '', valid_until: '' });
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!token || !confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await adminApi.coupons.delete(token, couponId);
      if (response.success) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      amount: coupon.amount,
      description: coupon.description || '',
      valid_until: coupon.valid_until || '',
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCoupon(null);
    setFormData({ code: '', amount: 0, description: '', valid_until: '' });
  };

  const copyToClipboard = async (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
      alert('Failed to copy code. Please copy manually: ' + code);
    }
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Coupon Management
                  </h1>
                  <p className="text-gray-600 mt-2">Create and manage discount coupons</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0040ffea] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Coupon
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Coupons Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-gray-600">Loading coupons...</p>
                </div>
              </div>
            ) : (
              <>
                {coupons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{coupon.code}</h3>
                                <p className="text-xs text-gray-500">Coupon Code</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <Copy className={`w-4 h-4 ${copiedCode === coupon.code ? 'text-green-600' : 'text-gray-600'}`} />
                          </button>
                        </div>

                        {coupon.description && (
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{coupon.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                              <p className="text-xs text-gray-600 font-medium">Value</p>
                            </div>
                            <p className="text-xl font-bold text-blue-700">₹{coupon.amount}</p>
                          </div>

                          <div className={`p-3 rounded-lg border ${coupon.is_active ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className={`text-xs font-medium mb-1 ${coupon.is_active ? 'text-blue-600' : 'text-gray-600'}`}>
                              Status
                            </p>
                            <p className={`text-sm font-semibold ${coupon.is_active ? 'text-blue-700' : 'text-gray-700'}`}>
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>

                        {coupon.valid_until && (
                          <div className="p-3 bg-gray-50 rounded-lg mb-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <p className="text-xs text-gray-600 font-medium">Valid Until</p>
                            </div>
                            <p className={`text-sm font-medium ${isExpired(coupon.valid_until) ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(coupon.valid_until).toLocaleDateString()}
                              {isExpired(coupon.valid_until) && ' (Expired)'}
                            </p>
                          </div>
                        )}

                        {coupon.times_used !== undefined && (
                          <div className="text-xs text-gray-500 mb-4 font-medium">
                            Used {coupon.times_used} time{coupon.times_used !== 1 ? 's' : ''}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No coupons found</p>
                    <p className="text-gray-400 text-sm">Create your first coupon to get started</p>
                  </div>
                )}
              </>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingCoupon) && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  <div className="px-6 py-4 space-y-4">
                    {!editingCoupon && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                          <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                            placeholder="e.g., SAVE50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (₹)</label>
                          <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                            placeholder="50"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                          <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                            placeholder="e.g., Welcome discount"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until (Optional)</label>
                      <input
                        type="datetime-local"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0040ffea]"
                      />
                    </div>

                    {editingCoupon && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className={`text-sm font-medium ${editingCoupon.is_active ? 'text-blue-700' : 'text-gray-700'}`}>
                            Current Status: {editingCoupon.is_active ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click update to toggle status</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 flex gap-2 justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                      className="px-4 py-2 bg-[#0040ffea] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {editingCoupon ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
