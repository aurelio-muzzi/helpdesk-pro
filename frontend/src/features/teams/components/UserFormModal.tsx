import React, { useState } from 'react';
import { X, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useRoles, useTeams, useCreateUser, useUpdateUser } from '../hooks/useOrganizational';
import type { UserItem, Role, Team } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserItem | null;
}

interface UserFormContentProps {
  userToEdit?: UserItem | null;
  onClose: () => void;
  roles: Role[];
  teams: Team[];
}

const UserFormContent: React.FC<UserFormContentProps> = ({
  userToEdit,
  onClose,
  roles,
  teams,
}) => {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const requesterRole = roles.find((r) => r.name === 'requester');
  const defaultRoleId = requesterRole?.id ?? (roles[0]?.id || 4);

  const [name, setName] = useState(userToEdit?.name ?? '');
  const [email, setEmail] = useState(userToEdit?.email ?? '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(userToEdit?.role?.id ?? defaultRoleId);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>(
    userToEdit?.teams?.map((t) => t.id) ?? []
  );
  const [isActive, setIsActive] = useState(userToEdit ? userToEdit.is_active : true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSaving = createUserMutation.isPending || updateUserMutation.isPending;

  const toggleTeam = (teamId: number) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const getRoleShortDescription = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Acesso total';
      case 'manager':
        return 'Coordena equipes';
      case 'agent':
        return 'Atende chamados';
      case 'requester':
      default:
        return 'Abre chamados';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome do usuário é obrigatório.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }

    if (!userToEdit && (!password || password.length < 8)) {
      setErrorMsg('A senha inicial deve conter pelo menos 8 caracteres.');
      return;
    }

    try {
      if (userToEdit) {
        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          payload: {
            name: name.trim(),
            email: email.trim(),
            role_id: Number(roleId),
            is_active: isActive,
            team_ids: selectedTeamIds,
            ...(password ? { password } : {}),
          },
        });
      } else {
        await createUserMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password,
          role_id: Number(roleId),
          is_active: isActive,
          team_ids: selectedTeamIds,
        });
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erro ao salvar dados do usuário.';
      setErrorMsg(msg);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '680px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Cadastre membros de equipe (suporte/gestão) ou solicitantes da empresa
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar modal"
          style={{
            minWidth: '38px',
            minHeight: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Linha 1: Nome Completo + E-mail Corporativo em 2 colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.875rem' }}>
          {/* Nome */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Nome Completo *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Beatriz Lima ou João da Silva"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              E-mail Corporativo *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Linha 2: Senha + Status Ativo integrados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.2fr) minmax(200px, 1fr)', gap: '0.875rem', alignItems: 'flex-end' }}>
          {/* Senha */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {userToEdit ? 'Nova Senha (opcional)' : 'Senha de Acesso *'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={userToEdit ? 'Deixe vazio para manter atual' : 'Mínimo de 8 caracteres'}
                required={!userToEdit}
                minLength={userToEdit ? undefined : 8}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              height: '35px',
            }}
          >
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--primary-600)' }}
            />
            <label htmlFor="is_active" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Usuário Ativo no Sistema
            </label>
          </div>
        </div>

        {/* Linha 3: Perfil / Cargo em 4 colunas compactas */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Perfil de Acesso (Cargo) *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {roles.map((role) => {
              const isSelected = Number(roleId) === Number(role.id);
              return (
                <div
                  key={role.id}
                  onClick={() => setRoleId(role.id)}
                  style={{
                    border: isSelected ? '1.5px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.625rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                      {role.display_name}
                    </span>
                    {isSelected && <CheckCircle2 size={14} color="var(--primary-500)" />}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {getRoleShortDescription(role.name)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Linha 4: Equipes Vinculadas */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Vincular a Equipes de Atendimento (opcional)
          </label>
          {teams.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhuma equipe cadastrada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', padding: '0.4rem 0.5rem', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {teams.map((team) => {
                const isChecked = selectedTeamIds.includes(team.id);
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => toggleTeam(team.id)}
                    style={{
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      border: isChecked ? '1px solid var(--primary-500)' : '1px solid var(--border-default)',
                      backgroundColor: isChecked ? 'var(--primary-600)' : 'var(--bg-card)',
                      color: isChecked ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isChecked ? '✓ ' : '+ '} {team.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.625rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '0.25rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.125rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.375rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'var(--primary-600)',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Salvando...' : userToEdit ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <UserFormContent
        key={userToEdit?.id ?? 'create'}
        userToEdit={userToEdit}
        onClose={onClose}
        roles={roles}
        teams={teams}
      />
    </div>
  );
};
