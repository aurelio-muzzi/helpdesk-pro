import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TicketTimeline from '../components/TicketTimeline';
import type { Ticket, TicketComment } from '../types';

const mockTicket: Ticket = {
  id: 1,
  code: 'HD-2026-00001',
  title: 'Notebook com defeito',
  description: 'Falha na inicialização',
  status: { value: 'in_progress', label: 'Em Atendimento', color: '#8b5cf6', is_final: false },
  requester: { id: 10, name: 'João Solicitante', email: 'joao@local' },
  category: { id: 1, department_id: null, name: 'Hardware', slug: 'hardware', description: null, is_active: true, created_at: '', updated_at: '' },
  priority: { id: 1, name: 'alta', display_name: 'Alta', description: null, order: 3, color: '#f59e0b', is_active: true, created_at: '', updated_at: '' },
  created_at: '2026-10-13T10:00:00Z',
  updated_at: '2026-10-13T10:00:00Z',
  histories: [
    { id: 1, ticket_id: 1, action: 'created', comment: 'Chamado aberto no sistema', created_at: '2026-10-13T10:00:00Z' },
    { id: 2, ticket_id: 1, action: 'status_changed', comment: 'Avançado para atendimento', created_at: '2026-10-13T10:30:00Z' },
  ],
};

const mockComments: TicketComment[] = [
  {
    id: 101,
    ticket_id: 1,
    content: 'Já realizamos a primeira inspeção na placa-mãe.',
    is_internal: false,
    user: { id: 2, name: 'Carlos Técnico', email: 'carlos@local', role: 'agent' },
    created_at: '2026-10-13T11:00:00Z',
    attachments: [
      {
        id: 50,
        ticket_id: 1,
        original_name: 'foto_placa.png',
        file_size: 204800,
        formatted_size: '200 KB',
        mime_type: 'image/png',
        download_url: 'http://localhost/download/50',
        created_at: '2026-10-13T11:00:00Z',
      },
    ],
  },
  {
    id: 102,
    ticket_id: 1,
    content: 'Nota técnica confidencial: peça de reposição encomendada.',
    is_internal: true,
    user: { id: 2, name: 'Carlos Técnico', email: 'carlos@local', role: 'agent' },
    created_at: '2026-10-13T11:15:00Z',
  },
];

vi.mock('../hooks/useComments', () => ({
  useTicketComments: () => ({
    data: mockComments,
    isLoading: false,
  }),
  useAddComment: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 2,
      name: 'Carlos Técnico',
      email: 'carlos@local',
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

describe('TicketTimeline Component', () => {
  it('renders conversation comments list with sender and message content', () => {
    renderWithProviders(<TicketTimeline ticket={mockTicket} />);

    expect(screen.getByText('Conversação (2)')).toBeInTheDocument();
    expect(screen.getByText(/Já realizamos a primeira inspeção na placa-mãe./i)).toBeInTheDocument();
  });

  it('identifies and highlights internal notes with specific badge', () => {
    renderWithProviders(<TicketTimeline ticket={mockTicket} />);

    expect(screen.getByText('NOTA INTERNA')).toBeInTheDocument();
    expect(screen.getByText(/Nota técnica confidencial: peça de reposição encomendada./i)).toBeInTheDocument();
  });

  it('renders attachment item with name and formatted size', () => {
    renderWithProviders(<TicketTimeline ticket={mockTicket} />);

    expect(screen.getByText('foto_placa.png')).toBeInTheDocument();
    expect(screen.getByText('(200 KB)')).toBeInTheDocument();
  });

  it('switches to audit history tab and displays historical actions', () => {
    renderWithProviders(<TicketTimeline ticket={mockTicket} />);

    const historyTab = screen.getByRole('button', { name: /Histórico/i });
    fireEvent.click(historyTab);

    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('Chamado aberto no sistema')).toBeInTheDocument();
    expect(screen.getByText('STATUS_CHANGED')).toBeInTheDocument();
  });
});
