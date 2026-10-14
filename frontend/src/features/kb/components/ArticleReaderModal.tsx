import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Eye, Clock, User as UserIcon, Lock, CheckCircle2 } from 'lucide-react';
import { useArticleFeedback } from '../hooks/useKnowledgeBase';
import type { KnowledgeArticle } from '../types';

interface ArticleReaderModalProps {
  article: KnowledgeArticle | null;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({ article, onClose }) => {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  const feedbackMutation = useArticleFeedback();

  if (!article) return null;

  const handleVote = (isHelpful: boolean) => {
    if (voted !== null || feedbackMutation.isPending) return;
    feedbackMutation.mutate(
      { id: article.id, isHelpful },
      {
        onSuccess: () => {
          setVoted(isHelpful ? 'yes' : 'no');
        },
      }
    );
  };

  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header do Leitor */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--primary-400)',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {article.category ? article.category.name : 'Geral'}
              </span>

              {article.is_internal && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#c084fc',
                    backgroundColor: 'rgba(192, 132, 252, 0.12)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Lock size={12} /> Procedimento Interno
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {article.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <UserIcon size={12} /> {article.author.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {formattedDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Eye size={12} /> {article.views_count} visualizações
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
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Artigo com Scroll */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}
        >
          {article.content}
        </div>

        {/* Footer com Feedback ("Este artigo foi útil?") */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: 'var(--bg-muted)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Este artigo foi útil?
            </span>
            {voted && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Obrigado pelo feedback!
              </span>
            )}
          </div>

          {!voted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleVote(true)}
                disabled={feedbackMutation.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  minHeight: '38px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ThumbsUp size={14} style={{ color: 'var(--success)' }} />
                <span>Sim ({article.helpful_count})</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote(false)}
                disabled={feedbackMutation.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  minHeight: '38px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ThumbsDown size={14} style={{ color: 'var(--danger)' }} />
                <span>Não ({article.not_helpful_count})</span>
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {article.helpful_count + (voted === 'yes' ? 1 : 0)} de{' '}
              {article.helpful_count + article.not_helpful_count + 1} pessoas acharam este artigo útil.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
