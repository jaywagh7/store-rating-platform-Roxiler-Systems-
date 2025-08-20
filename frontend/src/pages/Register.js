import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Store } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white/20 shadow-md">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-white drop-shadow-lg">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Tony Stark"
                className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                  errors.name ? 'border-2 border-red-400' : 'border border-transparent'
                }`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters long',
                  },
                  maxLength: {
                    value: 60,
                    message: 'Name must not exceed 60 characters',
                  },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-200">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                  errors.email ? 'border-2 border-red-400' : 'border border-transparent'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-200">{errors.email.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-white mb-1">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="House No, Lane, Locality, City, ZIP, Country"
                className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                  errors.address ? 'border-2 border-red-400' : 'border border-transparent'
                }`}
                {...register('address', {
                  required: 'Address is required',
                  maxLength: {
                    value: 400,
                    message: 'Address must not exceed 400 characters',
                  },
                })}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-200">{errors.address.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition ${
                    errors.password ? 'border-2 border-red-400' : 'border border-transparent'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
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
                  className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-200 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-200 hover:text-white" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-200">{errors.password.message}</p>
              )}
              <div className="mt-2 text-xs text-gray-200">
                Password requirements:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>8–16 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one special character</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-6 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
