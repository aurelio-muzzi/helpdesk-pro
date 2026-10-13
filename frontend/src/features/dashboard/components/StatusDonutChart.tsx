import React from 'react';
import type { StatusCount } from '../types';

interface StatusDonutChartProps {
  data: StatusCount[];
}

function computeSegments(data: StatusCount[], total: number, circumference: number) {
  let runningPercent = 0;
  return data
    .filter((item) => item.count > 0)
    .map((item) => {
      const percent = item.count / total;
      const strokeDasharray = `${percent * circumference} ${circumference}`;
      const strokeDashoffset = -runningPercent * circumference;
      runningPercent += percent;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div
        style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '0.875rem',
        }}
      >
        Nenhum chamado registrado no período.
      </div>
    );
  }

  // Prepara segmentos para SVG stroke-dasharray
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = computeSegments(data, total, circumference);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Fundo do anel */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--bg-muted)"
            strokeWidth={strokeWidth}
          />

          {segments.map((item) => (
            <circle
              key={item.status}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={item.strokeDasharray}
              strokeDashoffset={item.strokeDashoffset}
              style={{
                transition: 'stroke-dasharray 0.3s ease',
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          ))}
        </svg>

        {/* Total no centro */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
            Total
          </span>
        </div>
      </div>

      {/* Legenda com percentuais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '160px' }}>
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.status}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.count}</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
