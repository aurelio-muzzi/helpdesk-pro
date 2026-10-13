import React, { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  /** Se o modal está visível */
  isOpen: boolean;
  /** Função chamada ao fechar ou cancelar */
  onClose: () => void;
  /** Função chamada ao confirmar a exclusão */
  onConfirm: () => void | Promise<void>;
  /** Título principal do modal. Padrão: "Confirmar Exclusão" */
  title?: string;
  /** Nome ou identificador do item a ser excluído (exibido em destaque) */
  itemName?: string;
  /** Rótulo do tipo de item (ex: "o artigo", "o chamado", "o usuário"). Padrão: "este registro" */
  itemType?: string;
  /** Mensagem descritiva customizada (substitui a mensagem padrão) */
  description?: React.ReactNode;
  /** Texto do botão de exclusão. Padrão: "Excluir permanentemente" */
  confirmText?: string;
  /** Texto do botão de cancelamento. Padrão: "Cancelar" */
  cancelText?: string;
  /** Se a operação de exclusão está em andamento */
  isLoading?: boolean;
  /** Nível de alerta visual: 'danger' (vermelho) ou 'warning' (âmbar). Padrão: 'danger' */
  severity?: 'danger' | 'warning';
  /** Se deve exibir o aviso de irreversibilidade. Padrão: true */
  showIrreversibleWarning?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  itemName,
  itemType = 'este registro',
  description,
  confirmText = 'Excluir permanentemente',
  cancelText = 'Cancelar',
  isLoading = false,
  severity = 'danger',
  showIrreversibleWarning = true,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Bloqueia scroll do body e foca no botão cancelar para prevenir exclusão acidental
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Suporte à tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = severity === 'danger';
  const accentColor = isDanger ? 'var(--danger)' : 'var(--warning)';
  const accentBg = isDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)';
  const accentBorder = isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.5))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de destaque superior com gradiente sutil */}
        <div
          style={{
            height: '4px',
            width: '100%',
            backgroundColor: accentColor,
          }}
        />

        <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
          {/* Header com ícone e botão fechar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: accentBg,
                  border: `1px solid ${accentBorder}`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
              </div>

              <div>
                <h3
                  id="confirm-delete-title"
                  style={{
                    fontSize: '1.1875rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Ação crítica de exclusão
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Fechar modal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Conteúdo do corpo */}
          <div
            id="confirm-delete-desc"
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {description ? (
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {description}
              </div>
            ) : (
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Tem certeza de que deseja remover {itemType}?
              </p>
            )}

            {/* Caixa com o nome do item em destaque */}
            {itemName && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: accentColor,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                  }}
                >
                  "{itemName}"
                </span>
              </div>
            )}

            {/* Alerta de irreversibilidade */}
            {showIrreversibleWarning && (
              <div
                style={{
                  backgroundColor: accentBg,
                  border: `1px solid ${accentBorder}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  fontSize: '0.8125rem',
                  color: accentColor,
                  fontWeight: 500,
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>Esta ação é definitiva e não poderá ser desfeita.</span>
              </div>
            )}
          </div>

          {/* Ações / Botões no Rodapé */}
          <div
            style={{
              marginTop: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: accentColor,
                border: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: isDanger ? '0 2px 8px rgba(239, 68, 68, 0.4)' : '0 2px 8px rgba(245, 158, 11, 0.4)',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
