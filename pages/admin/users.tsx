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
        <div className="min-h-screen bg-gradient-to-br from-gray-50/70 to-white mx-2 sm:mx-4 mt-2 sm:mt-4">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage and monitor all registered users in the system</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    Total Users: {displayUsers.length}
                  </span>
                </div>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-200 focus:border-primary-400 text-sm bg-gray-50"
                placeholder="Search by name or email..."
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th 
                      onClick={() => toggleSort('name')}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('email')}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('created_at')}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Joined Date
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-500"></div>
                          <span className="ml-3 text-gray-500 text-sm">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="text-gray-400">
                          <FaEye className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                          <h3 className="text-base font-medium text-gray-700 mb-1">No users found</h3>
                          <p className="text-xs">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No users have registered yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm border border-gray-200">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-800">
                                {user.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">ID: {user.email?.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-700">{user.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-700">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(user.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddBalance(user.email)}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors border border-primary-100"
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
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors border border-red-100"
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
              <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayUsers.length)} of {displayUsers.length} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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

