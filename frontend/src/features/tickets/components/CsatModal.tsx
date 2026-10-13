import React, { useState } from 'react';
import { X, Star, Send, AlertCircle } from 'lucide-react';
import { useRateSatisfaction } from '../hooks/useTickets';
import type { Ticket } from '../types';

interface CsatModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Péssimo / Muito Insatisfeito',
  2: 'Ruim / Insatisfeito',
  3: 'Regular / Neutro',
  4: 'Bom / Satisfeito',
  5: 'Excelente / Muito Satisfeito',
};

export const CsatModal: React.FC<CsatModalProps> = ({ ticket, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rateMutation = useRateSatisfaction();

  if (!ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    rateMutation.mutate(
      {
        ticketId: ticket.id,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          setErrorMsg('Falha ao registrar avaliação. Tente novamente.');
        },
      }
    );
  };

  const activeRating = hoverRating ?? rating;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
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
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Avaliar Atendimento (CSAT)
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              Chamado {ticket.code} — {ticket.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Star Rating Selector */}
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Como você avalia a solução e a presteza do atendimento?
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= activeRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    aria-label={`Avaliar ${starValue} estrelas`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'transform 0.1s ease',
                      transform: hoverRating === starValue ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={32}
                      style={{
                        color: isFilled ? '#f59e0b' : 'var(--border-subtle)',
                        fill: isFilled ? '#f59e0b' : 'transparent',
                        transition: 'color 0.15s ease, fill 0.15s ease',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', minHeight: '1.25rem' }}>
              {RATING_LABELS[activeRating]}
            </p>
          </div>

          {/* Feedback Comment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Comentário adicional (Opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Conte-nos o que achou da agilidade, clareza e solução técnica..."
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Footer Ações */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={rateMutation.isPending}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rateMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1.25rem',
                backgroundColor: 'var(--primary-500)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: rateMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={14} />
              <span>{rateMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
