import React, { useState } from 'react';
import { X, ShieldAlert, Clock, AlertTriangle, Flame } from 'lucide-react';
import { usePriorities } from '@/features/teams/hooks/useOrganizational';
import { useCreateSlaPolicy, useUpdateSlaPolicy } from '../hooks/useSla';
import type { SlaPolicy } from '../types';
import type { Priority } from '@/features/teams/types';

interface SlaPolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyToEdit?: SlaPolicy | null;
}

interface SlaPolicyFormContentProps {
  policyToEdit?: SlaPolicy | null;
  onClose: () => void;
  priorities: Priority[];
}

const SlaPolicyFormContent: React.FC<SlaPolicyFormContentProps> = ({
  policyToEdit,
  onClose,
  priorities,
}) => {
  const createPolicyMutation = useCreateSlaPolicy();
  const updatePolicyMutation = useUpdateSlaPolicy();

  const defaultPriorityId = policyToEdit?.priority?.id ?? (priorities[0]?.id || 1);

  const [name, setName] = useState(policyToEdit?.name ?? '');
  const [priorityId, setPriorityId] = useState<number>(defaultPriorityId);
  const [firstResponseMinutes, setFirstResponseMinutes] = useState<number>(
    policyToEdit?.first_response_time_minutes ?? 60
  );
  const [resolutionMinutes, setResolutionMinutes] = useState<number>(
    policyToEdit?.resolution_time_minutes ?? 480
  );
  const [description, setDescription] = useState(policyToEdit?.description ?? '');
  const [isActive, setIsActive] = useState(policyToEdit ? policyToEdit.is_active : true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSaving = createPolicyMutation.isPending || updatePolicyMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome da política de SLA é obrigatório.');
      return;
    }

    if (!priorityId) {
      setErrorMsg('Selecione uma prioridade para esta política.');
      return;
    }

    if (firstResponseMinutes <= 0) {
      setErrorMsg('O tempo limite para primeira resposta deve ser maior que zero.');
      return;
    }

    if (resolutionMinutes <= 0) {
      setErrorMsg('O tempo limite para resolução deve ser maior que zero.');
      return;
    }

    if (resolutionMinutes < firstResponseMinutes) {
      setErrorMsg('O tempo de resolução não pode ser menor do que o tempo de primeira resposta.');
      return;
    }

    try {
      if (policyToEdit) {
        await updatePolicyMutation.mutateAsync({
          id: policyToEdit.id,
          payload: {
            name: name.trim(),
            priority_id: Number(priorityId),
            first_response_time_minutes: Number(firstResponseMinutes),
            resolution_time_minutes: Number(resolutionMinutes),
            description: description.trim(),
            is_active: isActive,
          },
        });
      } else {
        await createPolicyMutation.mutateAsync({
          name: name.trim(),
          priority_id: Number(priorityId),
          first_response_time_minutes: Number(firstResponseMinutes),
          resolution_time_minutes: Number(resolutionMinutes),
          description: description.trim(),
          is_active: isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erro ao salvar política de SLA.';
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
        maxWidth: '640px',
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
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {policyToEdit ? 'Editar Política de SLA' : 'Nova Política de SLA'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Configure metas de atendimento por severidade de chamado
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

        {/* Linha 1: Nome da Política + Prioridade Vinculada */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.875rem' }}>
          {/* Nome */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Nome da Política *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SLA Alta Severidade (P2)"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Prioridade */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Prioridade Vinculada *
            </label>
            <div style={{ position: 'relative' }}>
              <Flame size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(Number(e.target.value))}
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
                  cursor: 'pointer',
                }}
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name} (Nível {p.order})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Linha 2: 1ª Resposta + Resolução */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.875rem' }}>
          {/* 1ª Resposta */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Tempo 1ª Resposta (minutos) *
            </label>
            <div style={{ position: 'relative' }}>
              <Clock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="number"
                min={1}
                value={firstResponseMinutes}
                onChange={(e) => setFirstResponseMinutes(Number(e.target.value))}
                placeholder="Ex: 15 (minutos) ou 60 (1 hora)"
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
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Equivale a {firstResponseMinutes >= 60 ? `${(firstResponseMinutes / 60).toFixed(1)}h` : `${firstResponseMinutes} min`}
            </span>
          </div>

          {/* Resolução */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Tempo Resolução (minutos) *
            </label>
            <div style={{ position: 'relative' }}>
              <AlertTriangle size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="number"
                min={1}
                value={resolutionMinutes}
                onChange={(e) => setResolutionMinutes(Number(e.target.value))}
                placeholder="Ex: 480 (8 horas) ou 1440 (24h)"
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
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              Equivale a {resolutionMinutes >= 1440 ? `${(resolutionMinutes / 1440).toFixed(1)} dia(s)` : `${(resolutionMinutes / 60).toFixed(1)}h`}
            </span>
          </div>
        </div>

        {/* Linha 3: Descrição */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Descrição e Escopo de Aplicação
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva quando e para quais tipos de incidentes esta política de SLA se aplica..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Linha 4: Status Ativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.125rem' }}>
          <input
            type="checkbox"
            id="sla_is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--primary-600)' }}
          />
          <label htmlFor="sla_is_active" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Política Ativa (aplicar monitoramento e contagem regressiva automaticamente)
          </label>
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
            {isSaving ? 'Salvando...' : policyToEdit ? 'Atualizar Política' : 'Cadastrar Política'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const SlaPolicyFormModal: React.FC<SlaPolicyFormModalProps> = ({
  isOpen,
  onClose,
  policyToEdit,
}) => {
  const { data: priorities = [] } = usePriorities();

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
      <SlaPolicyFormContent
        key={policyToEdit?.id ?? 'create'}
        policyToEdit={policyToEdit}
        onClose={onClose}
        priorities={priorities}
      />
    </div>
  );
};
