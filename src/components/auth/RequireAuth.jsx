import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { resolveAuthUser } from '../../utils/userDisplay';
import { hasPermission, normalizeRole } from '../../utils/permissions';

const RequireAuth = ({ children, allowedRoles, requiredPermission }) => {
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
    return (
      <Navigate
        to="/signup"
        replace
        state={{
          from: location,
          registerRequired: true,
          accessMessage: 'Create your account to access the dashboard and business tools.'
        }}
      />
    );
  }

  const normalizedRole = normalizeRole(authUser?.role);

  if (allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));
    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      const fallback = normalizedRole === 'super_admin' ? '/super-admin' : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  if (requiredPermission && !hasPermission(authUser, requiredPermission.domain, requiredPermission.action)) {
    const fallback = normalizedRole === 'super_admin' ? '/super-admin' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RequireAuth;
