import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Stores from './pages/Stores';
import StoreDetail from './pages/StoreDetail';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import StoreOwnerDashboard from './pages/store-owner/Dashboard';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/stores" replace />} />
        <Route path="stores" element={<Stores />} />
        <Route path="stores/:id" element={<StoreDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <PrivateRoute allowedRoles={['system_admin']}>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stores" element={<AdminStores />} />
      </Route>

      {/* Store owner routes */}
      <Route path="/store-owner" element={
        <PrivateRoute allowedRoles={['store_owner']}>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<StoreOwnerDashboard />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 