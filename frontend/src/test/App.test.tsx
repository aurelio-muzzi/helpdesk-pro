import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('HelpDesk Pro - Foundation Tests', () => {
  it('renders application brand in the navbar', () => {
    render(<App />);
    expect(screen.getByText('HelpDesk Pro')).toBeInTheDocument();
  });

  it('renders dashboard heading on initial route', async () => {
    render(<App />);
    const heading = await screen.findByText('Visão Geral do Service Desk');
    expect(heading).toBeInTheDocument();
  });

  it('has default dark mode set on document root', () => {
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
