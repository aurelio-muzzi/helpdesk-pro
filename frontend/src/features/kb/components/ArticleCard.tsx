import React from 'react';
import { Eye, ThumbsUp, Lock, Clock, Edit2, Trash2, ArrowRight } from 'lucide-react';
import type { KnowledgeArticle } from '../types';

interface ArticleCardProps {
  article: KnowledgeArticle;
  onRead: (article: KnowledgeArticle) => void;
  onEdit?: (article: KnowledgeArticle) => void;
  onDelete?: (article: KnowledgeArticle) => void;
  canManage?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onRead,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div>
        {/* Badges superiores: Categoria e Flags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {article.is_internal && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#c084fc',
                  backgroundColor: 'rgba(192, 132, 252, 0.12)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Lock size={11} /> Interno
              </span>
            )}
            {!article.is_published && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--warning)',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Rascunho
              </span>
            )}
          </div>
        </div>

        {/* Título do Artigo */}
        <h3
          onClick={() => onRead(article)}
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            lineHeight: 1.4,
            marginBottom: '0.5rem',
          }}
        >
          {article.title}
        </h3>

        {/* Resumo */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.summary || article.content.substring(0, 140) + '...'}
        </p>
      </div>

      {/* Footer do Card com Metadados e Ações */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.875rem',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Eye size={13} /> {article.views_count}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
            <ThumbsUp size={13} /> {article.helpful_count}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} /> {formattedDate}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {canManage && (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(article)}
                  title="Editar artigo"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(article)}
                  title="Excluir artigo"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => onRead(article)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--primary-400)',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.25rem 0.375rem',
            }}
          >
            <span>Ler</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
