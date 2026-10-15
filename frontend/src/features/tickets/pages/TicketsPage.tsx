import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  UserCheck,
  X,
  PlayCircle,
  Star,
  RotateCcw,
  Bell,
} from 'lucide-react';
import { FilterBar, SearchInput, FilterSelect } from '@/components/common/FilterBar';
import { KpiCard } from '@/components/common/KpiCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTickets, useChangeTicketStatus, useAssignTicket } from '../hooks/useTickets';
import { usePriorities, useUsers } from '@/features/teams/hooks/useOrganizational';
import { NewTicketModal } from '../components/NewTicketModal';
import { TransferTicketModal } from '../components/TransferTicketModal';
import { TicketDetailDrawer } from '../components/TicketDetailDrawer';
import { CsatModal } from '../components/CsatModal';
import { ReopenTicketModal } from '../components/ReopenTicketModal';
import { SatisfactionBadge } from '../components/SatisfactionBadge';
import type { Ticket, TicketStatusValue } from '../types';

export const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const isStaff = Boolean(user?.role?.name && ['admin', 'manager', 'agent'].includes(user.role.name));
  const isRequester = user?.role?.name === 'requester';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ratingTicket, setRatingTicket] = useState<Ticket | null>(null);
  const [reopeningTicket, setReopeningTicket] = useState<Ticket | null>(null);
  const [transferringTicket, setTransferringTicket] = useState<Ticket | null>(null);
  const [liveTicketAlert, setLiveTicketAlert] = useState<Ticket | null>(null);

  const prevTicketIdsRef = useRef<Set<number> | null>(null);

  const { data: tickets, isLoading } = useTickets();
  const { data: priorities } = usePriorities();
  const { data: users } = useUsers();
  const changeStatusMutation = useChangeTicketStatus();
  const assignTicketMutation = useAssignTicket();

  // Detecção de novos chamados registrados em tempo real
  useEffect(() => {
    if (!tickets) return;

    const currentIds = new Set(tickets.map((t) => t.id));

    if (prevTicketIdsRef.current !== null && isStaff) {
      const newTickets = tickets.filter((t) => !prevTicketIdsRef.current?.has(t.id));
      if (newTickets.length > 0) {
        const latest = newTickets[0];
        setTimeout(() => setLiveTicketAlert(latest), 0);
      }
    }

    prevTicketIdsRef.current = currentIds;
  }, [tickets, isStaff]);

  useEffect(() => {
    if (!liveTicketAlert) return;
    const timer = setTimeout(() => {
      setLiveTicketAlert(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [liveTicketAlert]);

  // Lista de responsáveis únicos combinando usuários cadastrados e tickets existentes
  const assignees = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();

    users?.forEach((u) => {
      map.set(u.id, { id: u.id, name: u.name });
    });

    tickets?.forEach((t) => {
      if (t.assigned_to) {
        map.set(t.assigned_to.id, { id: t.assigned_to.id, name: t.assigned_to.name });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [users, tickets]);

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

      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !ticket.assigned_to) ||
        (ticket.assigned_to && String(ticket.assigned_to.id) === assigneeFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

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

  const handleAssignToMe = async (ticket: Ticket) => {
    if (!user) return;
    try {
      const isReassigning = ticket.assigned_to && ticket.assigned_to.id !== user.id;
      const comment = isReassigning
        ? `Atendimento assumido por ${user.name} (anteriormente com ${ticket.assigned_to?.name}).`
        : `Atendimento assumido por ${user.name}.`;

      await assignTicketMutation.mutateAsync({
        id: ticket.id,
        payload: {
          assigned_to: user.id,
          comment,
        },
      });

      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                assigned_to: { id: user.id, name: user.name, email: user.email },
                status:
                  prev.status.value === 'open'
                    ? { ...prev.status, value: 'in_progress', label: 'Em Atendimento', color: '#8b5cf6' }
                    : prev.status,
              }
            : null
        );
      }
    } catch {
      alert('Não foi possível assumir este chamado.');
    }
  };

  let ticketFeedbackContent: React.ReactNode = null;
  if (isLoading) {
    ticketFeedbackContent = (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Carregando chamados...
      </div>
    );
  } else if (filteredTickets.length === 0) {
    ticketFeedbackContent = (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        Nenhum chamado encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isRequester ? 'Meus Chamados de Suporte' : 'Central de Chamados'}
            </h1>
            {isStaff && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                <span>Tempo Real Ativo</span>
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isRequester
              ? 'Acompanhe o andamento dos seus tickets, responda aos atendentes e avalie o serviço.'
              : 'Gerenciamento, fluxo de atendimento e ciclo de vida de tickets de suporte.'}
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
      <div className="kpi-grid">
        <KpiCard
          icon={<FileText size={24} />}
          label="Total de Chamados"
          value={counts.total}
          variant="blue"
        />
        <KpiCard
          icon={<AlertCircle size={24} />}
          label="Em Aberto (Triagem)"
          value={counts.open}
          variant="rose"
        />
        <KpiCard
          icon={<Clock size={24} />}
          label="Em Atendimento"
          value={counts.inProgress}
          variant="purple"
        />
        <KpiCard
          icon={<CheckCircle2 size={24} />}
          label="Resolvidos"
          value={counts.resolved}
          variant="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <FilterBar>
        <SearchInput
          placeholder="Buscar por código, título ou solicitante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Status Filter */}
        <FilterSelect
          icon={true}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os Status</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em Atendimento</option>
          <option value="pending">Pendente</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
          <option value="cancelled">Cancelado</option>
        </FilterSelect>

        {/* Priority Filter */}
        <FilterSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Todas as Prioridades</option>
          {priorities?.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.display_name}
            </option>
          ))}
        </FilterSelect>

        {/* Assignee Filter */}
        <FilterSelect
          icon={<User size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="all">Todos os Responsáveis</option>
          <option value="unassigned">Não Atribuído</option>
          {assignees.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {a.name}
            </option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Ticket List View (Mobile Cards & Desktop Table) */}
      {ticketFeedbackContent ?? (
        <>
          {/* Mobile Card List (< 768px) */}
          <div className="ticket-mobile-view">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header: Code & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: 'var(--primary-400)',
                      cursor: 'pointer',
                    }}
                  >
                    {ticket.code}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: `${ticket.status.color}20`,
                        color: ticket.status.color,
                      }}
                    >
                      {ticket.status.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: `${ticket.priority.color}22`,
                        color: ticket.priority.color,
                      }}
                    >
                      {ticket.priority.display_name}
                    </span>
                  </div>
                </div>

                {/* Title & Category */}
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
                      {ticket.title}
                    </h4>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'inline-block' }}>
                    {ticket.category.name}
                  </span>
                </div>

                {/* Info Bar: Solicitante & SLA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} style={{ color: 'var(--primary-400)' }} />
                    <strong style={{ color: 'var(--text-primary)' }}>{ticket.requester.name}</strong>
                  </span>

                  <div>
                    {ticket.sla?.status === 'breached' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#ef4444' }}>
                        <Clock size={12} /> SLA Estourado
                      </span>
                    )}
                    {ticket.sla?.status === 'met' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#10b981' }}>
                        <CheckCircle2 size={12} /> SLA Cumprido
                      </span>
                    )}
                    {(!ticket.sla || ticket.sla.status === 'normal') && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <Clock size={12} /> No prazo
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--primary-400)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    Ver Linha do Tempo →
                  </button>

                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {ticket.satisfaction && (
                      <SatisfactionBadge satisfaction={ticket.satisfaction} />
                    )}

                    {isStaff && ticket.status.value === 'open' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToMe(ticket);
                        }}
                        title="Iniciar atendimento e assumir chamado"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#a78bfa',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minHeight: '36px',
                        }}
                      >
                        <PlayCircle size={14} /> Atender
                      </button>
                    )}
                    {isStaff && ticket.status.value === 'in_progress' && ticket.assigned_to?.id !== user?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToMe(ticket);
                        }}
                        title="Assumir este chamado para você"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          border: '1px solid rgba(59, 130, 246, 0.35)',
                          color: '#60a5fa',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minHeight: '36px',
                        }}
                      >
                        <UserCheck size={14} /> Assumir
                      </button>
                    )}
                    {isStaff && ticket.status.value === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickStatusChange(ticket, 'resolved');
                        }}
                        title="Marcar como resolvido"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minHeight: '36px',
                        }}
                      >
                        <CheckCircle2 size={14} /> Resolver
                      </button>
                    )}
                    {(ticket.status.value === 'resolved' || ticket.status.value === 'closed') &&
                      !ticket.satisfaction &&
                      (user?.id === ticket.requester.id || user?.role?.name === 'admin') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRatingTicket(ticket);
                          }}
                          title="Avaliar atendimento"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(234, 179, 8, 0.1)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            color: '#eab308',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: '36px',
                          }}
                        >
                          <Star size={14} /> Avaliar
                        </button>
                      )}
                    {ticket.status.value === 'resolved' &&
                      (user?.id === ticket.requester.id || user?.role?.name === 'admin') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReopeningTicket(ticket);
                          }}
                          title="Reabrir chamado"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            color: '#fb923c',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: '36px',
                          }}
                        >
                          <RotateCcw size={14} /> Reabrir
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div
            className="ticket-desktop-view"
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
                    tabIndex={0}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onClick={() => setSelectedTicket(ticket)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTicket(ticket);
                      }
                    }}
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
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {ticket.satisfaction && (
                          <SatisfactionBadge satisfaction={ticket.satisfaction} />
                        )}

                        {isStaff && ticket.status.value === 'open' && (
                          <button
                            onClick={() => handleAssignToMe(ticket)}
                            title="Iniciar atendimento e assumir chamado"
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
                        {isStaff && ticket.status.value === 'in_progress' && ticket.assigned_to?.id !== user?.id && (
                          <button
                            onClick={() => handleAssignToMe(ticket)}
                            title="Assumir este chamado para você"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'rgba(59, 130, 246, 0.12)',
                              border: '1px solid rgba(59, 130, 246, 0.35)',
                              color: '#60a5fa',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <UserCheck size={14} /> Assumir
                          </button>
                        )}
                        {isStaff && ticket.status.value === 'in_progress' && (
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
                        {(ticket.status.value === 'resolved' || ticket.status.value === 'closed') &&
                          !ticket.satisfaction &&
                          (user?.id === ticket.requester.id || user?.role?.name === 'admin') && (
                            <button
                              onClick={() => setRatingTicket(ticket)}
                              title="Avaliar atendimento"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                color: '#eab308',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Star size={14} /> Avaliar
                            </button>
                          )}
                        {ticket.status.value === 'resolved' &&
                          (user?.id === ticket.requester.id || user?.role?.name === 'admin') && (
                            <button
                              onClick={() => setReopeningTicket(ticket)}
                              title="Reabrir chamado"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                color: '#fb923c',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <RotateCcw size={14} /> Reabrir
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <TicketDetailDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          isStaff={isStaff}
          currentUser={user}
          onAssignToMe={(ticket) => handleAssignToMe(ticket)}
          isAssigning={assignTicketMutation.isPending}
          onTransfer={(ticket) => setTransferringTicket(ticket)}
          onRate={(ticket) => setRatingTicket(ticket)}
          onReopen={(ticket) => setReopeningTicket(ticket)}
        />
      )}

      {/* New Ticket Modal */}
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} />

      {/* Transfer / Reassign Ticket Modal */}
      <TransferTicketModal
        ticket={transferringTicket}
        onClose={() => setTransferringTicket(null)}
        onSuccess={() => {
          setSelectedTicket(null);
        }}
      />

      {/* CSAT Modal */}
      <CsatModal ticket={ratingTicket} onClose={() => setRatingTicket(null)} />

      {/* Reopen Ticket Modal */}
      <ReopenTicketModal ticket={reopeningTicket} onClose={() => setReopeningTicket(null)} />

      {/* Toast Notificação de Novo Chamado em Tempo Real */}
      {liveTicketAlert && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '80px',
            right: '1rem',
            zIndex: 60,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            width: 'calc(100vw - 2rem)',
            maxWidth: '420px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bell size={18} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                Novo Chamado Recebido
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Agora</span>
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px',
              }}
            >
              <span style={{ fontFamily: 'monospace', color: 'var(--primary-400)', marginRight: '6px' }}>
                {liveTicketAlert.code}
              </span>
              {liveTicketAlert.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Solicitante: <strong>{liveTicketAlert.requester.name}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                setSelectedTicket(liveTicketAlert);
                setLiveTicketAlert(null);
              }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary-400)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Abrir
            </button>
            <button
              type="button"
              onClick={() => setLiveTicketAlert(null)}
              aria-label="Fechar notificação"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
