import React, { useState, useEffect, useCallback } from 'react';
import { Store, Search, Plus, Edit, Trash2, Star, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [storeOwners, setStoreOwners] = useState([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchStores();
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/admin/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/admin/users?role=store_owner');
      setStoreOwners(response.data.users);
    } catch (error) {
      console.error('Error fetching store owners:', error);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const storeData = { ...newStore };
      if (!storeData.ownerId) {
        delete storeData.ownerId;
      }
      
      await api.post('/stores', storeData);
      toast.success('Store created successfully');
      setShowAddModal(false);
      setNewStore({
        name: '',
        email: '',
        address: '',
        ownerId: ''
      });
      fetchStores();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error(error.response?.data?.error || 'Failed to create store');
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await api.delete(`/stores/${storeId}`);
        toast.success('Store deleted successfully');
        fetchStores();
      } catch (error) {
        console.error('Error deleting store:', error);
        toast.error('Failed to delete store');
      }
    }
  };

  const handleEditStore = (store) => {
    setEditingStore({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.owner_id || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...editingStore };
      if (!updateData.ownerId) {
        delete updateData.ownerId;
      }
      
      await api.put(`/stores/${editingStore.id}`, updateData);
      toast.success('Store updated successfully');
      setShowEditModal(false);
      setEditingStore(null);
      fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error(error.response?.data?.error || 'Failed to update store');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all stores in the system
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="average_rating">Sort by Rating</option>
            <option value="created_at">Sort by Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn btn-secondary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Stores ({stores.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Store className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500">{store.email}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{store.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {store.average_rating}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({store.total_ratings})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {store.owner_name || 'No owner'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(store.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => handleEditStore(store)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStore(store.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No stores are available yet.'}
          </p>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Store</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={newStore.email}
                  onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                  className="input w-full"
                  placeholder="Enter store email"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-1">
                  Address (max 400 characters)
                </label>
                <textarea
                  id="address"
                  required
                  maxLength="400"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  className="input w-full"
                  rows="3"
                  placeholder="Enter store address"
                />
              </div>
              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-900 mb-1">
                  Store Owner (Optional)
                </label>
                <select
                  id="ownerId"
                  value={newStore.ownerId}
                  onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">No owner assigned</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Store</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStore} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={editingStore.email}
                  onChange={(e) => setEditingStore({ ...editingStore, email: e.target.value })}
                  className="input w-full"
                  placeholder="Enter store email"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-1">
                  Address (max 400 characters)
                </label>
                <textarea
                  id="address"
                  required
                  maxLength="400"
                  value={editingStore.address}
                  onChange={(e) => setEditingStore({ ...editingStore, address: e.target.value })}
                  className="input w-full"
                  rows="3"
                  placeholder="Enter store address"
                />
              </div>
              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-900 mb-1">
                  Store Owner (Optional)
                </label>
                <select
                  id="ownerId"
                  value={editingStore.ownerId}
                  onChange={(e) => setEditingStore({ ...editingStore, ownerId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">No owner assigned</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Update Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores; 