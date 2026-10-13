import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import type { KnowledgeArticle } from '../types';

const mockArticles: KnowledgeArticle[] = [
  {
    id: 1,
    title: 'Como configurar cliente VPN OpenVPN',
    slug: 'como-configurar-cliente-vpn-openvpn',
    summary: 'Guia completo para conexão remota segura via VPN corporativa.',
    content: 'Passo 1: Baixe o arquivo de configuração.\nPasso 2: Importe no cliente VPN.',
    category_id: 1,
    category: { id: 1, name: 'VPN & Redes', slug: 'vpn-redes' },
    author_id: 1,
    author: { id: 1, name: 'Admin Geral', avatar_url: null },
    is_published: true,
    is_internal: false,
    views_count: 150,
    helpful_count: 42,
    not_helpful_count: 2,
    created_at: '2026-10-10T12:00:00Z',
    updated_at: '2026-10-10T12:00:00Z',
  },
  {
    id: 2,
    title: 'Procedimento Interno de Diagnóstico de Hardware',
    slug: 'procedimento-interno-de-diagnostico-de-hardware',
    summary: 'Fluxo para analistas N1/N2.',
    content: 'Instruções internas confidenciais.',
    category_id: 2,
    category: { id: 2, name: 'Hardware', slug: 'hardware' },
    author_id: 1,
    author: { id: 1, name: 'Admin Geral', avatar_url: null },
    is_published: true,
    is_internal: true,
    views_count: 25,
    helpful_count: 10,
    not_helpful_count: 0,
    created_at: '2026-10-11T12:00:00Z',
    updated_at: '2026-10-11T12:00:00Z',
  },
];

const mockFeedbackMutate = vi.fn();
const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('../hooks/useKnowledgeBase', () => ({
  useArticles: () => ({
    data: mockArticles,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useDeleteArticle: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
  useArticleFeedback: () => ({
    mutate: mockFeedbackMutate,
    isPending: false,
  }),
  useCreateArticle: () => ({
    mutate: mockCreateMutate,
    isPending: false,
  }),
  useUpdateArticle: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/teams/hooks/useOrganizational', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'VPN & Redes' },
      { id: 2, name: 'Hardware' },
    ],
  }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Admin Teste',
      role: { name: 'admin' },
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

describe('KnowledgeBasePage Component', () => {
  it('renders hero search banner, category tabs, and article cards', () => {
    renderWithProviders(<KnowledgeBasePage />);

    expect(screen.getByText('Central de Ajuda & Autoatendimento')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Como podemos ajudar você hoje\?/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite palavras-chave/i)).toBeInTheDocument();

    expect(screen.getByText('Como configurar cliente VPN OpenVPN')).toBeInTheDocument();
    expect(screen.getByText('Procedimento Interno de Diagnóstico de Hardware')).toBeInTheDocument();
    expect(screen.getAllByText('VPN & Redes').length).toBeGreaterThanOrEqual(1);
  });

  it('opens ArticleReaderModal when clicking on an article card', () => {
    renderWithProviders(<KnowledgeBasePage />);

    const articleTitle = screen.getByText('Como configurar cliente VPN OpenVPN');
    fireEvent.click(articleTitle);

    expect(screen.getByText(/Passo 1: Baixe o arquivo de configuração/i)).toBeInTheDocument();
    expect(screen.getByText('Este artigo foi útil?')).toBeInTheDocument();
  });

  it('submits helpful feedback inside the reader modal', () => {
    renderWithProviders(<KnowledgeBasePage />);

    const readBtn = screen.getAllByRole('button', { name: /Ler/i })[0];
    fireEvent.click(readBtn);

    const yesBtn = screen.getByRole('button', { name: /Sim/i });
    expect(yesBtn).toBeInTheDocument();

    fireEvent.click(yesBtn);
    expect(mockFeedbackMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isHelpful: true,
      }),
      expect.anything()
    );
  });

  it('allows staff to open create article modal', () => {
    renderWithProviders(<KnowledgeBasePage />);

    const newBtn = screen.getByRole('button', { name: /Novo Artigo/i });
    expect(newBtn).toBeInTheDocument();

    fireEvent.click(newBtn);
    expect(screen.getByText('Novo Artigo de Conhecimento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: Como configurar acesso à VPN/i)).toBeInTheDocument();
  });

  it('opens ConfirmDeleteModal when clicking delete button on article and triggers delete on confirmation', () => {
    renderWithProviders(<KnowledgeBasePage />);

    const deleteBtn = screen.getAllByTitle('Excluir artigo')[0];
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText('"Como configurar cliente VPN OpenVPN"')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Excluir permanentemente/i });
    fireEvent.click(confirmBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.anything());
  });
});
