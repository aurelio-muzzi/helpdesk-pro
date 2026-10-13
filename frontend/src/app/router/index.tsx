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
                <DashboardPage />
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
              <Suspense fallback={<PageSkeleton />}>
                <TeamsPage />
              </Suspense>
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
