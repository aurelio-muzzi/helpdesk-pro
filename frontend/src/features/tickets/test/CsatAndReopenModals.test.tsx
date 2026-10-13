import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CsatModal } from '../components/CsatModal';
import { ReopenTicketModal } from '../components/ReopenTicketModal';
import { SatisfactionBadge } from '../components/SatisfactionBadge';
import type { Ticket } from '../types';

const mockRateMutate = vi.fn();
const mockReopenMutate = vi.fn();

vi.mock('../hooks/useTickets', () => ({
  useRateSatisfaction: () => ({
    mutate: mockRateMutate,
    mutateAsync: mockRateMutate,
    isPending: false,
  }),
  useReopenTicket: () => ({
    mutate: mockReopenMutate,
    mutateAsync: mockReopenMutate,
    isPending: false,
  }),
}));

const sampleTicket: Ticket = {
  id: 10,
  code: 'HD-2026-00010',
  title: 'Problema no mouse',
  description: 'Mouse parou de funcionar',
  status: { value: 'resolved', label: 'Resolvido', color: '#10b981', is_final: false },
  requester: { id: 1, name: 'João Solicitante', email: 'joao@example.com' },
  assigned_to: { id: 2, name: 'Técnico Suporte', email: 'tecnico@example.com' },
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
    id: 1,
    name: 'baixa',
    display_name: 'Baixa',
    description: null,
    order: 1,
    color: '#10b981',
    is_active: true,
    created_at: '2026-10-13',
    updated_at: '2026-10-13',
  },
  created_at: '2026-10-13T10:00:00Z',
  updated_at: '2026-10-13T11:00:00Z',
};

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('SatisfactionBadge Component', () => {
  it('renders rating stars and satisfaction score', () => {
    render(
      <SatisfactionBadge
        satisfaction={{
          id: 1,
          rating: 5,
          comment: 'Excelente atendimento!',
          created_at: '2026-10-13T11:30:00Z',
        }}
      />
    );

    expect(screen.getByText('5/5')).toBeInTheDocument();
  });
});

describe('CsatModal Component', () => {
  it('renders rating buttons and handles submission', async () => {
    const handleClose = vi.fn();

    renderWithClient(<CsatModal ticket={sampleTicket} onClose={handleClose} />);

    expect(screen.getByText('Avaliar Atendimento (CSAT)')).toBeInTheDocument();
    expect(screen.getByText(/Como você avalia a solução e a presteza do atendimento/i)).toBeInTheDocument();

    // Encontra botões de estrelas (1 a 5)
    const star5Button = screen.getByLabelText('Avaliar 5 estrelas');
    fireEvent.click(star5Button);

    const commentInput = screen.getByPlaceholderText(/Conte-nos o que achou da agilidade/i);
    fireEvent.change(commentInput, { target: { value: 'Atendimento muito ágil e eficiente!' } });

    const submitBtn = screen.getByRole('button', { name: /Enviar Avaliação/i });
    fireEvent.click(submitBtn);

    expect(mockRateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: sampleTicket.id,
        rating: 5,
        comment: 'Atendimento muito ágil e eficiente!',
      }),
      expect.any(Object)
    );
  });
});

describe('ReopenTicketModal Component', () => {
  it('renders reason textarea and handles reopen submission', async () => {
    const handleClose = vi.fn();
    mockReopenMutate.mockResolvedValueOnce({ id: 10, status: { value: 'in_progress' } });

    renderWithClient(<ReopenTicketModal ticket={sampleTicket} onClose={handleClose} />);

    expect(screen.getByText('Reabrir Chamado')).toBeInTheDocument();
    expect(screen.getByText(/Caso o problema persista ou a solução apresentada não tenha resolvido/i)).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Ex: O problema voltou a acontecer/i);
    fireEvent.change(reasonInput, { target: { value: 'O equipamento ainda apresenta falhas intermitentes.' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar Reabertura/i });
    fireEvent.click(submitBtn);

    expect(mockReopenMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: sampleTicket.id,
        reason: 'O equipamento ainda apresenta falhas intermitentes.',
      }),
      expect.any(Object)
    );
  });
});
