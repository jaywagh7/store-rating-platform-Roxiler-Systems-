import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Star, Calendar } from 'lucide-react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const StoreDetail = () => {
  const { id } = useParams();
  const { isNormalUser } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stores/${id}`);
      setStore(response.data.store);
      if (response.data.store.user_rating) {
        setUserRating(response.data.store.user_rating);
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
      toast.error('Failed to fetch store details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!isNormalUser) {
      toast.error('Only normal users can submit ratings');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/ratings/${id}`, { rating });
      setUserRating(rating);
      toast.success('Rating submitted successfully!');
      fetchStoreDetails(); // Refresh to get updated average
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Store not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The store you're looking for doesn't exist.
        </p>
        <Link to="/stores" className="btn btn-primary mt-4">
          Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/stores" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">Store Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{store.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{store.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(store.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RatingStars rating={parseFloat(store.average_rating)} readonly size="lg" />
                  <span className="text-2xl font-bold text-primary-600">
                    {store.average_rating}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Ratings</p>
                  <p className="text-lg font-semibold text-gray-900">{store.total_ratings}</p>
                </div>
              </div>

              {isNormalUser && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">Your Rating:</p>
                  <div className="flex items-center space-x-4">
                    <RatingStars
                      rating={userRating}
                      onRatingChange={handleRatingSubmit}
                      size="lg"
                    />
                    {submitting && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    )}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      You rated this store {userRating} star{userRating > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-semibold text-gray-900">{store.average_rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Ratings</span>
                <span className="font-semibold text-gray-900">{store.total_ratings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Store Age</span>
                <span className="font-semibold text-gray-900">
                  {Math.floor((new Date() - new Date(store.created_at)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <Link to="/stores" className="btn btn-secondary w-full">
                Back to Stores
              </Link>
              {isNormalUser && (
                <button 
                  onClick={() => handleRatingSubmit(0)}
                  className="btn btn-primary w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetail; 