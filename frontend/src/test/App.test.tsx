import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('@/features/auth/services/authService', () => ({
  authService: {
    getMe: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('HelpDesk Pro - Application Routing & Auth Protection Tests', () => {
  it('redirects unauthenticated visitor to login page on root access', async () => {
    render(<App />);
    const submitButton = await screen.findByRole('button', { name: /Entrar no sistema/i }, { timeout: 5000 });
    expect(submitButton).toBeInTheDocument();
    expect(screen.getByText('Acesse sua conta para gerenciar chamados e atendimento')).toBeInTheDocument();
  });

  it('has default dark mode set on document root', () => {
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
