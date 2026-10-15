import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransferTicketModal } from '../components/TransferTicketModal';
import type { Ticket } from '../types';

const mockTicket: Ticket = {
  id: 42,
  code: 'HD-2026-00042',
  title: 'Instabilidade de VPN',
  description: 'Queda constante.',
  status: { value: 'in_progress', label: 'Em Atendimento', color: '#8b5cf6', is_final: false },
  requester: { id: 10, name: 'Lucas Solicitante', email: 'lucas@empresa.com' },
  assigned_to: { id: 2, name: 'Agente 1', email: 'agente1@empresa.com' },
  category: { id: 1, name: 'Redes', slug: 'redes', description: null, department_id: null, is_active: true, created_at: '', updated_at: '' },
  priority: { id: 2, name: 'alta', display_name: 'Alta', description: null, color: '#f59e0b', is_active: true, order: 2, created_at: '', updated_at: '' },
  created_at: '2026-10-15T08:00:00Z',
  updated_at: '2026-10-15T08:00:00Z',
};

const mockMutateAsync = vi.fn();

vi.mock('../hooks/useTickets', () => ({
  useAssignTicket: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/features/teams/hooks/useOrganizational', () => ({
  useUsers: () => ({
    data: [
      { id: 2, name: 'Agente 1', email: 'agente1@empresa.com', role: { name: 'agent' } },
      { id: 3, name: 'Agente 2', email: 'agente2@empresa.com', role: { name: 'agent' } },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 3, name: 'Agente 2', email: 'agente2@empresa.com', role: { name: 'agent' } },
  }),
}));

describe('TransferTicketModal', () => {
  it('renders modal with ticket info and agents list', () => {
    render(<TransferTicketModal ticket={mockTicket} onClose={vi.fn()} />);

    expect(screen.getByText('Transferir Chamado')).toBeInTheDocument();
    expect(screen.getByText('Protocolo: HD-2026-00042')).toBeInTheDocument();
    expect(screen.getByText('Agente 1')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('submits transfer to selected agent with comment', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <TransferTicketModal
        ticket={mockTicket}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '3' } });

    const commentInput = screen.getByPlaceholderText(/Não foi possível reproduzir/i);
    fireEvent.change(commentInput, { target: { value: 'Assumindo para verificar rotas de VPN.' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar Transferência/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 42,
        payload: {
          assigned_to: 3,
          comment: 'Assumindo para verificar rotas de VPN.',
        },
      });
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
