import React, { useState } from 'react';
import {
  Users,
  Building2,
  FolderTree,
  Flame,
  Plus,
  CheckCircle2,
  XCircle,
  UserCheck,
  Shield,
  Edit2,
  Settings2,
  Trash2,
} from 'lucide-react';
import { SearchInput } from '@/components/common/FilterBar';
import { KpiCard } from '@/components/common/KpiCard';
import {
  useDepartments,
  useTeams,
  useCategories,
  usePriorities,
  useUsers,
  useDeleteCategory,
} from '../hooks/useOrganizational';
import { UserFormModal } from '../components/UserFormModal';
import { TeamFormModal } from '../components/TeamFormModal';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { ManageTeamMembersModal } from '../components/ManageTeamMembersModal';
import { ConfirmDeleteModal } from '@/components/feedback/ConfirmDeleteModal';
import type { Team, UserItem, Category } from '../types';

type ActiveTab = 'teams' | 'users' | 'departments' | 'categories' | 'priorities';

export const TeamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('teams');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const deleteCategoryMutation = useDeleteCategory();

  // Queries
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: priorities, isLoading: loadingPrios } = usePriorities();
  const { data: users, isLoading: loadingUsers } = useUsers();

  const filteredTeams = (teams || []).filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = (users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role?.display_name && u.role.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDepartments = (departments || []).filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCategories = (categories || []).filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.department?.name && c.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPriorities = (priorities || []).filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingDepts || loadingTeams || loadingCats || loadingPrios || loadingUsers;

  const handleOpenCreateModal = () => {
    if (activeTab === 'users') {
      setUserToEdit(null);
      setIsUserModalOpen(true);
    } else if (activeTab === 'categories') {
      setCategoryToEdit(null);
      setIsCategoryModalOpen(true);
    } else {
      setTeamToEdit(null);
      setIsTeamModalOpen(true);
    }
  };

  const getRoleBadgeStyle = (roleName?: string) => {
    switch (roleName) {
      case 'admin':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          label: 'Administrador',
        };
      case 'manager':
        return {
          bg: 'rgba(139, 92, 246, 0.1)',
          color: '#a855f7',
          label: 'Gerente',
        };
      case 'agent':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          label: 'Agente de Suporte',
        };
      case 'requester':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          label: 'Solicitante (Empresa)',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Estrutura Organizacional
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Gerenciamento de equipes de atendimento, usuários (membros e solicitantes), departamentos, categorias e SLA.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeTab === 'users' ? (
            <button
              onClick={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
              }}
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
              Novo Usuário
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
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
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <KpiCard
          icon={<Users size={24} />}
          label="Equipes Ativas"
          value={teams?.length ?? 0}
          variant="blue"
        />
        <KpiCard
          icon={<UserCheck size={24} />}
          label="Usuários Registrados"
          value={users?.length ?? 0}
          variant="purple"
        />
        <KpiCard
          icon={<Building2 size={24} />}
          label="Departamentos"
          value={departments?.length ?? 0}
          variant="emerald"
        />
        <KpiCard
          icon={<FolderTree size={24} />}
          label="Categorias"
          value={categories?.length ?? 0}
          variant="amber"
        />
        <KpiCard
          icon={<Flame size={24} />}
          label="Prioridades SLA"
          value={priorities?.length ?? 0}
          variant="rose"
        />
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
        <div className="admin-tabs-nav" style={{ flex: '1 1 auto', borderBottom: 'none', paddingBottom: 0 }}>
          <button
            onClick={() => setActiveTab('teams')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              minHeight: '40px',
              whiteSpace: 'nowrap',
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
            onClick={() => setActiveTab('users')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              minHeight: '40px',
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'users' ? '1px solid var(--primary-500)' : '1px solid transparent',
              backgroundColor: activeTab === 'users' ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <UserCheck size={16} />
            Usuários ({users?.length ?? 0})
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              minHeight: '40px',
              whiteSpace: 'nowrap',
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
              minHeight: '40px',
              whiteSpace: 'nowrap',
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
              minHeight: '40px',
              whiteSpace: 'nowrap',
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
        <SearchInput
          placeholder="Filtrar registros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerStyle={{ minWidth: '200px', flex: '1 1 200px' }}
        />
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {team.is_active ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                            <CheckCircle2 size={14} /> Ativa
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444' }}>
                            <XCircle size={14} /> Inativa
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setTeamToEdit(team);
                            setIsTeamModalOpen(true);
                          }}
                          title="Editar equipe"
                          aria-label="Editar equipe"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            minWidth: '36px',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
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
                        onClick={() => {
                          setSelectedTeamForMembers(team);
                          setIsManageMembersOpen(true);
                        }}
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--primary-400)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          minHeight: '36px',
                          padding: '0.25rem 0.5rem',
                        }}
                      >
                        <Settings2 size={14} />
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="admin-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>USUÁRIO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PERFIL / CARGO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EQUIPES VINCULADAS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhum usuário encontrado. Clique em "Novo Usuário" para cadastrar membros da equipe ou solicitantes da empresa.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleBadge = getRoleBadgeStyle(user.role?.name);
                      return (
                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  color: 'var(--primary-400)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                  {user.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: roleBadge.bg,
                                color: roleBadge.color,
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Shield size={12} />
                              {user.role?.display_name || roleBadge.label}
                            </span>
                          </td>

                          <td style={{ padding: '0.875rem 1rem' }}>
                            {user.teams && user.teams.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {user.teams.map((t: Team) => (
                                  <span
                                    key={t.id}
                                    style={{
                                      fontSize: '0.6875rem',
                                      padding: '2px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'var(--bg-canvas)',
                                      border: '1px solid var(--border-subtle)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    {t.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {user.role?.name === 'requester' ? 'Geral (Empresa)' : 'Sem equipe'}
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: user.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: user.is_active ? '#10b981' : '#ef4444',
                                fontWeight: 600,
                              }}
                            >
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>

                          <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setUserToEdit(user);
                                setIsUserModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8125rem',
                                color: 'var(--primary-400)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              <Edit2 size={14} />
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="admin-table-container">
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

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NOME</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SLUG IDENTIFICADOR</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEPARTAMENTO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setIsCategoryModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8125rem',
                                color: 'var(--primary-400)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                minHeight: '36px',
                                padding: '0.25rem 0.5rem',
                              }}
                              title="Editar categoria"
                            >
                              <Edit2 size={14} />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setIsDeleteCategoryModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8125rem',
                                color: '#ef4444',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                minHeight: '36px',
                                padding: '0.25rem 0.5rem',
                              }}
                              title="Excluir categoria"
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: PRIORITIES */}
          {activeTab === 'priorities' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
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

      {/* MODALS */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      <TeamFormModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setTeamToEdit(null);
        }}
        teamToEdit={teamToEdit}
      />

      <ManageTeamMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => {
          setIsManageMembersOpen(false);
          setSelectedTeamForMembers(null);
        }}
        team={selectedTeamForMembers}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={async () => {
          if (categoryToDelete) {
            await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
            setIsDeleteCategoryModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
        title="Excluir Categoria"
        itemName={categoryToDelete?.name}
        itemType="esta categoria"
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
};

export default TeamsPage;
