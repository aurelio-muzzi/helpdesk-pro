import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/lib/axios';

export const LoginPage: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      await login(data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setErrorMessage(
        axiosError.response?.data?.message || 'Falha ao autenticar. Verifique suas credenciais.'
      );
    }
  };

  const fillQuickCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
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
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--primary-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--border-default)',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            HelpDesk Pro
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Acesse sua conta para gerenciar chamados e atendimento
          </p>
        </div>

        {/* Global Error Banner */}
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

        {/* Form */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              E-mail profissional
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                Senha de acesso
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-500)',
                  fontWeight: 500,
                }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: errors.password ? '1px solid var(--danger)' : '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="remember"
              type="checkbox"
              {...register('remember')}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: 'var(--radius-sm)',
                accentColor: 'var(--primary-500)',
                cursor: 'pointer',
              }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Lembrar deste dispositivo
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
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
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1,
              transition: 'var(--transition-fast)',
              marginTop: '0.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <LogIn size={18} />
            {isLoggingIn ? 'Autenticando...' : 'Entrar no sistema'}
          </button>
        </form>

        {/* Quick Test Demo Helpers */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Acesso Rápido de Teste (Preenchimento Automático):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@helpdeskpro.local')}
              style={{
                padding: '4px 8px',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('manager@helpdeskpro.local')}
              style={{
                padding: '4px 8px',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('agent@helpdeskpro.local')}
              style={{
                padding: '4px 8px',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('requester@helpdeskpro.local')}
              style={{
                padding: '4px 8px',
                fontSize: '0.6875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Requester
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
