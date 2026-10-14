import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

let mockCurrentUser: {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string; display_name: string };
} | null = null;

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: !!mockCurrentUser,
  }),
}));

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar Component - Role-Based Navigation Menu', () => {
  it('displays ONLY Chamados and Base de Conhecimento when user role is requester', () => {
    mockCurrentUser = {
      id: 10,
      name: 'Lucas Solicitante',
      email: 'requester@helpdeskpro.local',
      role: { id: 4, name: 'requester', display_name: 'Solicitante' },
    };

    renderSidebar();

    // Deve ver apenas Chamados e Base de Conhecimento
    expect(screen.getByRole('link', { name: /Chamados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Base de Conhecimento/i })).toBeInTheDocument();

    // NÃO deve ver Dashboard nem os menus restritos de gestão
    expect(screen.queryByRole('link', { name: /^Dashboard$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Equipes & Usuários/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Políticas de SLA/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Auditoria & Logs/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Configurações/i })).not.toBeInTheDocument();
  });

  it('displays Dashboard and all admin menus when user role is admin', () => {
    mockCurrentUser = {
      id: 1,
      name: 'Admin Geral',
      email: 'admin@helpdeskpro.local',
      role: { id: 1, name: 'admin', display_name: 'Administrador' },
    };

    renderSidebar();

    expect(screen.getByRole('link', { name: /^Dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chamados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Base de Conhecimento/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Equipes & Usuários/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Políticas de SLA/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Auditoria & Logs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Configurações/i })).toBeInTheDocument();
  });
});
