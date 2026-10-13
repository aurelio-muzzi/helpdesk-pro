import React from 'react';
import { Menu, Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleMobile}
          aria-label="Abrir menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--primary-500)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            v1.0
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            transition: 'var(--transition-fast)',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          aria-label="Notificações"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-500)',
            }}
          />
        </button>

        {/* User Profile & Logout */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingLeft: '0.5rem',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-500)',
                }}
              >
                <UserIcon size={16} />
              </div>
              <div style={{ display: 'none', flexDirection: 'column', gap: '2px' }} className="user-info-text">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--primary-500)',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role?.display_name || user.role?.name}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              aria-label="Sair do sistema"
              title="Sair do sistema"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
