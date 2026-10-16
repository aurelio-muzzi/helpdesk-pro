import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TicketsPage from '../pages/TicketsPage';
import type { Ticket } from '../types';

const mockAssignMutate = vi.fn().mockResolvedValue({});

const mockTickets: Ticket[] = [
  {
    id: 1,
    code: 'HD-2026-00001',
    title: 'Notebook não liga',
    description: 'Tela preta ao ligar.',
    status: { value: 'open', label: 'Aberto', color: '#3b82f6', is_final: false },
    requester: { id: 10, name: 'João Solicitante', email: 'joao@local' },
    assigned_to: null,
    category: {
      id: 1,
      name: 'Hardware',
      slug: 'hardware',
      description: null,
      department_id: null,
      is_active: true,
      created_at: '2026-10-13',
      updated_at: '2026-10-13',
    },
    priority: {
      id: 2,
      name: 'alta',
      display_name: 'Alta',
      description: null,
      order: 3,
      color: '#f59e0b',
      is_active: true,
      created_at: '2026-10-13',
      updated_at: '2026-10-13',
    },
    created_at: '2026-10-13T10:00:00Z',
    updated_at: '2026-10-13T10:00:00Z',
  },
  {
    id: 2,
    code: 'HD-2026-00002',
    title: 'Erro de VPN',
    description: 'Falha no handshake.',
    status: { value: 'in_progress', label: 'Em Atendimento', color: '#8b5cf6', is_final: false },
    requester: { id: 11, name: 'Maria Comercial', email: 'maria@local' },
    assigned_to: { id: 5, name: 'Carlos Técnico', email: 'carlos@local' },
    category: {
      id: 2,
      name: 'VPN & Redes',
      slug: 'vpn',
      description: null,
      department_id: null,
      is_active: true,
      created_at: '2026-10-13',
      updated_at: '2026-10-13',
    },
    priority: {
      id: 1,
      name: 'media',
      display_name: 'Média',
      description: null,
      order: 2,
      color: '#3b82f6',
      is_active: true,
      created_at: '2026-10-13',
      updated_at: '2026-10-13',
    },
    created_at: '2026-10-13T11:00:00Z',
    updated_at: '2026-10-13T11:00:00Z',
  },
];

vi.mock('../hooks/useTickets', () => ({
  useTickets: () => ({
    data: mockTickets,
    isLoading: false,
  }),
  useChangeTicketStatus: () => ({
    mutateAsync: vi.fn(),
  }),
  useCreateTicket: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRateSatisfaction: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useReopenTicket: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useAssignTicket: () => ({
    mutateAsync: mockAssignMutate,
    isPending: false,
  }),
}));

vi.mock('@/features/teams/hooks/useOrganizational', () => ({
  usePriorities: () => ({
    data: [
      { id: 1, name: 'media', display_name: 'Média', color: '#3b82f6' },
      { id: 2, name: 'alta', display_name: 'Alta', color: '#f59e0b' },
    ],
  }),
  useCategories: () => ({
    data: [
      { id: 1, name: 'Hardware' },
      { id: 2, name: 'VPN & Redes' },
    ],
  }),
  useUsers: () => ({
    data: [
      { id: 5, name: 'Carlos Técnico', email: 'carlos@local' },
    ],
  }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 99,
      name: 'Beatriz Agente',
      email: 'beatriz@local',
      role: { id: 2, name: 'agent' as const, display_name: 'Agente' },
      is_active: true,
      permissions: [],
      created_at: '',
      updated_at: '',
    },
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

describe('TicketsPage Component', () => {
  it('renders tickets dashboard and KPI counters', () => {
    renderWithProviders(<TicketsPage />);

    expect(screen.getByRole('heading', { name: /Central de Chamados/i })).toBeInTheDocument();
    expect(screen.getByText('Total de Chamados')).toBeInTheDocument();
    expect(screen.getByText('Em Aberto (Triagem)')).toBeInTheDocument();
    expect(screen.getAllByText('Em Atendimento').length).toBeGreaterThan(0);
  });

  it('renders ticket rows with protocol codes and titles on both mobile cards and desktop table', () => {
    const { container } = renderWithProviders(<TicketsPage />);

    expect(screen.getAllByText('HD-2026-00001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Notebook não liga').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HD-2026-00002').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Erro de VPN').length).toBeGreaterThan(0);

    expect(container.querySelector('.ticket-mobile-view')).toBeInTheDocument();
    expect(container.querySelector('.ticket-desktop-view')).toBeInTheDocument();
  });

  it('filters tickets when searching by code or title', () => {
    renderWithProviders(<TicketsPage />);

    const searchInput = screen.getByPlaceholderText(/Buscar por código, título ou solicitante/i);
    fireEvent.change(searchInput, { target: { value: 'Notebook' } });

    expect(screen.getAllByText('Notebook não liga').length).toBeGreaterThan(0);
    expect(screen.queryByText('Erro de VPN')).not.toBeInTheDocument();
  });

  it('filters tickets when selecting assignee', () => {
    renderWithProviders(<TicketsPage />);

    const assigneeSelect = screen.getByDisplayValue('Todos os Responsáveis');
    expect(assigneeSelect).toBeInTheDocument();

    // Filtra pelo técnico Carlos Técnico (id: 5)
    fireEvent.change(assigneeSelect, { target: { value: '5' } });
    expect(screen.getAllByText('Erro de VPN').length).toBeGreaterThan(0);
    expect(screen.queryByText('Notebook não liga')).not.toBeInTheDocument();

    // Filtra por Não Atribuído
    fireEvent.change(assigneeSelect, { target: { value: 'unassigned' } });
    expect(screen.getAllByText('Notebook não liga').length).toBeGreaterThan(0);
    expect(screen.queryByText('Erro de VPN')).not.toBeInTheDocument();
  });

  it('opens new ticket modal when clicking Novo Chamado button', () => {
    renderWithProviders(<TicketsPage />);

    const newTicketButton = screen.getByRole('button', { name: /Novo Chamado/i });
    fireEvent.click(newTicketButton);

    expect(screen.getByRole('heading', { name: /Abertura de Novo Chamado/i })).toBeInTheDocument();
  });

  it('allows staff to take over / reassign ticket to themselves', async () => {
    renderWithProviders(<TicketsPage />);

    const takeOverButtons = screen.getAllByRole('button', { name: /Assumir/i });
    expect(takeOverButtons.length).toBeGreaterThan(0);

    fireEvent.click(takeOverButtons[0]);
    expect(mockAssignMutate).toHaveBeenCalled();
  });
});
