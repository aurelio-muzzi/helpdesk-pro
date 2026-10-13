import React, { useState } from 'react';
import {
  Users,
  Building2,
  FolderTree,
  Flame,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react';
import {
  useDepartments,
  useTeams,
  useCategories,
  usePriorities,
} from '../hooks/useOrganizational';

type ActiveTab = 'teams' | 'departments' | 'categories' | 'priorities';

export const TeamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('teams');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: priorities, isLoading: loadingPrios } = usePriorities();

  const filteredTeams = (teams || []).filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = (departments || []).filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCategories = (categories || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.department?.name && c.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPriorities = (priorities || []).filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingDepts || loadingTeams || loadingCats || loadingPrios;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Estrutura Organizacional
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Gerenciamento de departamentos, equipes de atendimento, categorias de chamados e níveis de prioridade.
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
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Plus size={16} />
          {activeTab === 'teams' && 'Nova Equipe'}
          {activeTab === 'departments' && 'Novo Departamento'}
          {activeTab === 'categories' && 'Nova Categoria'}
          {activeTab === 'priorities' && 'Nova Prioridade'}
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Equipes Ativas
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {teams?.length ?? 0}
            </h3>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Departamentos
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {departments?.length ?? 0}
            </h3>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
            }}
          >
            <FolderTree size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Categorias
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {categories?.length ?? 0}
            </h3>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
            }}
          >
            <Flame size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Prioridades SLA
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {priorities?.length ?? 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('teams')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'teams' ? '1px solid var(--primary-500)' : '1px solid transparent',
              backgroundColor: activeTab === 'teams' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'teams' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Users size={16} />
            Equipes ({teams?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'departments' ? '1px solid var(--primary-500)' : '1px solid transparent',
              backgroundColor: activeTab === 'departments' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'departments' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Building2 size={16} />
            Departamentos ({departments?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'categories' ? '1px solid var(--primary-500)' : '1px solid transparent',
              backgroundColor: activeTab === 'categories' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'categories' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <FolderTree size={16} />
            Categorias ({categories?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('priorities')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'priorities' ? '1px solid var(--primary-500)' : '1px solid transparent',
              backgroundColor: activeTab === 'priorities' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'priorities' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Flame size={16} />
            Prioridades ({priorities?.length ?? 0})
          </button>
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.75rem',
            minWidth: '240px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filtrar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Carregando registros da estrutura organizacional...
        </div>
      ) : (
        <>
          {/* TAB 1: TEAMS */}
          {activeTab === 'teams' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredTeams.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Nenhuma equipe encontrada.
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {team.name}
                        </h4>
                        {team.department && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '0.25rem',
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#60a5fa',
                              fontWeight: 500,
                            }}
                          >
                            {team.department.name}
                          </span>
                        )}
                      </div>
                      {team.is_active ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                          <CheckCircle2 size={14} /> Ativa
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444' }}>
                          <XCircle size={14} /> Inativa
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>
                      {team.description || 'Sem descrição cadastrada.'}
                    </p>

                    <div
                      style={{
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <UserCheck size={16} style={{ color: 'var(--primary-400)' }} />
                        {team.members?.length ?? 0} membros
                      </span>
                      <button
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--primary-400)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NOME</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DESCRIÇÃO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EQUIPES VINCULADAS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhum departamento cadastrado.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {dept.name}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {dept.description || '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {dept.teams_count ?? 0}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: dept.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: dept.is_active ? '#10b981' : '#ef4444',
                              fontWeight: 600,
                            }}
                          >
                            {dept.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NOME</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SLUG IDENTIFICADOR</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEPARTAMENTO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhuma categoria cadastrada.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cat.name}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--primary-400)' }}>
                          {cat.slug}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {cat.department?.name || 'Geral (Todos)'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: cat.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: cat.is_active ? '#10b981' : '#ef4444',
                              fontWeight: 600,
                            }}
                          >
                            {cat.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: PRIORITIES */}
          {activeTab === 'priorities' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredPriorities.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Nenhuma prioridade cadastrada.
                </div>
              ) : (
                filteredPriorities.map((prio) => (
                  <div
                    key={prio.id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      borderLeft: `4px solid ${prio.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: `${prio.color}22`,
                          color: prio.color,
                        }}
                      >
                        {prio.display_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Nível {prio.order}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {prio.name.toUpperCase()}
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {prio.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamsPage;
