import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useCreateArticle, useUpdateArticle } from '../hooks/useKnowledgeBase';
import { useCategories } from '@/features/teams/hooks/useOrganizational';
import type { KnowledgeArticle, CreateArticlePayload } from '../types';

interface ArticleFormDialogProps {
  article?: KnowledgeArticle | null;
  onClose: () => void;
}

const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({ article, onClose }) => {
  const [title, setTitle] = useState(article?.title ?? '');
  const [categoryId, setCategoryId] = useState(article?.category_id ? String(article.category_id) : '');
  const [summary, setSummary] = useState(article?.summary ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [isInternal, setIsInternal] = useState(article?.is_internal ?? false);
  const [isPublished, setIsPublished] = useState(article?.is_published ?? true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Título e Conteúdo são obrigatórios.');
      return;
    }

    const payload: CreateArticlePayload = {
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      category_id: categoryId ? Number(categoryId) : null,
      is_internal: isInternal,
      is_published: isPublished,
    };

    if (article) {
      updateMutation.mutate(
        { id: article.id, payload },
        {
          onSuccess: () => onClose(),
          onError: () => setErrorMsg('Falha ao atualizar o artigo.'),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
        onError: () => setErrorMsg('Falha ao criar o artigo.'),
      });
    }
  };

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
          maxWidth: '700px',
          maxHeight: '90vh',
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
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {article ? 'Editar Artigo da Base' : 'Novo Artigo de Conhecimento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

            {/* Título */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Título do Artigo *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como configurar acesso à VPN corporativa"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 0.875rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Categoria */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Categoria de Serviço
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 0.875rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Selecione uma categoria (Opcional)</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resumo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Resumo Curto
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Breve descrição exibida no catálogo de pesquisa..."
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 0.875rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Conteúdo / Passo a Passo *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Descreva o procedimento técnico ou FAQ passo a passo..."
                required
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.875rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Checkboxes de Visibilidade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
                <span><strong>Procedimento Interno:</strong> Visível apenas para agentes e administradores (oculto para solicitantes).</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
                <span><strong>Artigo Publicado:</strong> Disponível imediatamente no catálogo de pesquisa.</span>
              </label>
            </div>
          </div>

          {/* Footer Ações */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--bg-muted)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
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
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Salvando...' : article ? 'Salvar Alterações' : 'Criar Artigo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ArticleFormModalProps {
  isOpen: boolean;
  article?: KnowledgeArticle | null;
  onClose: () => void;
}

export const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  isOpen,
  article,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ArticleFormDialog
      key={article ? `edit-${article.id}` : 'create'}
      article={article}
      onClose={onClose}
    />
  );
};
