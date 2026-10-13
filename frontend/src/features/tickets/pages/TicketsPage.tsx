import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

export const TicketsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Central de Chamados
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Gerenciamento, priorização e atendimento de solicitações de suporte.
          </p>
        </div>

        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-600)',
            color: '#ffffff',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Plus size={16} />
          Novo Chamado
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            flex: '1 1 240px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por ID, título ou solicitante..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Placeholder / Empty State for Foundation */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Módulo de Chamados Pronto para a Etapa 4
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '480px', marginInline: 'auto' }}>
          A fundação de rotas, layouts, tokens e requisições foi estabelecida com sucesso. A persistência dos tickets será integrada nas próximas etapas.
        </p>
      </div>
    </div>
  );
};

export default TicketsPage;
