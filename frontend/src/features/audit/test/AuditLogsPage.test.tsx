import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import type { AuditLogsResponse } from '../types';

const mockLogsResponse: AuditLogsResponse = {
  data: [
    {
      id: 1,
      event: 'auth.login',
      description: 'Usuário Admin Sistema (admin@helpdeskpro.local) autenticado com sucesso.',
      auditable_type: 'App\\Models\\User',
      auditable_id: 1,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      old_values: null,
      new_values: null,
      created_at: '2026-10-13T12:00:00Z',
      user: {
        id: 1,
        name: 'Admin Sistema',
        email: 'admin@helpdeskpro.local',
        role: 'admin',
      },
    },
    {
      id: 2,
      event: 'ticket.status_changed',
      description: 'Status do chamado HD-2026-00001 alterado de Aberto para Em Atendimento.',
      auditable_type: 'App\\Models\\Ticket',
      auditable_id: 10,
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      old_values: { status: 'open' },
      new_values: { status: 'in_progress' },
      created_at: '2026-10-13T12:15:00Z',
      user: {
        id: 2,
        name: 'Carlos Atendente',
        email: 'carlos@helpdeskpro.local',
        role: 'agent',
      },
    },
  ],
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: 15,
    to: 2,
    total: 2,
  },
};

const mockRefetch = vi.fn();

let mockCurrentUser = {
  id: 1,
  name: 'Admin Sistema',
  email: 'admin@helpdeskpro.local',
  role: { id: 1, name: 'admin', display_name: 'Administrador' },
};

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: true,
  }),
}));

vi.mock('../hooks/useAuditLogs', () => ({
  useAuditLogs: () => ({
    data: mockLogsResponse,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    isFetching: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('AuditLogsPage Component', () => {
  it('renders audit logs page with KPIs and event list for administrators', () => {
    mockCurrentUser = {
      id: 1,
      name: 'Admin Sistema',
      email: 'admin@helpdeskpro.local',
      role: { id: 1, name: 'admin', display_name: 'Administrador' },
    };

    renderWithProviders(<AuditLogsPage />);

    expect(screen.getByRole('heading', { name: /Trilha de Auditoria & Segurança/i })).toBeInTheDocument();
    expect(screen.getByText('Total de Registros')).toBeInTheDocument();
    expect(screen.getByText('auth.login')).toBeInTheDocument();
    expect(screen.getByText('ticket.status_changed')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
  });

  it('filters audit logs using the category dropdown', () => {
    renderWithProviders(<AuditLogsPage />);

    const select = screen.getByRole('combobox', { name: /Filtro de Eventos/i });
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'ticket.*' } });
    expect(select).toHaveValue('ticket.*');
  });

  it('opens and closes audit details modal when clicking Detalhes', () => {
    renderWithProviders(<AuditLogsPage />);

    const detailButtons = screen.getAllByRole('button', { name: /Detalhes/i });
    expect(detailButtons.length).toBeGreaterThan(0);

    fireEvent.click(detailButtons[1]); // Detalhes do segundo evento

    expect(screen.getByText('Detalhes do Registro de Auditoria')).toBeInTheDocument();
    expect(screen.getByText(/Valores Anteriores/i)).toBeInTheDocument();
    expect(screen.getByText(/Novos Valores/i)).toBeInTheDocument();

    const closeBtn = screen.getAllByRole('button', { name: 'Fechar' })[0];
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Detalhes do Registro de Auditoria')).not.toBeInTheDocument();
  });

  it('renders restricted access screen when user is not an admin', () => {
    mockCurrentUser = {
      id: 5,
      name: 'Cliente Comum',
      email: 'cliente@helpdeskpro.local',
      role: { id: 4, name: 'requester', display_name: 'Solicitante' },
    };

    renderWithProviders(<AuditLogsPage />);

    expect(screen.getByRole('heading', { name: /Acesso Restrito/i })).toBeInTheDocument();
    expect(screen.getByText(/A Trilha de Auditoria e Logs de Segurança é reservada exclusivamente para Administradores/i)).toBeInTheDocument();
    expect(screen.queryByText('Total de Registros')).not.toBeInTheDocument();
  });
});
