import React from 'react';
import { Search, Filter } from 'lucide-react';

/* ==========================================================================
 * FilterBar - Container flexível para barras de busca e filtros
 * ========================================================================== */

export interface FilterBarProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  iconSize?: number;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode | boolean;
  options?: FilterSelectOption[];
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}

/**
 * SearchInput - Input de busca estilizado com ícone
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  iconSize = 16,
  containerStyle,
  containerClassName,
  style,
  ...props
}) => {
  return (
    <div
      className={containerClassName}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.75rem',
        flex: '1 1 240px',
        minHeight: '40px',
        boxSizing: 'border-box',
        ...containerStyle,
      }}
    >
      <Search size={iconSize} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        type="text"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          width: '100%',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          ...style,
        }}
        {...props}
      />
    </div>
  );
};

/**
 * FilterSelect - Select customizado com suporte a ícone e opções flexíveis
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  icon,
  options,
  children,
  containerStyle,
  containerClassName,
  style,
  ...props
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'boolean') {
      return <Filter size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />;
    }
    return icon;
  };

  return (
    <div
      className={containerClassName}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: '1 1 160px',
        ...containerStyle,
      }}
    >
      {renderIcon()}
      <select
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          minHeight: '40px',
          width: '100%',
          outline: 'none',
          ...style,
        }}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    </div>
  );
};

/**
 * FilterBar - Container principal com layout responsivo e tokens do design system
 */
export const FilterBar: React.FC<FilterBarProps> & {
  Search: typeof SearchInput;
  Select: typeof FilterSelect;
} = ({ children, style, className }) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        backgroundColor: 'var(--bg-card)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

FilterBar.Search = SearchInput;
FilterBar.Select = FilterSelect;
