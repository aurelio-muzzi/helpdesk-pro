import React from 'react';
import { Ticket, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const stats = [
  { label: 'Total de Chamados', value: '128', icon: Ticket, color: 'var(--primary-500)' },
  { label: 'Em Atendimento', value: '34', icon: Clock, color: 'var(--warning)' },
  { label: 'Resolvidos no Mês', value: '89', icon: CheckCircle2, color: 'var(--success)' },
  { label: 'SLA em Risco', value: '5', icon: AlertTriangle, color: 'var(--danger)' },
];

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Visão Geral do Service Desk
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Acompanhamento de métricas, volume de chamados e conformidade de SLA.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {stat.label}
                </span>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stat.value}
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Status Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Status da Plataforma
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Fundação de infraestrutura, API REST Laravel 12 e frontend React 19 configurados com sucesso.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
