import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <PageSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role.name)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
          403 — Acesso Restrito
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '420px' }}>
          Seu perfil de usuário ({user.role.display_name}) não possui permissão para visualizar esta página.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
