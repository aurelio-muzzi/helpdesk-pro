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
import type { KnowledgeArticle } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showInternalOnly, setShowInternalOnly] = useState<boolean>(false);

  // Modais
  const [readingArticle, setReadingArticle] = useState<KnowledgeArticle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);

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
    if (window.confirm(`Deseja realmente remover o artigo "${article.title}"?`)) {
      deleteMutation.mutate(article.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Hero Banner de Pesquisa e Autoatendimento */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Sparkles size={16} />
          <span>Central de Ajuda & Autoatendimento</span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: '640px', lineHeight: 1.25 }}>
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
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '0 1.25rem 0 3rem',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              boxShadow: 'var(--shadow-sm)',
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
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Filtros por Categoria e Botão Novo Artigo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Pills de Categoria */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === null ? 'var(--primary-500)' : 'var(--bg-card)',
              color: selectedCategory === null ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
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
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--primary-500)' : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Ações da Direita: Filtro Interno (se Staff) e Botão Criar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isStaff && (
            <button
              type="button"
              onClick={() => setShowInternalOnly(!showInternalOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: showInternalOnly ? 'rgba(192, 132, 252, 0.15)' : 'var(--bg-card)',
                color: showInternalOnly ? '#c084fc' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
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
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-500)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={15} />
              <span>Novo Artigo</span>
            </button>
          )}
        </div>
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
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
    </div>
  );
};

export default KnowledgeBasePage;
