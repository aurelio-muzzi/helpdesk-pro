import React from 'react';
import { X, Shield, Terminal, User, Clock, Globe } from 'lucide-react';
import type { AuditLog } from '../types';

interface AuditDetailsModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Detalhes do Registro de Auditoria
              </h2>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-400)' }}>
                Evento #{log.id} — {log.event}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              minWidth: '38px',
              minHeight: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Descrição */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DESCRIÇÃO DA AÇÃO
            </span>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontWeight: 500 }}>
              {log.description}
            </p>
          </div>

          {/* Metadados Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.875rem',
            }}
          >
            {/* Usuário Responsável */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <User size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Usuário</span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {log.user ? log.user.name : 'Sistema / Anônimo'}
              </p>
              {log.user && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {log.user.email} ({log.user.role})
                </span>
              )}
            </div>

            {/* Data e Hora */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <Clock size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Data / Horário</span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(log.created_at).toISOString()}
              </span>
            </div>

            {/* Endereço IP */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <Globe size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Endereço IP</span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {log.ip_address ?? 'Não registrado'}
              </p>
            </div>
          </div>

          {/* User Agent */}
          {log.user_agent && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <Terminal size={14} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>User-Agent (Navegador / Cliente)</span>
              </div>
              <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {log.user_agent}
              </p>
            </div>
          )}

          {/* Diff de Valores: Anteriores vs Novos */}
          {(log.old_values || log.new_values) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', display: 'block', marginBottom: '0.25rem' }}>
                  Valores Anteriores (Before)
                </span>
                <pre
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    overflowX: 'auto',
                    margin: 0,
                  }}
                >
                  {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'null'}
                </pre>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '0.25rem' }}>
                  Novos Valores (After)
                </span>
                <pre
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    overflowX: 'auto',
                    margin: 0,
                  }}
                >
                  {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'null'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              minHeight: '40px',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
