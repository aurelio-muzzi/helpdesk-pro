import React, { useState } from 'react';
import type { VolumeDataPoint } from '../types';

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}
      >
        Nenhum dado de volume disponível no período.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.created, d.resolved, 1)));
  const yAxisMax = Math.ceil(maxVal * 1.25);

  const width = 640;
  const height = 230;
  const paddingX = 42;
  const paddingTop = 22;
  const paddingBottom = 34;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / yAxisMax) * chartHeight;
  };

  const createdPoints = data.map((d, i) => `${getX(i)},${getY(d.created)}`).join(' ');
  const resolvedPoints = data.map((d, i) => `${getX(i)},${getY(d.resolved)}`).join(' ');

  const createdArea = `${getX(0)},${paddingTop + chartHeight} ${createdPoints} ${getX(data.length - 1)},${paddingTop + chartHeight}`;
  const resolvedArea = `${getX(0)},${paddingTop + chartHeight} ${resolvedPoints} ${getX(data.length - 1)},${paddingTop + chartHeight}`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Legenda com alto contraste */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginBottom: '0.875rem', fontSize: '0.8125rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Criados</span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Resolvidos</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Linhas de Grade e Eixo Y Nítidos */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = paddingTop + chartHeight * (1 - pct);
          const val = Math.round(yAxisMax * pct);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="600"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Áreas Preenchidas */}
        <polygon points={createdArea} fill="url(#createdGrad)" />
        <polygon points={resolvedArea} fill="url(#resolvedGrad)" />

        {/* Linhas dos Gráficos com Traço Nítido */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={createdPoints}
        />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={resolvedPoints}
        />

        {/* Pontos Interativos e Rótulos do Eixo X */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cyCreated = getY(d.created);
          const cyResolved = getY(d.resolved);
          const isHovered = hoveredIndex === i;

          const showLabel = data.length <= 10 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
          const labelParts = d.date.split('-');
          const shortDate = `${labelParts[2]}/${labelParts[1]}`;

          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {showLabel && (
                <text
                  x={cx}
                  y={height - 8}
                  fill="var(--text-secondary)"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {shortDate}
                </text>
              )}

              {/* Ponto: Criados */}
              <circle
                cx={cx}
                cy={cyCreated}
                r={isHovered ? 6 : 4}
                fill="#3b82f6"
                stroke="var(--bg-card)"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              />

              {/* Ponto: Resolvidos */}
              <circle
                cx={cx}
                cy={cyResolved}
                r={isHovered ? 6 : 4}
                fill="#10b981"
                stroke="var(--bg-card)"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip de Hover */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.8125rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Data: <strong>{data[hoveredIndex].date.split('-').reverse().join('/')}</strong>
          </span>
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>
            Criados: <strong>{data[hoveredIndex].created}</strong>
          </span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            Resolvidos: <strong>{data[hoveredIndex].resolved}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
