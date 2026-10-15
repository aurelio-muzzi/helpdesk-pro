import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle, Check } from 'lucide-react';
import { useAssignTicket } from '../hooks/useTickets';
import { useUsers } from '@/features/teams/hooks/useOrganizational';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Ticket } from '../types';

interface TransferTicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TransferTicketModal: React.FC<TransferTicketModalProps> = ({
  ticket,
  onClose,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const assignMutation = useAssignTicket();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!ticket) return null;

  // Filtra técnicos/agentes/administradores disponíveis
  const availableAgents = (users || []).filter((u) => {
    // Permite staff (admin, manager, agent) ou se role não vier especificada
    const role = u.role?.name;
    return !role || ['admin', 'manager', 'agent'].includes(role);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetId = selectedUserId ? Number(selectedUserId) : null;

    if (!targetId) {
      setErrorMessage('Por favor, selecione o novo responsável para o chamado.');
      return;
    }

    if (ticket.assigned_to && ticket.assigned_to.id === targetId) {
      setErrorMessage('O usuário selecionado já é o responsável atual por este atendimento.');
      return;
    }

    try {
      await assignMutation.mutateAsync({
        id: ticket.id,
        payload: {
          assigned_to: targetId,
          comment: comment.trim() || undefined,
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      setErrorMessage('Ocorreu um erro ao transferir o chamado. Tente novamente.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: '1.5rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-ticket-title"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
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
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa',
              }}
            >
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h3
                id="transfer-ticket-title"
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}
              >
                Transferir Chamado
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Protocolo: {ticket.code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card com info atual */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Título:</span>
              <strong style={{ color: 'var(--text-primary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ticket.title}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Responsável Atual:</span>
              <span style={{ color: ticket.assigned_to ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {ticket.assigned_to?.name ?? 'Não atribuído'}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seleção do Novo Responsável */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="new-assignee-select"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              Novo Responsável <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="new-assignee-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="">Selecione um atendente...</option>
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={String(ag.id)}>
                    {ag.name} {ag.id === currentUser?.id ? '(Você)' : ''} — {ag.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo da Transferência */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="transfer-comment"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              Motivo / Justificativa da Transferência
            </label>
            <textarea
              id="transfer-comment"
              rows={3}
              placeholder="Ex: Não foi possível reproduzir a falha localmente; transferindo para especialista de redes..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Esta justificativa será registrada no histórico oficial do chamado.
            </span>
          </div>

          {/* Ações */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={assignMutation.isPending}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending || loadingUsers}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: 'var(--primary-600, #2563eb)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: assignMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: assignMutation.isPending ? 0.7 : 1,
              }}
            >
              {assignMutation.isPending ? (
                'Transferindo...'
              ) : (
                <>
                  <Check size={16} /> Confirmar Transferência
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
