import React, { useState } from 'react';
import { X, Users, Building2 } from 'lucide-react';
import { useDepartments, useCreateTeam, useUpdateTeam } from '../hooks/useOrganizational';
import type { Team, Department } from '../types';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamToEdit?: Team | null;
}

interface TeamFormContentProps {
  teamToEdit?: Team | null;
  onClose: () => void;
  departments: Department[];
}

const TeamFormContent: React.FC<TeamFormContentProps> = ({
  teamToEdit,
  onClose,
  departments,
}) => {
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const [name, setName] = useState(teamToEdit?.name ?? '');
  const [departmentId, setDepartmentId] = useState<number | ''>(
    teamToEdit?.department_id ?? (departments[0]?.id ?? '')
  );
  const [description, setDescription] = useState(teamToEdit?.description ?? '');
  const [isActive, setIsActive] = useState(teamToEdit ? teamToEdit.is_active : true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSaving = createTeamMutation.isPending || updateTeamMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome da equipe é obrigatório.');
      return;
    }

    if (!departmentId) {
      setErrorMsg('Selecione o departamento da equipe.');
      return;
    }

    try {
      if (teamToEdit) {
        await updateTeamMutation.mutateAsync({
          id: teamToEdit.id,
          payload: {
            name: name.trim(),
            department_id: Number(departmentId),
            description: description.trim(),
            is_active: isActive,
          },
        });
      } else {
        await createTeamMutation.mutateAsync({
          name: name.trim(),
          department_id: Number(departmentId),
          description: description.trim(),
          is_active: isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erro ao salvar equipe.';
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
        maxWidth: '500px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
              {teamToEdit ? 'Editar Equipe' : 'Nova Equipe'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Crie um time de atendimento e resolução de chamados
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

      {/* Form Body */}
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

        {/* Nome da Equipe */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Nome da Equipe *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Suporte Nível 1, Infraestrutura, etc."
            required
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Departamento */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Departamento Vinculado *
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>Selecione um departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Descrição das Responsabilidades
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o escopo e os tipos de chamados atendidos por esta equipe..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Status Ativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            id="team_is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary-600)' }}
          />
          <label htmlFor="team_is_active" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Equipe Ativa (disponível para direcionamento e triagem de chamados)
          </label>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
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
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.625rem 1.5rem',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: 'var(--primary-600)',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Salvando...' : teamToEdit ? 'Atualizar Equipe' : 'Criar Equipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  isOpen,
  onClose,
  teamToEdit,
}) => {
  const { data: departments = [] } = useDepartments();

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
      <TeamFormContent
        key={teamToEdit?.id ?? 'create'}
        teamToEdit={teamToEdit}
        onClose={onClose}
        departments={departments}
      />
    </div>
  );
};
