import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Plus,
  Lock,
  Layers,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useArticles, useDeleteArticle } from '../hooks/useKnowledgeBase';
import { useCategories } from '@/features/teams/hooks/useOrganizational';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleReaderModal } from '../components/ArticleReaderModal';
import { ArticleFormModal } from '../components/ArticleFormModal';
import { ConfirmDeleteModal } from '@/components/feedback/ConfirmDeleteModal';
import type { KnowledgeArticle } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showInternalOnly, setShowInternalOnly] = useState<boolean>(false);

  // Modais
  const [readingArticle, setReadingArticle] = useState<KnowledgeArticle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<KnowledgeArticle | null>(null);

  const { user } = useAuth();
  const isStaff = user?.role?.name === 'admin' || user?.role?.name === 'manager' || user?.role?.name === 'agent';

  const { data: categories } = useCategories();
  const { data: articles, isLoading, isError, refetch } = useArticles({
    search: searchTerm || undefined,
    category_id: selectedCategory || undefined,
    is_internal: showInternalOnly ? true : undefined,
  });

  const deleteMutation = useDeleteArticle();

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleDelete = (article: KnowledgeArticle) => {
    setDeletingArticle(article);
  };

  const handleConfirmDelete = () => {
    if (!deletingArticle) return;
    deleteMutation.mutate(deletingArticle.id, {
      onSuccess: () => {
        setDeletingArticle(null);
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Hero Banner de Pesquisa e Autoatendimento */}
      <div className="kb-hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Sparkles size={16} />
          <span>Central de Ajuda & Autoatendimento</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.375rem, 4vw, 2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: '640px', lineHeight: 1.25 }}>
          Como podemos ajudar você hoje?
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.5 }}>
          Pesquise soluções rápidas, procedimentos de suporte, configurações de rede e guias de autoatendimento.
        </p>

        {/* Input de Busca Grande */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            marginTop: '0.5rem',
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite palavras-chave (ex: VPN, senha, impressora, ERP)..."
            style={{
              width: '100%',
              height: '48px',
              minHeight: '48px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '0 1.25rem 0 3rem',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              boxShadow: 'var(--shadow-sm)',
              boxSizing: 'border-box',
            }}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1.125rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                minHeight: '36px',
                padding: '0 4px',
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Barra de Ações Superior (Alinhamento e Ações) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Layers size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Categorias de Conhecimento
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {articles?.length ?? 0} {articles?.length === 1 ? 'artigo' : 'artigos'}
          </span>
        </div>

        {/* Ações da Direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {isStaff && (
            <button
              type="button"
              onClick={() => setShowInternalOnly(!showInternalOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: showInternalOnly ? 'rgba(192, 132, 252, 0.15)' : 'var(--bg-card)',
                color: showInternalOnly ? '#c084fc' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Lock size={13} />
              <span>Apenas Internos</span>
            </button>
          )}

          {isStaff && (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-600)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={15} />
              <span>Novo Artigo</span>
            </button>
          )}
        </div>
      </div>

      {/* Container de Chips de Categorias sem barra de rolagem */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            border: selectedCategory === null ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
            backgroundColor: selectedCategory === null ? 'var(--primary-500)' : 'var(--bg-surface)',
            color: selectedCategory === null ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            minHeight: '38px',
          }}
        >
          <Layers size={13} />
          <span>Todos os Artigos</span>
        </button>

        {categories?.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'var(--primary-500)' : 'var(--bg-surface)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: '38px',
              }}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Estados de Carregamento e Erro */}
      {isLoading && (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <BookOpen size={28} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-500)' }} />
          <p style={{ fontWeight: 600 }}>Carregando artigos da base de conhecimento...</p>
        </div>
      )}

      {isError && (
        <div
          style={{
            padding: '2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 600 }}>Falha ao carregar artigos da base de conhecimento.</p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              marginTop: '0.75rem',
              padding: '0.375rem 0.875rem',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Grid de Artigos */}
      {!isLoading && !isError && articles && (
        <>
          {articles.length === 0 ? (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <HelpCircle size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Nenhum artigo encontrado
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {searchTerm
                  ? `Nenhum resultado correspondente a "${searchTerm}". Tente outros termos.`
                  : 'Nenhum artigo cadastrado nesta categoria até o momento.'}
              </p>
            </div>
          ) : (
            <div className="kb-articles-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onRead={(art) => setReadingArticle(art)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canManage={isStaff}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Leitor de Artigo */}
      <ArticleReaderModal
        article={readingArticle}
        onClose={() => setReadingArticle(null)}
      />

      {/* Modal Criar / Editar Artigo */}
      <ArticleFormModal
        isOpen={isFormOpen}
        article={editingArticle}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Modal Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!deletingArticle}
        itemName={deletingArticle?.title}
        itemType="o artigo"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingArticle(null)}
      />
    </div>
  );
};

export default KnowledgeBasePage;
