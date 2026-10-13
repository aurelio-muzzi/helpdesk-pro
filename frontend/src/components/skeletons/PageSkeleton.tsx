import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div aria-busy="true" aria-label="Carregando conteúdo" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton" style={{ width: '220px', height: '28px', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: '340px', height: '16px', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* KPI Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '110px',
              borderRadius: 'var(--radius-md)',
            }}
          />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div
        className="skeleton"
        style={{
          height: '380px',
          borderRadius: 'var(--radius-md)',
        }}
      />
    </div>
  );
};
