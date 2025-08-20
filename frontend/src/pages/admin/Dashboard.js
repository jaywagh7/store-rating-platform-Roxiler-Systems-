import React, { useState, useEffect } from 'react';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data.statistics);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of the store rating system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          color="bg-green-500"
        />
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          icon={Star}
          color="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">Add, edit, or remove users</p>
            </div>
          </a>
          <a
            href="/admin/stores"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Store className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Stores</p>
              <p className="text-sm text-gray-500">Add, edit, or remove stores</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Platform</p>
            <p className="font-medium">Roxiler Store Rating System</p>
          </div>
          <div>
            <p className="text-gray-600">Version</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">Database</p>
            <p className="font-medium">PostgreSQL</p>
          </div>
          <div>
            <p className="text-gray-600">Backend</p>
            <p className="font-medium">Express.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 