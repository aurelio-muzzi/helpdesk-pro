import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar, SearchInput, FilterSelect } from '../FilterBar';

describe('FilterBar Components', () => {
  it('renders FilterBar container with children', () => {
    render(
      <FilterBar>
        <div>Item 1</div>
        <div>Item 2</div>
      </FilterBar>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders SearchInput with icon and handles value changes', () => {
    const handleChange = vi.fn();
    render(
      <SearchInput
        placeholder="Buscar itens..."
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar itens...');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'teste' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders FilterSelect with options array and handles change', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Ativos' },
    ];

    render(
      <FilterSelect
        icon={true}
        value="all"
        onChange={handleChange}
        options={options}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Ativos')).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'active' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders compound FilterBar.Search and FilterBar.Select with children options', () => {
    render(
      <FilterBar>
        <FilterBar.Search placeholder="Busca Composta" />
        <FilterBar.Select>
          <option value="1">Opção 1</option>
          <option value="2">Opção 2</option>
        </FilterBar.Select>
      </FilterBar>
    );

    expect(screen.getByPlaceholderText('Busca Composta')).toBeInTheDocument();
    expect(screen.getByText('Opção 1')).toBeInTheDocument();
  });
});
