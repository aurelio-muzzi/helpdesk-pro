import React from 'react';
import {
  X,
  UserCheck,
  ArrowRightLeft,
  Star,
  RotateCcw,
} from 'lucide-react';
import { SatisfactionBadge } from './SatisfactionBadge';
import { TicketTimeline } from './TicketTimeline';
import type { Ticket } from '../types';
import type { User } from '@/features/auth/types';

export interface TicketDetailDrawerProps {
  ticket: Ticket;
  onClose: () => void;
  isStaff: boolean;
  currentUser?: User | null;
  onAssignToMe?: (ticket: Ticket) => void;
  isAssigning?: boolean;
  onTransfer?: (ticket: Ticket) => void;
  onRate?: (ticket: Ticket) => void;
  onReopen?: (ticket: Ticket) => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticket,
  onClose,
  isStaff,
  currentUser,
  onAssignToMe,
  isAssigning = false,
  onTransfer,
  onRate,
  onReopen,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="ticket-drawer-container"
        style={{
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--primary-400)',
                fontWeight: 600,
              }}
            >
              {ticket.code}
            </span>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '4px',
              }}
            >
              {ticket.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: `${ticket.status.color}20`,
              color: ticket.status.color,
            }}
          >
            {ticket.status.label}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: `${ticket.priority.color}22`,
              color: ticket.priority.color,
            }}
          >
            {ticket.priority.display_name}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
            }}
          >
            {ticket.category.name}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h5
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            DESCRIÇÃO
          </h5>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {ticket.description}
          </p>
        </div>

        {/* Solicitante & Atendente */}
        <div className="form-grid-2col">
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              padding: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Solicitante</span>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {ticket.requester.name}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {ticket.requester.email}
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              padding: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Responsável</span>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {ticket.assigned_to?.name ?? 'Não atribuído'}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {ticket.assigned_to?.email ?? '—'}
            </span>

            {isStaff && !ticket.status.is_final && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.625rem',
                  flexWrap: 'wrap',
                }}
              >
                {ticket.assigned_to?.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => onAssignToMe?.(ticket)}
                    disabled={isAssigning}
                    title="Assumir este chamado para você"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      color: '#60a5fa',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <UserCheck size={13} /> Assumir Atendimento
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onTransfer?.(ticket)}
                  title="Transferir ou reatribuir para outro membro da equipe"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#a78bfa',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ArrowRightLeft size={13} /> Transferir...
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avaliação CSAT no drawer se houver */}
        {ticket.satisfaction && (
          <div
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                Avaliação do Cliente
              </span>
              <SatisfactionBadge satisfaction={ticket.satisfaction} />
            </div>
            {ticket.satisfaction.comment && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  marginTop: '0.25rem',
                }}
              >
                "{ticket.satisfaction.comment}"
              </p>
            )}
          </div>
        )}

        {/* Ações adicionais no drawer (Avaliar / Reabrir) */}
        {(ticket.status.value === 'resolved' || ticket.status.value === 'closed') && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!ticket.satisfaction &&
              (currentUser?.id === ticket.requester.id || currentUser?.role?.name === 'admin') && (
                <button
                  onClick={() => onRate?.(ticket)}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    color: '#eab308',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <Star size={16} /> Avaliar Atendimento (CSAT)
                </button>
              )}
            {ticket.status.value === 'resolved' &&
              (currentUser?.id === ticket.requester.id || currentUser?.role?.name === 'admin') && (
                <button
                  onClick={() => onReopen?.(ticket)}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    color: '#fb923c',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={16} /> Reabrir Chamado
                </button>
              )}
          </div>
        )}

        {/* Linha do Tempo e Interações */}
        <TicketTimeline ticket={ticket} />
      </div>
    </div>
  );
};
