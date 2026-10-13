import { api, type ApiResponse } from '@/lib/axios';
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  User,
} from '../types';

export const authService = {
  getCsrfCookie: async (): Promise<void> => {
    await api.get('/sanctum/csrf-cookie', { baseURL: '' });
  },

  login: async (credentials: LoginCredentials): Promise<User> => {
    // 1. Inicializa CSRF cookie conforme documentação do Sanctum
    try {
      await authService.getCsrfCookie();
    } catch {
      // Ignora erro se já estiver em modo mock ou proxy local
    }

    // 2. Executa a requisição de login
    const response = await api.post<ApiResponse<User>>('/auth/login', credentials);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<string> => {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', payload);
    return response.data.message || 'E-mail de recuperação enviado com sucesso.';
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<string> => {
    const response = await api.post<ApiResponse<null>>('/auth/reset-password', payload);
    return response.data.message || 'Senha redefinida com sucesso.';
  },
};
