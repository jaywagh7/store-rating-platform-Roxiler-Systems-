import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, MapPin, Shield } from 'lucide-react';

const Profile = () => {
  const { user, updatePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await updatePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your account information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{user?.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                  {...register('currentPassword', {
                    required: 'Current password is required',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="form-error">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                    maxLength: {
                      value: 16,
                      message: 'Password must not exceed 16 characters',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
                      message: 'Password must contain at least one uppercase letter and one special character',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="form-error">{errors.newPassword.message}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Password requirements:
                <ul className="list-disc list-inside mt-1">
                  <li>8-16 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one special character</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 