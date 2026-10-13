import React from 'react';
import type { PriorityCount } from '../types';

interface PriorityBarChartProps {
  data: PriorityCount[];
}

export const PriorityBarChart: React.FC<PriorityBarChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div
        style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
        }}
      >
        Nenhum chamado no período.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {data.map((priority) => {
        const percent = Math.round((priority.count / maxCount) * 100);
        const sharePercent = total > 0 ? Math.round((priority.count / total) * 100) : 0;

        return (
          <div key={priority.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: priority.color,
                  }}
                />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {priority.display_name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{priority.count}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>({sharePercent}%)</span>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  backgroundColor: priority.color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
