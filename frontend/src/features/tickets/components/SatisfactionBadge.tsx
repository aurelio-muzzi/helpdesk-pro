import React from 'react';
import { Star } from 'lucide-react';
import type { TicketSatisfactionInfo } from '../types';

interface SatisfactionBadgeProps {
  satisfaction?: TicketSatisfactionInfo | null;
}

export const SatisfactionBadge: React.FC<SatisfactionBadgeProps> = ({ satisfaction }) => {
  if (!satisfaction) return null;

  return (
    <div
      title={satisfaction.comment ? `Comentário: "${satisfaction.comment}"` : `Avaliação: ${satisfaction.rating}/5`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.2rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'default',
      }}
    >
      <Star size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
      <span>{satisfaction.rating}/5</span>
    </div>
  );
};
