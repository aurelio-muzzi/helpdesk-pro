import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TicketDetailDrawer } from '../components/TicketDetailDrawer';
import type { Ticket } from '../types';
import type { User } from '@/features/auth/types';

vi.mock('../components/TicketTimeline', () => ({
  TicketTimeline: () => <div data-testid="ticket-timeline">Timeline Component</div>,
}));

const mockTicket: Ticket = {
  id: 101,
  code: 'HD-2026-00101',
  title: 'Problema no Servidor Web',
  description: 'Erro 500 no carregamento do portal.',
  status: { value: 'in_progress', label: 'Em Atendimento', color: '#3b82f6', is_final: false },
  priority: {
    id: 1,
    name: 'alta',
    display_name: 'Alta Prioridade',
    description: null,
    color: '#ef4444',
    is_active: true,
    order: 1,
    created_at: '',
    updated_at: '',
  },
  category: {
    id: 2,
    name: 'Infraestrutura',
    slug: 'infra',
    description: null,
    department_id: null,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  requester: { id: 10, name: 'Carlos Solicitante', email: 'carlos@empresa.com' },
  assigned_to: { id: 20, name: 'Mariana Agente', email: 'mariana@empresa.com' },
  created_at: '2026-10-15T09:00:00Z',
  updated_at: '2026-10-15T09:30:00Z',
};

const mockStaffUser: User = {
  id: 30,
  name: 'Roberto Outro Agente',
  email: 'roberto@empresa.com',
  is_active: true,
  role: { id: 2, name: 'agent', display_name: 'Agente' },
  permissions: [],
  created_at: '',
  updated_at: '',
};

describe('TicketDetailDrawer', () => {
  it('renders ticket details correctly', () => {
    render(
      <TicketDetailDrawer
        ticket={mockTicket}
        onClose={vi.fn()}
        isStaff={true}
        currentUser={mockStaffUser}
      />
    );

    expect(screen.getByText('HD-2026-00101')).toBeInTheDocument();
    expect(screen.getByText('Problema no Servidor Web')).toBeInTheDocument();
    expect(screen.getByText('Erro 500 no carregamento do portal.')).toBeInTheDocument();
    expect(screen.getByText('Carlos Solicitante')).toBeInTheDocument();
    expect(screen.getByText('Mariana Agente')).toBeInTheDocument();
    expect(screen.getByText('Alta Prioridade')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-timeline')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TicketDetailDrawer
        ticket={mockTicket}
        onClose={handleClose}
        isStaff={true}
        currentUser={mockStaffUser}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Fechar detalhes/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onAssignToMe and onTransfer when clicked by a staff user', () => {
    const handleAssignToMe = vi.fn();
    const handleTransfer = vi.fn();

    render(
      <TicketDetailDrawer
        ticket={mockTicket}
        onClose={vi.fn()}
        isStaff={true}
        currentUser={mockStaffUser}
        onAssignToMe={handleAssignToMe}
        onTransfer={handleTransfer}
      />
    );

    const assignBtn = screen.getByRole('button', { name: /Assumir Atendimento/i });
    fireEvent.click(assignBtn);
    expect(handleAssignToMe).toHaveBeenCalledWith(mockTicket);

    const transferBtn = screen.getByRole('button', { name: /Transferir\.\.\./i });
    fireEvent.click(transferBtn);
    expect(handleTransfer).toHaveBeenCalledWith(mockTicket);
  });

  it('shows CSAT evaluation and Reopen button for resolved tickets', () => {
    const resolvedTicket: Ticket = {
      ...mockTicket,
      status: { value: 'resolved', label: 'Resolvido', color: '#10b981', is_final: false },
    };
    const requesterUser: User = {
      id: 10,
      name: 'Carlos Solicitante',
      email: 'carlos@empresa.com',
      is_active: true,
      role: { id: 4, name: 'requester', display_name: 'Solicitante' },
      permissions: [],
      created_at: '',
      updated_at: '',
    };

    const handleRate = vi.fn();
    const handleReopen = vi.fn();

    render(
      <TicketDetailDrawer
        ticket={resolvedTicket}
        onClose={vi.fn()}
        isStaff={false}
        currentUser={requesterUser}
        onRate={handleRate}
        onReopen={handleReopen}
      />
    );

    const rateBtn = screen.getByRole('button', { name: /Avaliar Atendimento \(CSAT\)/i });
    fireEvent.click(rateBtn);
    expect(handleRate).toHaveBeenCalledWith(resolvedTicket);

    const reopenBtn = screen.getByRole('button', { name: /Reabrir Chamado/i });
    fireEvent.click(reopenBtn);
    expect(handleReopen).toHaveBeenCalledWith(resolvedTicket);
  });
});
