import React from 'react';
import { Link } from 'react-router-dom';
import type { RecentTicket } from '../types';

interface RecentTicketsListProps {
  data: RecentTicket[];
}

export const RecentTicketsList: React.FC<RecentTicketsListProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
        }}
      >
        Nenhum chamado recente encontrado no período.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {data.map((ticket) => {
        const createdDate = new Date(ticket.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Link
            key={ticket.id}
            to="/tickets"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary-400)',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {ticket.code}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ticket.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                <span>Solicitante: <strong>{ticket.requester_name}</strong></span>
                <span>•</span>
                <span>Atendente: <strong>{ticket.assigned_name || 'Não atribuído'}</strong></span>
                <span>•</span>
                <span>{createdDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: ticket.status_color,
                  backgroundColor: `${ticket.status_color}18`,
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {ticket.status_label}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: ticket.priority_color,
                  backgroundColor: `${ticket.priority_color}18`,
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {ticket.priority_name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
