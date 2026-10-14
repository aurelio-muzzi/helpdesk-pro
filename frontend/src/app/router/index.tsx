import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Code-Splitting e Lazy Loading das rotas
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TicketsPage = lazy(() => import('@/features/tickets/pages/TicketsPage'));
const TeamsPage = lazy(() => import('@/features/teams/pages/TeamsPage'));
const SlaPoliciesPage = lazy(() => import('@/features/sla/pages/SlaPoliciesPage'));
const KnowledgeBasePage = lazy(() => import('@/features/kb/pages/KnowledgeBasePage'));
const AuditLogsPage = lazy(() => import('@/features/audit/pages/AuditLogsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

import { useAuth } from '@/features/auth/hooks/useAuth';

// Rota inteligente para Dashboard (solicitantes são direcionados diretamente a Chamados)
const DashboardRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role?.name === 'requester') {
    return <Navigate to="/tickets" replace />;
  }
  return <DashboardPage />;
};

const router = createBrowserRouter([
  // Rotas Públicas
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },

  // Rotas Protegidas por Autenticação
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <DashboardRoute />
              </Suspense>
            ),
          },
          {
            path: 'tickets',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <TicketsPage />
              </Suspense>
            ),
          },
          {
            path: 'teams',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Suspense fallback={<PageSkeleton />}>
                  <TeamsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'sla',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Suspense fallback={<PageSkeleton />}>
                  <SlaPoliciesPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'kb',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <KnowledgeBasePage />
              </Suspense>
            ),
          },
          {
            path: 'audit',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<PageSkeleton />}>
                  <AuditLogsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<PageSkeleton />}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
