import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  RefreshCw,
  Eye,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FilterBar, SearchInput, FilterSelect } from '@/components/common/FilterBar';
import { KpiCard } from '@/components/common/KpiCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditDetailsModal } from '../components/AuditDetailsModal';
import type { AuditLog, AuditFilterParams } from '../types';

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventCategory, setEventCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const isAdmin = user?.role?.name === 'admin';

  const filterParams: AuditFilterParams = useMemo(() => {
    const params: AuditFilterParams = {
      page,
      per_page: 15,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (eventCategory !== 'all') {
      params.event = eventCategory;
    }

    return params;
  }, [searchTerm, eventCategory, page]);

  const { data: response, isLoading, isError, refetch, isFetching } = useAuditLogs(
    isAdmin ? filterParams : undefined
  );

  const logs = response?.data || [];
  const meta = response?.meta;

  // Se não for admin, exibe tela de acesso restrito (403 amigável)
  if (!isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Acesso Restrito
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
          A Trilha de Auditoria e Logs de Segurança é reservada exclusivamente para Administradores do HelpDesk Pro.
        </p>
      </div>
    );
  }

  const getEventBadgeStyle = (event: string) => {
    if (event.includes('failed') || event.includes('deleted')) {
      return {
        bg: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      };
    }
    if (event.includes('login') || event.includes('created')) {
      return {
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      };
    }
    if (event.includes('status') || event.includes('reopened') || event.includes('updated')) {
      return {
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      };
    }
    return {
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#3b82f6',
      border: '1px solid rgba(59, 130, 246, 0.3)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <Shield size={18} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Trilha de Auditoria & Segurança
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Registro cronológico imutável de autenticações, ações administrativas e modificações de chamados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* KPI Cards de Auditoria */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
        }}
      >
        <KpiCard
          icon={<Shield size={24} />}
          label="Total de Registros"
          value={meta?.total ?? '—'}
          variant="blue"
        />

        <KpiCard
          icon={<Lock size={24} />}
          label="Integridade dos Logs"
          value="Protegido & Ativo"
          variant="emerald"
        />

        <KpiCard
          icon={<CheckCircle2 size={24} />}
          label="Página Atual"
          value={meta ? `${meta.current_page} de ${meta.last_page}` : '1 de 1'}
          variant="amber"
        />
      </div>

      {/* Toolbar de Filtros */}
      <FilterBar>
        <SearchInput
          placeholder="Buscar por descrição, endereço IP ou usuário..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />

        <FilterSelect
          icon={true}
          value={eventCategory}
          onChange={(e) => {
            setEventCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filtro de Eventos"
        >
          <option value="all">Todos os Eventos</option>
          <option value="auth.*">Autenticação (auth.*)</option>
          <option value="auth.failed_login">Falhas de Login (auth.failed_login)</option>
          <option value="ticket.*">Chamados (ticket.*)</option>
          <option value="sla.*">Políticas de SLA (sla.*)</option>
          <option value="article.*">Base de Conhecimento (article.*)</option>
        </FilterSelect>
      </FilterBar>

      {/* Tabela de Logs */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary-400)' }} />
            <p style={{ fontSize: '0.875rem' }}>Carregando eventos de auditoria...</p>
          </div>
        ) : isError ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Falha ao carregar registros de auditoria.</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nenhum registro de auditoria encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.75rem 1rem' }}>Data / Hora</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Evento</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Descrição</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Usuário</th>
                  <th style={{ padding: '0.75rem 1rem' }}>IP</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badgeStyle = getEventBadgeStyle(log.event);
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.8125rem',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: badgeStyle.border,
                          }}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '340px' }}>
                        {log.description}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                        {log.user ? (
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.user.name}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {log.user.email}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>Sistema / Anônimo</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {log.ip_address ?? '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="Inspecionar detalhes do log"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6',
                            padding: '0.375rem 0.625rem',
                            minHeight: '34px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={13} /> Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {meta && meta.last_page > 1 && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Mostrando {meta.from ?? 0} a {meta.to ?? 0} de {meta.total} registros
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={meta.current_page <= 1}
                aria-label="Página anterior"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.375rem 0.625rem',
                  minHeight: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  cursor: meta.current_page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: meta.current_page <= 1 ? 0.5 : 1,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0 4px' }}>
                {meta.current_page} / {meta.last_page}
              </span>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
                disabled={meta.current_page >= meta.last_page}
                aria-label="Próxima página"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.375rem 0.625rem',
                  minHeight: '36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  cursor: meta.current_page >= meta.last_page ? 'not-allowed' : 'pointer',
                  opacity: meta.current_page >= meta.last_page ? 0.5 : 1,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Próxima <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <AuditDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default AuditLogsPage;
