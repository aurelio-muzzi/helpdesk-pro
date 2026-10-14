import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';

let mockCurrentUser: {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string; display_name: string };
} | null = null;

const mockOpenTickets = [
  {
    id: 101,
    code: 'HD-2026-00004',
    title: 'Portal de Vendas 502 Bad Gateway',
    description: 'Falha de conexão',
    status: { value: 'open', label: 'Aberto', color: '#3b82f6', is_final: false },
    requester: { id: 2, name: 'Camila Santos', email: 'camila@empresa.com' },
    priority: { id: 1, name: 'urgente', display_name: 'Urgente', color: '#ef4444' },
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    code: 'HD-2026-00002',
    title: 'Lentidão no ERP Protheus',
    description: 'Relatórios travando',
    status: { value: 'open', label: 'Aberto', color: '#3b82f6', is_final: false },
    requester: { id: 3, name: 'Rodrigo Alves', email: 'rodrigo@empresa.com' },
    priority: { id: 2, name: 'alta', display_name: 'Alta', color: '#f59e0b' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    logout: vi.fn(),
    isLoggingOut: false,
  }),
}));

vi.mock('@/features/tickets/hooks/useTickets', () => ({
  useTickets: () => ({
    data: mockOpenTickets,
    isLoading: false,
  }),
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component - Notification Bell & Open Tickets Alerts', () => {
  it('does NOT display the notification bell when user is a requester', () => {
    mockCurrentUser = {
      id: 10,
      name: 'Lucas Solicitante',
      email: 'requester@helpdeskpro.local',
      role: { id: 4, name: 'requester', display_name: 'Solicitante' },
    };

    renderNavbar();

    expect(screen.queryByLabelText(/Notificações de chamados/i)).not.toBeInTheDocument();
  });

  it('displays the notification bell with open tickets count and dropdown alerts for staff (agent, admin, manager)', () => {
    mockCurrentUser = {
      id: 2,
      name: 'Beatriz Agente',
      email: 'agent@helpdeskpro.local',
      role: { id: 3, name: 'agent', display_name: 'Agente de Suporte' },
    };

    renderNavbar();

    const bellBtn = screen.getByLabelText(/Notificações de chamados/i);
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 chamados em aberto

    // Abre o dropdown ao clicar no sino
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Chamados em Aberto \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('HD-2026-00004')).toBeInTheDocument();
    expect(screen.getByText('Portal de Vendas 502 Bad Gateway')).toBeInTheDocument();
    expect(screen.getByText('HD-2026-00002')).toBeInTheDocument();
    expect(screen.getByText('Lentidão no ERP Protheus')).toBeInTheDocument();
    expect(screen.getByText(/Ver Central de Chamados/i)).toBeInTheDocument();
  });
});
