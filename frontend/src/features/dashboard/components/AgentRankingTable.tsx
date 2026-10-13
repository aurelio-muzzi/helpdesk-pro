import React from 'react';
import type { AgentPerformance } from '../types';

interface AgentRankingTableProps {
  data: AgentPerformance[];
}

export const AgentRankingTable: React.FC<AgentRankingTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
        }}
      >
        Nenhum registro de atendimento por analista no período.
      </div>
    );
  }

  // Ordena por maior número de chamados resolvidos
  const sorted = [...data].sort((a, b) => b.resolved_count - a.resolved_count);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Atendente</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Atribuídos</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Resolvidos</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Taxa de Resolução</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((agent) => {
            const initials = agent.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <tr
                key={agent.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-500)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {agent.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
                        {agent.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {agent.assigned_count}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--success)', fontWeight: 600 }}>
                  {agent.resolved_count}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '6px',
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(agent.resolution_rate, 100)}%`,
                          height: '100%',
                          backgroundColor:
                            agent.resolution_rate >= 80
                              ? 'var(--success)'
                              : agent.resolution_rate >= 50
                              ? 'var(--warning)'
                              : 'var(--danger)',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {agent.resolution_rate}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
