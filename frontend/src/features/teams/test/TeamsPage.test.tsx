import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamsPage from '../pages/TeamsPage';

// Mock hook responses
vi.mock('../hooks/useOrganizational', () => ({
  useDepartments: () => ({
    data: [
      { id: 1, name: 'Tecnologia da Informação', description: 'TI e Infraestrutura', is_active: true, teams_count: 2 },
      { id: 2, name: 'Recursos Humanos', description: 'RH e Pessoal', is_active: true, teams_count: 1 },
    ],
    isLoading: false,
  }),
  useTeams: () => ({
    data: [
      {
        id: 1,
        name: 'Suporte N1',
        description: 'Primeiro nível de atendimento',
        is_active: true,
        department: { id: 1, name: 'Tecnologia da Informação' },
        members: [{ id: 1, name: 'Agente Silva', email: 'agente@local' }],
      },
    ],
    isLoading: false,
  }),
  useUsers: () => ({
    data: [
      {
        id: 1,
        name: 'Carlos Solicitante',
        email: 'carlos@empresa.com',
        is_active: true,
        role: { id: 4, name: 'requester', display_name: 'Solicitante' },
        teams: [],
      },
      {
        id: 2,
        name: 'Agente Silva',
        email: 'agente@local',
        is_active: true,
        role: { id: 3, name: 'agent', display_name: 'Agente de Suporte' },
        teams: [{ id: 1, name: 'Suporte N1' }],
      },
    ],
    isLoading: false,
  }),
  useRoles: () => ({
    data: [
      { id: 1, name: 'admin', display_name: 'Administrador' },
      { id: 2, name: 'manager', display_name: 'Gerente' },
      { id: 3, name: 'agent', display_name: 'Agente de Suporte' },
      { id: 4, name: 'requester', display_name: 'Solicitante' },
    ],
    isLoading: false,
  }),
  useCreateUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateTeam: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTeam: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSyncTeamMembers: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCategories: () => ({
    data: [
      {
        id: 1,
        name: 'Hardware & Equipamentos',
        slug: 'hardware-equipamentos',
        description: 'Notebooks e periféricos',
        is_active: true,
        department: { id: 1, name: 'Tecnologia da Informação' },
      },
    ],
    isLoading: false,
  }),
  usePriorities: () => ({
    data: [
      {
        id: 1,
        name: 'alta',
        display_name: 'Alta',
        description: 'Impacto direto nas operações',
        order: 3,
        color: '#f59e0b',
        is_active: true,
      },
      {
        id: 2,
        name: 'urgente',
        display_name: 'Urgente / Crítica',
        description: 'Paralisação geral',
        order: 4,
        color: '#ef4444',
        is_active: true,
      },
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

describe('TeamsPage Component', () => {
  it('renders organizational structure header and KPI metrics', () => {
    renderWithProviders(<TeamsPage />);

    expect(screen.getByRole('heading', { name: /Estrutura Organizacional/i })).toBeInTheDocument();
    expect(screen.getByText('Equipes Ativas')).toBeInTheDocument();
    expect(screen.getByText('Usuários Registrados')).toBeInTheDocument();
    expect(screen.getAllByText(/Departamentos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Categorias/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Prioridades SLA')).toBeInTheDocument();
  });

  it('displays teams tab by default with team cards', () => {
    renderWithProviders(<TeamsPage />);

    expect(screen.getByText('Suporte N1')).toBeInTheDocument();
    expect(screen.getByText(/Primeiro nível de atendimento/i)).toBeInTheDocument();
    expect(screen.getByText(/1 membros/i)).toBeInTheDocument();
  });

  it('switches to users tab and displays registered users list including company requesters', () => {
    renderWithProviders(<TeamsPage />);

    const usersTab = screen.getByRole('button', { name: /Usuários/i });
    fireEvent.click(usersTab);

    expect(screen.getByText('Carlos Solicitante')).toBeInTheDocument();
    expect(screen.getByText('carlos@empresa.com')).toBeInTheDocument();
    expect(screen.getByText('Agente Silva')).toBeInTheDocument();
    expect(screen.getByText('agente@local')).toBeInTheDocument();
  });

  it('opens user creation modal when clicking Novo Usuário button on users tab', () => {
    renderWithProviders(<TeamsPage />);

    const usersTab = screen.getByRole('button', { name: /Usuários/i });
    fireEvent.click(usersTab);

    const newUserButton = screen.getByRole('button', { name: /Novo Usuário/i });
    fireEvent.click(newUserButton);

    expect(screen.getByRole('heading', { name: /Novo Usuário/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Beatriz Lima ou João da Silva/i)).toBeInTheDocument();
  });

  it('switches to departments tab and displays departments list', () => {
    renderWithProviders(<TeamsPage />);

    const deptTab = screen.getByRole('button', { name: /Departamentos/i });
    fireEvent.click(deptTab);

    expect(screen.getByText('Tecnologia da Informação')).toBeInTheDocument();
    expect(screen.getByText('Recursos Humanos')).toBeInTheDocument();
  });

  it('switches to categories tab and displays categories list', () => {
    renderWithProviders(<TeamsPage />);

    const catTab = screen.getByRole('button', { name: /Categorias/i });
    fireEvent.click(catTab);

    expect(screen.getByText('Hardware & Equipamentos')).toBeInTheDocument();
    expect(screen.getByText('hardware-equipamentos')).toBeInTheDocument();
  });

  it('switches to priorities tab and displays SLA priority badges', () => {
    renderWithProviders(<TeamsPage />);

    const prioTab = screen.getByRole('button', { name: /Prioridades/i });
    fireEvent.click(prioTab);

    expect(screen.getByText('ALTA')).toBeInTheDocument();
    expect(screen.getByText('URGENTE')).toBeInTheDocument();
  });
});
