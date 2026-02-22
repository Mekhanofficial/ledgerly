import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { resolveAuthUser } from '../../utils/userDisplay';

const RequireAuth = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth || {});
  const authUser = resolveAuthUser(user);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    const fallback = authUser.role === 'super_admin' ? '/super-admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RequireAuth;
