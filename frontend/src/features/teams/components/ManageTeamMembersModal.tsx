import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, Crown } from 'lucide-react';
import { useUsers, useSyncTeamMembers } from '../hooks/useOrganizational';
import type { Team, SyncTeamMemberItem, UserItem } from '../types';

interface ManageTeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

interface ManageTeamMembersContentProps {
  team: Team;
  onClose: () => void;
  allUsers: UserItem[];
}

const ManageTeamMembersContent: React.FC<ManageTeamMembersContentProps> = ({
  team,
  onClose,
  allUsers,
}) => {
  const syncMembersMutation = useSyncTeamMembers();

  const initialMembers: SyncTeamMemberItem[] = (team.members || []).map(
    (m: { id: number; pivot?: { is_leader?: boolean }; is_leader?: boolean }) => ({
      user_id: m.id,
      is_leader: Boolean(m.pivot?.is_leader || m.is_leader),
    })
  );

  const [members, setMembers] = useState<SyncTeamMemberItem[]>(initialMembers);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentMemberIds = members.map((m) => m.user_id);
  const availableUsers = allUsers.filter((u) => !currentMemberIds.includes(u.id));

  const handleAddMember = () => {
    if (!selectedUserId) return;
    setMembers((prev) => [...prev, { user_id: Number(selectedUserId), is_leader: false }]);
    setSelectedUserId('');
  };

  const handleRemoveMember = (userId: number) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  const handleToggleLeader = (userId: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === userId ? { ...m, is_leader: !m.is_leader } : m))
    );
  };

  const handleSave = async () => {
    try {
      await syncMembersMutation.mutateAsync({
        teamId: team.id,
        payload: { members },
      });
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erro ao sincronizar membros da equipe.';
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
        maxWidth: '560px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
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
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Membros da Equipe: {team.name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Vincule atendentes e defina lideranças da equipe
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
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Adicionar Membro */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Adicionar Atendente ou Usuário à Equipe
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              style={{
                flex: '1 1 200px',
                padding: '0.625rem 0.75rem',
                minHeight: '40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="">Selecione um usuário para adicionar...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.role?.display_name || 'Usuário'}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={!selectedUserId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.625rem 1rem',
                minHeight: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedUserId ? 'var(--primary-600)' : 'var(--bg-card-hover)',
                color: selectedUserId ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: selectedUserId ? 'pointer' : 'not-allowed',
              }}
            >
              <UserPlus size={16} />
              Adicionar
            </button>
          </div>
        </div>

        {/* Lista de Membros */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Membros Atuais ({members.length})
          </label>

          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Nenhum membro vinculado a esta equipe ainda. Adicione atendentes no campo acima.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.map((member) => {
                const userInfo = allUsers.find((u) => u.id === member.user_id);
                const name = userInfo?.name || `Usuário #${member.user_id}`;
                const email = userInfo?.email || '';
                const roleName = userInfo?.role?.display_name || '';

                return (
                  <div
                    key={member.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: member.is_leader ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                          color: member.is_leader ? '#eab308' : 'var(--primary-500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                        }}
                      >
                        {member.is_leader ? <Crown size={16} /> : name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {name}
                          </span>
                          {member.is_leader && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                              Líder da Equipe
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {email} {roleName && `• ${roleName}`}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleLeader(member.user_id)}
                        title={member.is_leader ? 'Remover liderança' : 'Definir como líder da equipe'}
                        aria-label={member.is_leader ? 'Remover liderança' : 'Definir como líder da equipe'}
                        style={{
                          padding: '0.375rem 0.625rem',
                          minHeight: '36px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: member.is_leader ? 'rgba(234, 179, 8, 0.1)' : 'var(--bg-canvas)',
                          color: member.is_leader ? '#eab308' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Crown size={14} />
                        {member.is_leader ? 'Líder' : 'Tornar Líder'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.user_id)}
                        aria-label="Remover membro"
                        style={{
                          minWidth: '36px',
                          minHeight: '36px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={syncMembersMutation.isPending}
          style={{
            padding: '0.625rem 1.25rem',
            minHeight: '40px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
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
          type="button"
          onClick={handleSave}
          disabled={syncMembersMutation.isPending}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            minHeight: '40px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: 'var(--primary-600)',
            border: 'none',
            cursor: syncMembersMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: syncMembersMutation.isPending ? 0.7 : 1,
          }}
        >
          {syncMembersMutation.isPending ? 'Salvando...' : 'Salvar Membros'}
        </button>
      </div>
    </div>
  );
};

export const ManageTeamMembersModal: React.FC<ManageTeamMembersModalProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const { data: allUsers = [] } = useUsers();

  if (!isOpen || !team) return null;

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
      <ManageTeamMembersContent
        key={team.id}
        team={team}
        onClose={onClose}
        allUsers={allUsers}
      />
    </div>
  );
};
