import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, Settings, X, ShieldAlert, BookOpen, ShieldCheck } from 'lucide-react';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BrandIcon } from '@/components/common/BrandIcon';

import type { UserRole } from '@/features/auth/types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  roles?: UserRole[];
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'agent'] },
  { name: 'Chamados', path: '/tickets', icon: Ticket },
  { name: 'Base de Conhecimento', path: '/kb', icon: BookOpen },
  { name: 'Equipes & Usuários', path: '/teams', icon: Users, roles: ['admin', 'manager'] },
  { name: 'Políticas de SLA', path: '/sla', icon: ShieldAlert, roles: ['admin', 'manager'] },
  { name: 'Auditoria & Logs', path: '/audit', icon: ShieldCheck, roles: ['admin'] },
  { name: 'Configurações', path: '/settings', icon: Settings, roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const { isMobileOpen, closeMobile } = useSidebarStore();
  const { user } = useAuth();

  const userRole = user?.role?.name;
  const visibleItems = navigationItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <>
      {/* Backdrop Mobile */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
        }}
        className="app-sidebar"
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BrandIcon size={26} />
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HelpDesk Pro
            </span>
          </div>
          <button
            className="mobile-sidebar-close"
            onClick={closeMobile}
            aria-label="Fechar menu"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                  transition: 'var(--transition-fast)',
                })}
              >
                <Icon size={18} style={{ color: 'var(--primary-500)' }} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Rodapé com Perfil do Usuário Ativo */}
        {user && (
          <div
            style={{
              marginTop: 'auto',
              padding: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Nível de Acesso
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor:
                    user.role?.name === 'admin'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : user.role?.name === 'manager'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : user.role?.name === 'agent'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                  color:
                    user.role?.name === 'admin'
                      ? '#ef4444'
                      : user.role?.name === 'manager'
                        ? '#3b82f6'
                        : user.role?.name === 'agent'
                          ? '#10b981'
                          : '#f59e0b',
                }}
              >
                {user.role?.display_name || user.role?.name}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
