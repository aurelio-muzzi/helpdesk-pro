import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../pages/LoginPage';

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

describe('LoginPage Component', () => {
  it('renders login form elements properly', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /HelpDesk Pro/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail profissional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha de acesso/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar no sistema/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting invalid email', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/E-mail profissional/i);
    const submitButton = screen.getByRole('button', { name: /Entrar no sistema/i });

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Formato de e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('prefills test credentials when quick button is clicked', async () => {
    renderWithProviders(<LoginPage />);

    const adminButton = screen.getByRole('button', { name: /^Admin$/i });
    await act(async () => {
      fireEvent.click(adminButton);
    });

    const emailInput = screen.getByLabelText(/E-mail profissional/i) as HTMLInputElement;
    expect(emailInput.value).toBe('admin@helpdeskpro.local');
  });
});
