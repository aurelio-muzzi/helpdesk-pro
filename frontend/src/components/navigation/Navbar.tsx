import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTickets } from '@/features/tickets/hooks/useTickets';

const formatRelativeTime = (dateStr: string) => {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays}d`;
  } catch {
    return '';
  }
};

export const Navbar: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { theme, toggleTheme } = useThemeStore();
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const { user, logout, isLoggingOut } = useAuth();

  const isStaff = Boolean(user?.role?.name && ['admin', 'manager', 'agent'].includes(user.role.name));

  // Para administradores, gerentes e agentes, busca chamados em aberto para monitoramento contínuo
  const { data: tickets } = useTickets({ status: 'open' }, { enabled: isStaff });
  const openTickets = (tickets || []).filter((t) => t.status.value === 'open');
  const openCount = openTickets.length;

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const handleTicketClick = () => {
    setIsNotificationsOpen(false);
    navigate('/tickets');
  };

  return (
    <header
      className="app-navbar"
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          className="mobile-nav-toggle"
          onClick={toggleMobile}
          aria-label="Abrir menu"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            minHeight: '40px',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Menu size={22} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            minHeight: '40px',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            transition: 'var(--transition-fast)',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificações de Chamados em Aberto — Visível exclusivamente para Staff (Admin, Gerente, Agente) */}
        {isStaff && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="Notificações de chamados"
              title="Chamados aguardando atendimento"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isNotificationsOpen ? 'var(--bg-card-hover)' : 'var(--bg-muted)',
                color: openCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Bell size={18} />
              {openCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 5px',
                    minWidth: '16px',
                    textAlign: 'center',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {openCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: 'min(360px, calc(100vw - 2rem))',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 50,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ color: openCount > 0 ? '#ef4444' : '#10b981' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Chamados em Aberto ({openCount})
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: openCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: openCount > 0 ? '#ef4444' : '#10b981',
                      border: openCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {openCount > 0 ? 'Triagem Pendente' : 'Em Dia'}
                  </span>
                </div>

                {/* List Body */}
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {openCount === 0 ? (
                    <div
                      style={{
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Tudo em ordem!
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Não há chamados aguardando primeiro atendimento no momento.
                      </p>
                    </div>
                  ) : (
                    openTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={handleTicketClick}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-400)' }}>
                            {ticket.code}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: `${ticket.priority.color}20`,
                              color: ticket.priority.color,
                            }}
                          >
                            {ticket.priority.display_name}
                          </span>
                        </div>

                        <p
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ticket.title}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.7188rem',
                            color: 'var(--text-secondary)',
                            marginTop: '2px',
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                            Por: <strong>{ticket.requester.name}</strong>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                            <Clock size={11} />
                            {formatRelativeTime(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Action */}
                <div
                  style={{
                    padding: '0.625rem 1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    textAlign: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleTicketClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-400)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Ver Central de Chamados
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} className="user-info-text">
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
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
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
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
