import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Lock,
  MessageSquare,
  FileIcon,
  Download,
  X,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useTicketComments, useAddComment } from '../hooks/useComments';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Ticket } from '../types';

interface TicketTimelineProps {
  ticket: Ticket;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ ticket }) => {
  const { user } = useAuth();
  const { data: comments, isLoading: loadingComments } = useTicketComments(ticket.id);
  const addCommentMutation = useAddComment(ticket.id);

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'conversation' | 'history'>('conversation');

  const roleName = user?.role?.name;
  const isStaff = Boolean(roleName && ['admin', 'manager', 'agent'].includes(roleName));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      await addCommentMutation.mutateAsync({
        content: message.trim() || 'Anexo enviado.',
        is_internal: isStaff ? isInternal : false,
        attachments: selectedFiles,
      });

      setMessage('');
      setIsInternal(false);
      setSelectedFiles([]);
    } catch {
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('conversation')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'conversation' ? 'var(--bg-card-hover)' : 'transparent',
            color: activeTab === 'conversation' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <MessageSquare size={14} />
          Conversação ({comments?.length ?? 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: activeTab === 'history' ? 'var(--bg-card-hover)' : 'transparent',
            color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <History size={14} />
          Histórico ({ticket.histories?.length ?? 0})
        </button>
      </div>

      {/* Tab 1: Conversation & Comments */}
      {activeTab === 'conversation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
              Carregando mensagens...
            </div>
          ) : comments && comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: c.is_internal ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                    border: c.is_internal ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {c.user.name}
                      </span>
                      {c.user.role && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-muted)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                          }}
                        >
                          {c.user.role.toUpperCase()}
                        </span>
                      )}
                      {c.is_internal && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                          }}
                        >
                          <Lock size={10} /> NOTA INTERNA
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </p>

                  {/* Anexos vinculados */}
                  {c.attachments && c.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '4px' }}>
                      {c.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.download_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            fontSize: '0.75rem',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                          }}
                        >
                          <FileIcon size={12} style={{ color: 'var(--primary-400)' }} />
                          <span>{att.original_name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({att.formatted_size})</span>
                          <Download size={12} style={{ color: 'var(--text-muted)' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Nenhuma mensagem registrada. Inicie a conversa abaixo.
            </div>
          )}

          {/* Form Composer */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              rows={3}
              placeholder={isInternal ? 'Escreva uma nota técnica interna confidencial...' : 'Escreva uma resposta para o chamado...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'var(--bg-input)',
                border: isInternal ? '1px solid #f59e0b' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />

            {/* Selected Files preview */}
            {selectedFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedFiles.map((file, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-muted)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Paperclip size={12} />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    minHeight: '38px',
                    padding: '4px 6px',
                  }}
                >
                  <Paperclip size={16} />
                  <span>Anexar</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {isStaff && (
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8125rem',
                      color: isInternal ? '#f59e0b' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isInternal ? 600 : 400,
                      minHeight: '38px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    />
                    <Lock size={14} />
                    Nota Interna
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={addCommentMutation.isPending || (!message.trim() && selectedFiles.length === 0)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isInternal ? '#d97706' : 'var(--primary-600)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: addCommentMutation.isPending ? 'not-allowed' : 'pointer',
                  minHeight: '38px',
                }}
              >
                <Send size={14} />
                {addCommentMutation.isPending ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Audit History */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ticket.histories && ticket.histories.length > 0 ? (
            ticket.histories.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} style={{ color: 'var(--primary-400)' }} />
                    {h.action.toUpperCase()}
                  </span>
                  <span>{new Date(h.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {h.comment && (
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {h.comment}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              Nenhum histórico adicional registrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketTimeline;
