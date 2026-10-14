import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertTriangle,
  Zap,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useSlaPolicies, useDeleteSlaPolicy } from '../hooks/useSla';
import { SlaPolicyFormModal } from '../components/SlaPolicyFormModal';
import { ConfirmDeleteModal } from '@/components/feedback/ConfirmDeleteModal';
import type { SlaPolicy } from '../types';

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    if (hours >= 24 && hours % 24 === 0) {
      const days = hours / 24;
      return `${hours}h (${days} ${days === 1 ? 'dia' : 'dias'})`;
    }
    return `${hours}h`;
  }
  return `${hours}h ${remaining}m`;
};

export const SlaPoliciesPage: React.FC = () => {
  const { data: policies, isLoading } = useSlaPolicies();
  const deletePolicyMutation = useDeleteSlaPolicy();

  // Modais de criação / edição e exclusão
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<SlaPolicy | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<SlaPolicy | null>(null);

  const activeCount = policies?.filter((p) => p.is_active).length ?? 0;

  // Encontrar o menor tempo de primeira resposta para o KPI
  const fastestResponseMinutes = policies && policies.length > 0
    ? Math.min(...policies.map((p) => p.first_response_time_minutes))
    : 15;

  const handleOpenCreateModal = () => {
    setPolicyToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (policy: SlaPolicy) => {
    setPolicyToEdit(policy);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (policy: SlaPolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    try {
      await deletePolicyMutation.mutateAsync(policyToDelete.id);
      setIsDeleteModalOpen(false);
      setPolicyToDelete(null);
    } catch {
      // Erro tratado pelo react-query
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Políticas de SLA (Nível de Serviço)
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Parâmetros de tempo limite para primeira resposta e resolução de incidentes por prioridade.
          </p>
        </div>

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
          Nova Política de SLA
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Regras Ativas
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {activeCount}
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
            <Zap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Resposta Mais Rápida
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {formatMinutes(fastestResponseMinutes)}
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
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Monitoramento
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Automático (24/7)
            </h3>
          </div>
        </div>
      </div>

      {/* SLA Policies Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '1.25rem',
        }}
      >
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando políticas de SLA...
          </div>
        ) : !policies || policies.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma política de SLA cadastrada. Clique em "Nova Política de SLA" para configurar parâmetros.
          </div>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                borderLeft: `4px solid ${policy.priority?.color || 'var(--primary-500)'}`,
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {policy.name}
                  </h3>
                  {policy.priority && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: `${policy.priority.color}22`,
                        color: policy.priority.color,
                      }}
                    >
                      Prioridade {policy.priority.display_name}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {policy.is_active ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                      <CheckCircle2 size={14} /> Ativo
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444' }}>
                      <XCircle size={14} /> Inativo
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(policy)}
                    title="Editar política de SLA"
                    aria-label="Editar política de SLA"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
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

                  <button
                    onClick={() => handleOpenDeleteModal(policy)}
                    title="Excluir política de SLA"
                    aria-label="Excluir política de SLA"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      minWidth: '36px',
                      minHeight: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Descrição */}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                {policy.description || 'Sem descrição cadastrada.'}
              </p>

              {/* Time Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> 1ª RESPOSTA
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {formatMinutes(policy.first_response_time_minutes)}
                  </p>
                </div>

                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <AlertTriangle size={12} /> RESOLUÇÃO
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {formatMinutes(policy.resolution_time_minutes)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação / Edição de Política de SLA */}
      <SlaPolicyFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setPolicyToEdit(null);
        }}
        policyToEdit={policyToEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPolicyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Política de SLA"
        itemName={policyToDelete?.name}
        itemType="esta política de SLA"
        isLoading={deletePolicyMutation.isPending}
      />
    </div>
  );
};

export default SlaPoliciesPage;
