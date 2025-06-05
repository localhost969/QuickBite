import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaUserEdit, FaTrash, FaWallet, FaSearch, FaSortAmountUp, FaSortAmountDown, FaFilter, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/admin/users', {
        headers: {
          Authorization: token || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (userId: string) => {
    const amountStr = prompt('Enter amount to add to wallet:');
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost969.pythonanywhere.com/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        toast.success(`Added ₹${amount} to wallet successfully`);
        fetchUsers(); // Refresh user list
      } else {
        throw new Error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update wallet balance');
    }
  };

  const handleDeleteUser = async (password?: string) => {
    if (!password) {
      toast.error('Password is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost969.pythonanywhere.com/admin/users/${selectedUser.email}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  // Sort function for users
  const sortUsers = (a: any, b: any) => {
    if (sortField === 'wallet_balance') {
      return sortOrder === 'asc' 
        ? a.wallet_balance - b.wallet_balance
        : b.wallet_balance - a.wallet_balance;
    }
    
    if (!a[sortField]) return sortOrder === 'asc' ? 1 : -1;
    if (!b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    
    const comparison = a[sortField].toString().localeCompare(b[sortField].toString());
    return sortOrder === 'asc' ? comparison : -comparison;
  };

  // Filter and sort users for display
  const displayUsers = users
    .filter(user => {
      // First filter out admins and canteens
      if (user.role === 'admin' || user.role === 'canteen') return false;
      
      // Then apply search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort(sortUsers);

  // Pagination
  const totalPages = Math.ceil(displayUsers.length / itemsPerPage);
  const paginatedUsers = displayUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle sort order and field
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
    }
    return null;
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout title="User Management">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage and monitor all registered users in the system</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    Total Users: {displayUsers.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search by name or email..."
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      onClick={() => toggleSort('name')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('email')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('created_at')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Joined Date
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <FaEye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-sm">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No users have registered yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, index) => (
                      <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user.email?.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddBalance(user.email)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                              title="Add to Wallet"
                            >
                              <FaWallet className="mr-1" />
                              Add Balance
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteConfirm(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                              title="Delete User"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayUsers.length)} of {displayUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone and will permanently remove all user data.`}
          confirmLabel="Delete User"
          requirePassword={true}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
          }}
        />
      </AdminLayout>
    </RoleBasedGuard>
  );
}
