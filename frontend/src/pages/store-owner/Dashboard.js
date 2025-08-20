import React, { useState, useEffect } from 'react';
import { Store, Star, Users, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import RatingStars from '../../components/RatingStars';
import { toast } from 'react-hot-toast';

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stores: [],
    recentRatings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Owner Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor your stores and customer ratings
        </p>
      </div>

      {/* Store Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.stores.map((store) => (
          <div key={store.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
              <Store className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-2">
                  <RatingStars rating={parseFloat(store.average_rating)} readonly size="sm" />
                  <span className="font-semibold text-primary-600">
                    {store.average_rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Ratings</span>
                <span className="font-medium text-gray-900">{store.total_ratings}</span>
              </div>
              <div className="text-sm text-gray-500">
                <p className="truncate">{store.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Ratings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Ratings</h2>
        {dashboardData.recentRatings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ratings from customers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentRatings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {rating.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rating.user_name}</p>
                      <p className="text-sm text-gray-500">{rating.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={rating.rating} readonly size="sm" />
                    <span className="font-semibold text-primary-600">{rating.rating}</span>
                  </div>
                </div>
                <div className="mt-2 ml-11">
                  <p className="text-sm text-gray-600">
                    Store: <span className="font-medium">{rating.store_name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard; 