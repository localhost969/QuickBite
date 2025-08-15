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
        <div className="min-h-screen bg-gradient-to-br from-gray-50/70 to-white mx-2 sm:mx-4 mt-2 sm:mt-4">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Canteen Management</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage canteen accounts and monitor their activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    Active Canteens: {filteredCanteens.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddCanteen(true)}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors border border-primary-100"
                >
                  <FaPlus className="mr-1" />
                  Add New Canteen
                </button>
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
                        Canteen Name
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
                        Date Added
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-500"></div>
                          <span className="ml-3 text-gray-500 text-sm">Loading canteens...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCanteens.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="text-gray-400">
                          <FaStore className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                          <h3 className="text-base font-medium text-gray-700 mb-1">No canteens found</h3>
                          <p className="text-xs">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No canteens have been added yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCanteens.map((canteen) => (
                      <tr key={canteen.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm border border-gray-200">
                              {canteen.name ? canteen.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-800">
                                {canteen.name}
                              </div>
                              <div className="text-xs text-gray-400">ID: {canteen.email?.split('@')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-700">{canteen.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-700">
                            {new Date(canteen.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(canteen.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            Active
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedCanteen(canteen);
                              setShowDeleteConfirm(true);
                            }}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors border border-red-100"
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
              <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCanteens.length)} of {filteredCanteens.length} canteens
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

        {/* Add Canteen Modal */}
        {showAddCanteen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddCanteen(false)} />
              
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                <div className="bg-white px-6 py-6">
                  <div className="flex items-center mb-6">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <FaStore className="text-gray-500 text-lg" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-gray-800">Add New Canteen</h3>
                      <p className="text-xs text-gray-500">Create a new canteen account</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Canteen Name *
                      </label>
                      <input
                        type="text"
                        value={newCanteenData.name}
                        onChange={(e) => setNewCanteenData({...newCanteenData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-200 focus:border-primary-400 text-sm bg-gray-50"
                        placeholder="Enter canteen name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newCanteenData.email}
                        onChange={(e) => setNewCanteenData({...newCanteenData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-200 focus:border-primary-400 text-sm bg-gray-50"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={newCanteenData.password}
                        onChange={(e) => setNewCanteenData({...newCanteenData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-200 focus:border-primary-400 text-sm bg-gray-50"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-primary-200"
                    onClick={() => setShowAddCanteen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-200"
                    onClick={handleAddCanteen}
                  >
                    Add Canteen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
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
