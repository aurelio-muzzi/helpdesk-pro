import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  X,
  PlayCircle,
} from 'lucide-react';
import { useTickets, useChangeTicketStatus } from '../hooks/useTickets';
import { usePriorities } from '@/features/teams/hooks/useOrganizational';
import { NewTicketModal } from '../components/NewTicketModal';
import { TicketTimeline } from '../components/TicketTimeline';
import type { Ticket, TicketStatusValue } from '../types';

export const TicketsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data: tickets, isLoading } = useTickets();
  const { data: priorities } = usePriorities();
  const changeStatusMutation = useChangeTicketStatus();

  // Filtros aplicados
  const filteredTickets = useMemo(() => {
    return (tickets || []).filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || ticket.status.value === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || String(ticket.priority.id) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Contadores para os KPIs
  const counts = useMemo(() => {
    const all = tickets || [];
    return {
      total: all.length,
      open: all.filter((t) => t.status.value === 'open').length,
      inProgress: all.filter((t) => t.status.value === 'in_progress').length,
      resolved: all.filter((t) => t.status.value === 'resolved').length,
    };
  }, [tickets]);

  const handleQuickStatusChange = async (ticket: Ticket, newStatus: TicketStatusValue) => {
    try {
      await changeStatusMutation.mutateAsync({
        id: ticket.id,
        payload: {
          status: newStatus,
          comment: `Status alterado rapidamente para ${newStatus} pela interface.`,
        },
      });
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
      }
    } catch {
      alert('Não foi possível realizar essa transição de status.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Central de Chamados
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Gerenciamento, fluxo de atendimento e ciclo de vida de tickets de suporte.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
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
          Novo Chamado
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
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total de Chamados
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {counts.total}
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
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Em Aberto (Triagem)
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {counts.open}
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
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Em Atendimento
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {counts.inProgress}
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
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Resolvidos
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {counts.resolved}
            </h3>
          </div>
        </div>
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
          alignItems: 'center',
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
            placeholder="Buscar por código, título ou solicitante..."
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

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">Todos os Status</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em Atendimento</option>
            <option value="pending">Pendente</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
          }}
        >
          <option value="all">Todas as Prioridades</option>
          {priorities?.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.display_name}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket List Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando chamados...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum chamado encontrado com os filtros selecionados.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-muted)' }}>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CÓDIGO</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TÍTULO & CATEGORIA</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PRIORIDADE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SLA</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SOLICITANTE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RESPONSÁVEL</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-400)', whiteSpace: 'nowrap' }}>
                    {ticket.code}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {ticket.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {ticket.category.name}
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `${ticket.status.color}20`,
                        color: ticket.status.color,
                      }}
                    >
                      {ticket.status.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: `${ticket.priority.color}22`,
                        color: ticket.priority.color,
                      }}
                    >
                      {ticket.priority.display_name}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {ticket.sla?.status === 'breached' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                        <Clock size={12} /> Estourado
                      </span>
                    )}
                    {ticket.sla?.status === 'met' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <CheckCircle2 size={12} /> Cumprido
                      </span>
                    )}
                    {(!ticket.sla || ticket.sla.status === 'normal') && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} /> No prazo
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {ticket.requester.name}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {ticket.assigned_to ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} style={{ color: 'var(--primary-400)' }} />
                        {ticket.assigned_to.name}
                      </span>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Não atribuído</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {ticket.status.value === 'open' && (
                        <button
                          onClick={() => handleQuickStatusChange(ticket, 'in_progress')}
                          title="Iniciar atendimento"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: '#a78bfa',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <PlayCircle size={14} /> Atender
                        </button>
                      )}
                      {ticket.status.value === 'in_progress' && (
                        <button
                          onClick={() => handleQuickStatusChange(ticket, 'resolved')}
                          title="Marcar como resolvido"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={14} /> Resolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-default)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-400)', fontWeight: 600 }}>
                  {selectedTicket.code}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedTicket.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: `${selectedTicket.status.color}20`,
                  color: selectedTicket.status.color,
                }}
              >
                {selectedTicket.status.label}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: `${selectedTicket.priority.color}22`,
                  color: selectedTicket.priority.color,
                }}
              >
                {selectedTicket.priority.display_name}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-secondary)',
                }}
              >
                {selectedTicket.category.name}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h5 style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                DESCRIÇÃO
              </h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {selectedTicket.description}
              </p>
            </div>

            {/* Solicitante & Atendente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Solicitante</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedTicket.requester.name}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedTicket.requester.email}</span>
              </div>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Responsável</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedTicket.assigned_to?.name ?? 'Não atribuído'}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedTicket.assigned_to?.email ?? '—'}
                </span>
              </div>
            </div>

            {/* Linha do Tempo e Interações */}
            <TicketTimeline ticket={selectedTicket} />
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} />
    </div>
  );
};

export default TicketsPage;
