import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../pages/DashboardPage';
import type { DashboardMetrics } from '../types';

const mockMetrics: DashboardMetrics = {
  period: { from: '2026-10-07', to: '2026-10-13' },
  summary: {
    total_tickets: 42,
    open_tickets: 10,
    in_progress_tickets: 12,
    pending_tickets: 4,
    resolved_tickets: 14,
    closed_tickets: 2,
    cancelled_tickets: 0,
    sla_breached: 2,
    sla_within: 14,
    sla_compliance_rate: 87.5,
    avg_first_response_minutes: 25,
    avg_resolution_minutes: 180,
  },
  tickets_by_status: [
    { status: 'open', label: 'Aberto', color: '#3b82f6', count: 10 },
    { status: 'in_progress', label: 'Em Atendimento', color: '#8b5cf6', count: 12 },
    { status: 'resolved', label: 'Resolvido', color: '#10b981', count: 14 },
  ],
  tickets_by_priority: [
    { id: 1, name: 'alta', display_name: 'Alta', color: '#ef4444', count: 15 },
    { id: 2, name: 'media', display_name: 'Média', color: '#f59e0b', count: 20 },
    { id: 3, name: 'baixa', display_name: 'Baixa', color: '#10b981', count: 7 },
  ],
  tickets_by_department: [
    { id: 1, name: 'Tecnologia da Informação', count: 28 },
    { id: 2, name: 'Recursos Humanos', count: 14 },
  ],
  volume_over_time: [
    { date: '2026-10-11', created: 5, resolved: 3 },
    { date: '2026-10-12', created: 8, resolved: 6 },
    { date: '2026-10-13', created: 12, resolved: 8 },
  ],
  agent_performance: [
    {
      id: 2,
      name: 'Carlos Atendente',
      email: 'carlos@helpdeskpro.local',
      assigned_count: 15,
      resolved_count: 12,
      resolution_rate: 80.0,
    },
  ],
  recent_tickets: [
    {
      id: 101,
      code: 'HD-2026-00101',
      title: 'Erro na emissão de NF-e',
      status: 'in_progress',
      status_label: 'Em Atendimento',
      status_color: '#8b5cf6',
      priority_name: 'Alta',
      priority_color: '#ef4444',
      requester_name: 'Ana Silva',
      assigned_name: 'Carlos Atendente',
      created_at: '2026-10-13T10:00:00Z',
    },
  ],
};

const mockMutate = vi.fn();

vi.mock('../hooks/useDashboard', () => ({
  useDashboardMetrics: () => ({
    data: mockMetrics,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    isFetching: false,
  }),
  useExportDashboardCsv: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock('@/features/teams/hooks/useOrganizational', () => ({
  useDepartments: () => ({
    data: [{ id: 1, name: 'Tecnologia da Informação' }],
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

describe('DashboardPage Component', () => {
  it('renders dashboard executive KPIs and formatted metrics', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /Painel Executivo & Métricas/i })).toBeInTheDocument();
    expect(screen.getByText('Total de Chamados')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('87.5%')).toBeInTheDocument();
    expect(screen.getByText('25 min')).toBeInTheDocument();
    expect(screen.getByText('3.0 hrs')).toBeInTheDocument();
  });

  it('renders chart sections, attendant productivity table, and recent tickets list', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Volume de Chamados no Período')).toBeInTheDocument();
    expect(screen.getByText('Distribuição por Status')).toBeInTheDocument();
    expect(screen.getByText('Chamados por Departamento')).toBeInTheDocument();
    expect(screen.getByText('Chamados por Severidade / Prioridade')).toBeInTheDocument();
    expect(screen.getByText('Produtividade da Equipe de Suporte')).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Atendente').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Erro na emissão de NF-e')).toBeInTheDocument();
    expect(screen.getByText('HD-2026-00101')).toBeInTheDocument();
  });

  it('triggers CSV export when clicking the export button', () => {
    renderWithProviders(<DashboardPage />);

    const exportBtn = screen.getByRole('button', { name: /Exportar CSV/i });
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        period: '7d',
      })
    );
  });
});
