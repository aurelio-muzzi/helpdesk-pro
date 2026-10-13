import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('HelpDesk Pro - Application Routing & Auth Protection Tests', () => {
  it('redirects unauthenticated visitor to login page on root access', async () => {
    render(<App />);
    const submitButton = await screen.findByRole('button', { name: /Entrar no sistema/i });
    expect(submitButton).toBeInTheDocument();
    expect(screen.getByText('Acesse sua conta para gerenciar chamados e atendimento')).toBeInTheDocument();
  });

  it('has default dark mode set on document root', () => {
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
