import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Plus, Edit, Trash2, Settings, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingRole, setEditingRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user'
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm, roleFilter, sortBy, sortOrder]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (roleFilter) params.append('role', roleFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, roleFilter, sortBy, sortOrder]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      setEditingRole(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'normal_user'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      password: '' // Don't pre-fill password
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...editingUser };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await api.put(`/admin/users/${editingUser.id}`, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const RoleDropdown = ({ user }) => {
    if (editingRole !== user.id) {
      return (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === 'system_admin' ? 'bg-red-100 text-red-800' :
            user.role === 'store_owner' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user.role.replace('_', ' ')}
          </span>
          <button
            onClick={() => setEditingRole(user.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <select
          defaultValue={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="system_admin">System Admin</option>
        </select>
        <button
          onClick={() => setEditingRole(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all users in the system
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input"
          >
            <option value="">All Roles</option>
            <option value="system_admin">System Admin</option>
            <option value="normal_user">Normal User</option>
            <option value="store_owner">Store Owner</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
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

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleDropdown user={user} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate">{user.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
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

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter ? 'Try adjusting your search terms.' : 'No users are available yet.'}
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Name (20-60 characters)
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  minLength="20"
                  maxLength="60"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter full name"
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
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input w-full"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                  Password (8-16 chars, uppercase + special char)
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength="8"
                  maxLength="16"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="input w-full"
                  placeholder="Enter password"
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
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  className="input w-full"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="normal_user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="system_admin">System Admin</option>
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Name (20-60 characters)
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  minLength="20"
                  maxLength="60"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter full name"
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
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="input w-full"
                  placeholder="Enter email address"
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
                  value={editingUser.address}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="input w-full"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="normal_user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="system_admin">System Admin</option>
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
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 