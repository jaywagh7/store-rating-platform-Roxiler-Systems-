import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Mail, Store } from 'lucide-react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import { toast } from 'react-hot-toast';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

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

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/stores?${params}`);
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder]);

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      await api.post(`/ratings/${storeId}`, { rating });
      toast.success('Rating submitted successfully!');
      fetchStores(); // Refresh to get updated average rating
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse and rate stores in your area
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="name">Sort by Name</option>
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
      </div>

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No stores are available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="card hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link
                      to={`/stores/${store.id}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {store.name}
                    </Link>
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{store.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={parseFloat(store.average_rating)} readonly size="sm" />
                    <span className="text-sm text-gray-600">
                      ({store.total_ratings} ratings)
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-primary-600">
                    {store.average_rating}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">Rate this store:</p>
                  <RatingStars
                    rating={0}
                    onRatingChange={(rating) => handleRatingSubmit(store.id, rating)}
                    size="md"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stores; 