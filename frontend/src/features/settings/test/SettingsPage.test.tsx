import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPage } from '../pages/SettingsPage';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Admin Sistema',
      email: 'admin@helpdeskpro.local',
      role: 'admin',
    },
    isAuthenticated: true,
  }),
}));

const mockToggleTheme = vi.fn();
vi.mock('@/stores/useThemeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o cabeçalho de configurações e status do sistema', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Configurações do Sistema')).toBeInTheDocument();
    expect(screen.getByText(/Parâmetros globais, políticas operacionais/i)).toBeInTheDocument();
    expect(screen.getByText(/Banco de Dados Conectado:/i)).toBeInTheDocument();
    expect(screen.getByText(/MySQL 8.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Redis 7.0/i)).toBeInTheDocument();
  });

  it('exibe a aba Geral por padrão com os campos principais', () => {
    render(<SettingsPage />);

    expect(screen.getByDisplayValue('HelpDesk Pro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://localhost:8088')).toBeInTheDocument();
  });

  it('permite alternar entre as abas de configuração', () => {
    render(<SettingsPage />);

    // Alterna para Atendimento & SLA
    const serviceTab = screen.getByRole('button', { name: /Atendimento & SLA/i });
    fireEvent.click(serviceTab);
    expect(screen.getByText('Parâmetros de SLA & Ciclo de Atendimento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();

    // Alterna para Segurança & Sessão
    const securityTab = screen.getByRole('button', { name: /Segurança & Sessão/i });
    fireEvent.click(securityTab);
    expect(screen.getByText('Políticas de Autenticação & Trilha de Auditoria')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();

    // Alterna para Notificações & E-mail
    const notifTab = screen.getByRole('button', { name: /Notificações & E-mail/i });
    fireEvent.click(notifTab);
    expect(screen.getByText('Canais de Notificação & Servidor de E-mail')).toBeInTheDocument();
    expect(screen.getByDisplayValue('no-reply@helpdeskpro.local')).toBeInTheDocument();

    // Alterna para Aparência
    const appearanceTab = screen.getByRole('button', { name: /Aparência/i });
    fireEvent.click(appearanceTab);
    expect(screen.getByText('Tema da Interface')).toBeInTheDocument();
  });

  it('permite alternar o tema da interface na aba de Aparência', () => {
    render(<SettingsPage />);

    const appearanceTab = screen.getByRole('button', { name: /Aparência/i });
    fireEvent.click(appearanceTab);

    const darkButton = screen.getByRole('button', { name: /Modo Escuro \(Dark Mode\)/i });
    fireEvent.click(darkButton);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('dispara o salvamento e exibe o feedback visual de sucesso', () => {
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: /Salvar Configurações/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Configurações salvas com sucesso!')).toBeInTheDocument();
  });
});
