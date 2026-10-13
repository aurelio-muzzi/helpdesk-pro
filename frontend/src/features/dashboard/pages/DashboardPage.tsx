import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Timer,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useDashboardMetrics, useExportDashboardCsv } from '../hooks/useDashboard';
import { useDepartments } from '@/features/teams/hooks/useOrganizational';
import { MetricCard } from '../components/MetricCard';
import { VolumeChart } from '../components/VolumeChart';
import { StatusDonutChart } from '../components/StatusDonutChart';
import { DepartmentBarChart } from '../components/DepartmentBarChart';
import { PriorityBarChart } from '../components/PriorityBarChart';
import { AgentRankingTable } from '../components/AgentRankingTable';
import { RecentTicketsList } from '../components/RecentTicketsList';
import type { DashboardFilters } from '../types';

function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return 'N/D';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = (minutes / 60).toFixed(1);
  return `${hours} hrs`;
}

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [departmentId, setDepartmentId] = useState<string>('');

  const filters: DashboardFilters = {
    period,
    department_id: departmentId ? Number(departmentId) : undefined,
  };

  const { data: metrics, isLoading, isError, refetch, isFetching } = useDashboardMetrics(filters);
  const { data: departments } = useDepartments();
  const exportMutation = useExportDashboardCsv();

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
      {/* Header com Título, Filtros e Ação de Exportar Relatório */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Painel Executivo & Métricas
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Indicadores de desempenho do Service Desk, conformidade de SLA e volume de atendimento.
          </p>
        </div>

        {/* Toolbar de Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Seletor de Período */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {(['7d', '30d', '90d'] as const).map((p) => {
              const isActive = period === p;
              const label = p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : '90 Dias';
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  style={{
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-500)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.8125rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Filtro de Departamento */}
          {departments && departments.length > 0 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                style={{
                  height: '36px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 1rem 0 2rem',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="">Todos os Departamentos</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <Filter
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.625rem',
                  pointerEvents: 'none',
                  color: 'var(--text-tertiary)',
                }}
              />
            </div>
          )}

          {/* Botão de Atualizar */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar dados"
            style={{
              height: '36px',
              width: '36px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isFetching ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>

          {/* Botão Exportar CSV */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            style={{
              height: '36px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: exportMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Download size={15} style={{ color: 'var(--primary-400)' }} />
            <span>{exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div
          style={{
            padding: '4rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-500)' }} />
          <p style={{ fontWeight: 600 }}>Carregando métricas e dados analíticos...</p>
        </div>
      )}

      {isError && (
        <div
          style={{
            padding: '2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 600 }}>Falha ao carregar as métricas do painel.</p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              marginTop: '0.75rem',
              padding: '0.375rem 0.875rem',
              backgroundColor: 'var(--danger)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {metrics && (
        <>
          {/* Grid de KPIs Executivos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <MetricCard
              title="Total de Chamados"
              value={metrics.summary.total_tickets}
              icon={Ticket}
              color="var(--primary-500)"
              subtitle={`Criados em ${metrics.period.from} a ${metrics.period.to}`}
            />
            <MetricCard
              title="Em Atendimento"
              value={metrics.summary.in_progress_tickets}
              icon={Clock}
              color="var(--warning)"
              subtitle="Em triagem / suporte técnico"
            />
            <MetricCard
              title="Resolvidos"
              value={metrics.summary.resolved_tickets}
              icon={CheckCircle2}
              color="var(--success)"
              subtitle={`${metrics.summary.closed_tickets} finalizados`}
            />
            <MetricCard
              title="Conformidade SLA"
              value={`${metrics.summary.sla_compliance_rate}%`}
              icon={ShieldCheck}
              color={metrics.summary.sla_compliance_rate >= 90 ? 'var(--success)' : 'var(--danger)'}
              subtitle={`${metrics.summary.sla_breached} chamados violados`}
              trendPositive={metrics.summary.sla_compliance_rate >= 90}
            />
            <MetricCard
              title="MTTA (1ª Resposta)"
              value={formatMinutes(metrics.summary.avg_first_response_minutes)}
              icon={Zap}
              color="#8b5cf6"
              subtitle="Tempo médio de resposta"
            />
            <MetricCard
              title="MTTR (Resolução)"
              value={formatMinutes(metrics.summary.avg_resolution_minutes)}
              icon={Timer}
              color="#06b6d4"
              subtitle="Tempo médio de solução"
            />
          </div>

          {/* Gráficos Principais: Volume ao Longo do Tempo & Distribuição por Status */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Volume Diário */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Volume de Chamados no Período
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                    Evolução diária de novos chamados e tickets resolvidos
                  </p>
                </div>
                <TrendingUp size={18} style={{ color: 'var(--primary-400)' }} />
              </div>
              <VolumeChart data={metrics.volume_over_time} />
            </div>

            {/* Status Donut */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Distribuição por Status
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  Proporção de chamados ativos e concluídos
                </p>
              </div>
              <StatusDonutChart data={metrics.tickets_by_status} />
            </div>
          </div>

          {/* Gráficos Secundários: Departamentos & Prioridades */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Departamentos */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Chamados por Departamento
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  Demanda setorizada por área da organização
                </p>
              </div>
              <DepartmentBarChart data={metrics.tickets_by_department} />
            </div>

            {/* Prioridades */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Chamados por Severidade / Prioridade
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  Nível de urgência e impacto operacional
                </p>
              </div>
              <PriorityBarChart data={metrics.tickets_by_priority} />
            </div>
          </div>

          {/* Produtividade de Atendentes & Chamados Recentes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Ranking de Atendentes */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Produtividade da Equipe de Suporte
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  Chamados atribuídos e taxa de resolução individual
                </p>
              </div>
              <AgentRankingTable data={metrics.agent_performance} />
            </div>

            {/* Chamados Recentes */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Últimos Chamados Registrados
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                  Atividades mais recentes no catálogo de atendimento
                </p>
              </div>
              <RecentTicketsList data={metrics.recent_tickets} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
