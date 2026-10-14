import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SlaPoliciesPage from '../pages/SlaPoliciesPage';
import type { SlaPolicy } from '../types';

const mockPolicies: SlaPolicy[] = [
  {
    id: 1,
    name: 'SLA Crítico / Urgente',
    description: 'Incidentes que afetam toda a operação.',
    priority: { id: 1, name: 'urgente', display_name: 'Urgente', description: null, color: '#ef4444', order: 4, is_active: true, created_at: '', updated_at: '' },
    first_response_time_minutes: 15,
    resolution_time_minutes: 120,
    is_active: true,
  },
  {
    id: 2,
    name: 'SLA Padrão / Médio',
    description: 'Solicitações de impacto moderado.',
    priority: { id: 2, name: 'media', display_name: 'Média', description: null, color: '#3b82f6', order: 2, is_active: true, created_at: '', updated_at: '' },
    first_response_time_minutes: 240,
    resolution_time_minutes: 1440,
    is_active: true,
  },
];

vi.mock('../hooks/useSla', () => ({
  useSlaPolicies: () => ({
    data: mockPolicies,
    isLoading: false,
  }),
  useCreateSlaPolicy: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateSlaPolicy: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteSlaPolicy: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/teams/hooks/useOrganizational', () => ({
  usePriorities: () => ({
    data: [
      { id: 1, name: 'urgente', display_name: 'Urgente', description: null, color: '#ef4444', order: 4, is_active: true, created_at: '', updated_at: '' },
      { id: 2, name: 'media', display_name: 'Média', description: null, color: '#3b82f6', order: 2, is_active: true, created_at: '', updated_at: '' },
    ],
    isLoading: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SlaPoliciesPage Component', () => {
  it('renders SLA page header and KPI counters', () => {
    renderWithProviders(<SlaPoliciesPage />);

    expect(screen.getByRole('heading', { name: /Políticas de SLA/i })).toBeInTheDocument();
    expect(screen.getByText('Regras Ativas')).toBeInTheDocument();
    expect(screen.getByText('Resposta Mais Rápida')).toBeInTheDocument();
    expect(screen.getByText('Monitoramento')).toBeInTheDocument();
  });

  it('renders SLA policy cards with formatted times and priority badges', () => {
    renderWithProviders(<SlaPoliciesPage />);

    expect(screen.getByText('SLA Crítico / Urgente')).toBeInTheDocument();
    expect(screen.getAllByText('15 min').length).toBeGreaterThan(0);
    expect(screen.getByText('2h')).toBeInTheDocument();

    expect(screen.getByText('SLA Padrão / Médio')).toBeInTheDocument();
    expect(screen.getByText('4h')).toBeInTheDocument();
    expect(screen.getByText('24h (1 dia)')).toBeInTheDocument();
  });

  it('opens creation modal when clicking Nova Política de SLA button', () => {
    renderWithProviders(<SlaPoliciesPage />);

    const newBtn = screen.getByRole('button', { name: /Nova Política de SLA/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: /Nova Política de SLA/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: SLA Alta Severidade/i)).toBeInTheDocument();
  });

  it('opens confirmation modal when clicking delete button on policy card', () => {
    renderWithProviders(<SlaPoliciesPage />);

    const deleteBtns = screen.getAllByTitle(/Excluir política de SLA/i);
    expect(deleteBtns.length).toBeGreaterThan(0);
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Excluir Política de SLA/i })).toBeInTheDocument();
  });
});
