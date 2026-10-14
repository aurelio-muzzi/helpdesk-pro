import React from 'react';

interface BrandIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ size = 32, className, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="HelpDesk Pro"
    >
      <defs>
        <linearGradient id="brand-hdp-bg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="brand-hdp-accent" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>

        <filter id="brand-hdp-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="0.8" floodColor="#0f172a" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Fundo Squircle com Borda de Vidro Suave */}
      <rect x="2" y="2" width="28" height="28" rx="7.5" fill="url(#brand-hdp-bg)" />
      <rect x="2" y="2" width="28" height="28" rx="7.5" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1" />

      {/* Arco Superior do Headset de Suporte */}
      <path
        d="M7.5 16C7.5 11 11.3 7 16 7C20.7 7 24.5 11 24.5 16"
        stroke="url(#brand-hdp-accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Almofadas / Fones Laterais */}
      <rect x="6" y="14.5" width="3" height="5" rx="1.5" fill="url(#brand-hdp-accent)" />
      <rect x="23" y="14.5" width="3" height="5" rx="1.5" fill="url(#brand-hdp-accent)" />

      {/* Haste do Microfone de Atendimento */}
      <path
        d="M23.5 18.5V20.5C23.5 21.8 22.4 22.8 21 22.8H18.8"
        stroke="url(#brand-hdp-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17.8" cy="22.8" r="1.2" fill="#38bdf8" />

      {/* Balão Central de Chamados (Ticket / Chat) */}
      <g filter="url(#brand-hdp-shadow)">
        <path
          d="M11 11.5C11 10.4 11.9 9.5 13 9.5H19C20.1 9.5 21 10.4 21 11.5V16C21 17.1 20.1 18 19 18H14.5L12 20V18C11.4 18 11 17.6 11 17V11.5Z"
          fill="#ffffff"
        />
        <path d="M13.5 12.8H18.5" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M13.5 15H16.8" stroke="#0ea5e9" strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </svg>
  );
};
