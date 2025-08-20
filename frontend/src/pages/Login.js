import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Store } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            New here?{' '}
            <Link
              to="/register"
              className="font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition ${
                  errors.email ? 'border-2 border-red-400' : 'border border-transparent'
                }`}
                placeholder="you@example.com"
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-200 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition ${
                    errors.password ? 'border-2 border-red-400' : 'border border-transparent'
                  }`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
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
            </div>
          </div>

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-6 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
