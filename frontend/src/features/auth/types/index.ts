export type UserRole = 'admin' | 'manager' | 'agent' | 'requester';

export interface Role {
  id: number;
  name: UserRole;
  display_name: string;
  description?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_active: boolean;
  role: Role;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}
