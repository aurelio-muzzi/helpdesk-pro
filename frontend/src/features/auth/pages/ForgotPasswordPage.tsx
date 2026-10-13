import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/authSchemas';
import { authService } from '../services/authService';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/lib/axios';

export const ForgotPasswordPage: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const message = await authService.forgotPassword(data);
      setSuccessMessage(message);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setErrorMessage(
        axiosError.response?.data?.message || 'Falha ao solicitar link de recuperação.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          Voltar para login
        </Link>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recuperar Senha
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
          Informe o e-mail cadastrado para receber instruções de recuperação.
        </p>

        {successMessage && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: 'var(--success)',
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '0.375rem',
              }}
            >
              E-mail de cadastro
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com"
              {...register('email')}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: errors.email ? '1px solid var(--danger)' : '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: '0.5rem',
            }}
          >
            <Mail size={18} />
            {isSubmitting ? 'Enviando link...' : 'Enviar link de recuperação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
