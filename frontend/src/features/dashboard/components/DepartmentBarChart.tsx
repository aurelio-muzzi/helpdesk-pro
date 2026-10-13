import React from 'react';
import type { DepartmentCount } from '../types';

interface DepartmentBarChartProps {
  data: DepartmentCount[];
}

export const DepartmentBarChart: React.FC<DepartmentBarChartProps> = ({ data }) => {
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
        Nenhum chamado vinculado a departamentos no período.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {data.map((dept) => {
        const percent = Math.round((dept.count / maxCount) * 100);
        const sharePercent = total > 0 ? Math.round((dept.count / total) * 100) : 0;

        return (
          <div key={dept.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {dept.name}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dept.count}</span>
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
                  backgroundColor: 'var(--primary-500)',
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
