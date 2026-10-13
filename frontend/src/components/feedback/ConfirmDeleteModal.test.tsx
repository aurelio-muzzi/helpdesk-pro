import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

describe('ConfirmDeleteModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    itemName: 'Limpeza de cache e resolução de lentidão no sistema ERP',
    itemType: 'o artigo',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(
      <ConfirmDeleteModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza título padrão, nome do item em destaque e aviso de irreversibilidade', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText('Ação crítica de exclusão')).toBeInTheDocument();
    expect(
      screen.getByText('"Limpeza de cache e resolução de lentidão no sistema ERP"')
    ).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza de que deseja remover o artigo\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Esta ação é definitiva e não poderá ser desfeita\./i)
    ).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão Cancelar', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('chama onClose ao clicar no botão X de fechar', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar modal/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('chama onClose ao pressionar a tecla Escape', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onConfirm ao clicar no botão de confirmação de exclusão', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    const confirmBtn = screen.getByRole('button', { name: /Excluir permanentemente/i });
    fireEvent.click(confirmBtn);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('desabilita os botões e exibe estado de carregamento quando isLoading for true', () => {
    render(<ConfirmDeleteModal {...defaultProps} isLoading={true} />);

    const confirmBtn = screen.getByRole('button', { name: /Excluindo\.\.\./i });
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    const closeBtn = screen.getByRole('button', { name: /Fechar modal/i });

    expect(confirmBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
    expect(closeBtn).toBeDisabled();

    // Escape não deve fechar enquanto estiver carregando
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('permite customizar textos, títulos e descrição', () => {
    render(
      <ConfirmDeleteModal
        {...defaultProps}
        title="Remover Categoria"
        confirmText="Sim, Deletar"
        cancelText="Voltar"
        description="Esta categoria contém 3 artigos vinculados."
      />
    );

    expect(screen.getByText('Remover Categoria')).toBeInTheDocument();
    expect(screen.getByText('Sim, Deletar')).toBeInTheDocument();
    expect(screen.getByText('Voltar')).toBeInTheDocument();
    expect(screen.getByText('Esta categoria contém 3 artigos vinculados.')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no backdrop escuro mas não ao clicar no corpo do modal', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    // Clicar no título não deve propagar para fechar
    const title = screen.getByText('Confirmar Exclusão');
    fireEvent.click(title);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1); // Não incrementou
  });
});
