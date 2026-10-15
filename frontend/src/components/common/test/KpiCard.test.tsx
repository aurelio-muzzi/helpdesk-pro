import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KpiCard } from '../KpiCard';

describe('KpiCard Component', () => {
  it('renders label, value and icon', () => {
    render(
      <KpiCard
        icon={<span data-testid="icon">ICON</span>}
        label="Total de Chamados"
        value={42}
      />
    );

    expect(screen.getByText('Total de Chamados')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders subtitle and handles click events', () => {
    const handleClick = vi.fn();
    render(
      <KpiCard
        icon={<span>ICON</span>}
        label="Em Aberto"
        value="5"
        subtitle="Aguardando triagem"
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Aguardando triagem')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Em Aberto'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
