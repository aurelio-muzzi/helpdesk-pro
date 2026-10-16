import React from 'react';

export type KpiColorVariant = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'gray';

export interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  variant?: KpiColorVariant;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const VARIANT_COLORS: Record<KpiColorVariant, { text: string; bg: string }> = {
  blue: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  purple: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  emerald: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  amber: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  rose: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  gray: { text: 'var(--text-secondary)', bg: 'var(--bg-muted)' },
};

/**
 * KpiCard - Componente visual padronizado para exibição de métricas executivas e contadores
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  color,
  variant = 'blue',
  subtitle,
  badge,
  onClick,
  style,
  className,
}) => {
  const resolvedColor = color || VARIANT_COLORS[variant]?.text || '#3b82f6';
  const resolvedBg = color ? `${color}18` : VARIANT_COLORS[variant]?.bg || 'rgba(59, 130, 246, 0.1)';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: resolvedBg,
          color: resolvedColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
          {badge}
        </div>
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginTop: '0.25rem',
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            lineHeight: 1.2,
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
