import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Sidebar } from '@/components/navigation/Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Sidebar />
      <div className="app-main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Navbar />
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
