import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import { FaSearch, FaTrash, FaPlus, FaEye, FaSortAmountUp, FaSortAmountDown, FaStore } from 'react-icons/fa';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ManageCanteens() {
  const [canteens, setCanteens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState<any>(null);
  const [showAddCanteen, setShowAddCanteen] = useState(false);
  const [newCanteenData, setNewCanteenData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/admin/canteens', {
        headers: {
          Authorization: token || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCanteens(data.canteens || []);
      } else {
        throw new Error('Failed to fetch canteens');
      }
    } catch (error) {
      toast.error('Error loading canteens');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCanteen = async (password?: string) => {
    if (!password) {
      toast.error('Password is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost969.pythonanywhere.com/admin/canteens/${selectedCanteen.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        toast.success('Canteen deleted successfully');
        fetchCanteens();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete canteen');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setShowDeleteConfirm(false);
    setSelectedCanteen(null);
  };

  const handleAddCanteen = async () => {
    if (!newCanteenData.name || !newCanteenData.email || !newCanteenData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/admin/canteens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify(newCanteenData)
      });
      
      if (response.ok) {
        toast.success('Canteen added successfully');
        fetchCanteens();
        setShowAddCanteen(false);
        setNewCanteenData({ name: '', email: '', password: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add canteen');
    }
  };

  // Sort function
  const sortCanteens = (a: any, b: any) => {
    if (!a[sortField]) return sortOrder === 'asc' ? 1 : -1;
    if (!b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    
    const comparison = a[sortField].toString().localeCompare(b[sortField].toString());
    return sortOrder === 'asc' ? comparison : -comparison;
  };

  const filteredCanteens = canteens
    .filter(canteen => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        canteen.name?.toLowerCase().includes(searchLower) ||
        canteen.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort(sortCanteens);

  // Pagination
  const totalPages = Math.ceil(filteredCanteens.length / itemsPerPage);
  const paginatedCanteens = filteredCanteens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <AdminLayout title="Canteen Management">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canteen Management</h1>
                <p className="text-gray-600 mt-1">Manage canteen accounts and monitor their activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-green-700">
                    Active Canteens: {filteredCanteens.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddCanteen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FaPlus className="mr-2" />
                  Add New Canteen
                </button>
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
                        Canteen Name
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
                        Date Added
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading canteens...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCanteens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <FaStore className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No canteens found</h3>
                          <p className="text-sm">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No canteens have been added yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCanteens.map((canteen) => (
                      <tr key={canteen.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                              {canteen.name ? canteen.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {canteen.name}
                              </div>
                              <div className="text-sm text-gray-500">ID: {canteen.email?.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{canteen.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(canteen.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(canteen.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCanteen(canteen);
                              setShowDeleteConfirm(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Canteen"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
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
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCanteens.length)} of {filteredCanteens.length} canteens
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

        {/* Add Canteen Modal */}
        {showAddCanteen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddCanteen(false)} />
              
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-6 py-6">
                  <div className="flex items-center mb-6">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                      <FaStore className="text-white text-lg" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Add New Canteen</h3>
                      <p className="text-sm text-gray-600">Create a new canteen account</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canteen Name *
                      </label>
                      <input
                        type="text"
                        value={newCanteenData.name}
                        onChange={(e) => setNewCanteenData({...newCanteenData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter canteen name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newCanteenData.email}
                        onChange={(e) => setNewCanteenData({...newCanteenData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newCanteenData.password}
                        onChange={(e) => setNewCanteenData({...newCanteenData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowAddCanteen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    onClick={handleAddCanteen}
                  >
                    Add Canteen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Canteen"
          message={`Are you sure you want to delete ${selectedCanteen?.name}? This action cannot be undone and will permanently remove all canteen data.`}
          confirmLabel="Delete Canteen"
          requirePassword={true}
          onConfirm={handleDeleteCanteen}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedCanteen(null);
          }}
        />
      </AdminLayout>
    </RoleBasedGuard>
  );
}
