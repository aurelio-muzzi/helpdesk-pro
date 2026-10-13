import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TicketsPage = lazy(() => import('@/features/tickets/pages/TicketsPage'));

const router = createBrowserRouter([
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
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
