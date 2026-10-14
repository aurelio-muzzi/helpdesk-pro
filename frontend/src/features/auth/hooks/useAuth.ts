import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginCredentials, User, UserRole } from '../types';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (loggedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, loggedUser);
      if (loggedUser.role?.name === 'requester') {
        navigate('/tickets');
      } else {
        navigate('/');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      navigate('/login');
    },
  });

  const hasRole = (role: UserRole): boolean => {
    return user?.role?.name === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (user?.role?.name === 'admin') return true;
    return user?.permissions?.includes(permission) ?? false;
  };

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user && !isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    refetchUser: refetch,
    error,
    hasRole,
    hasPermission,
    isAdmin: user?.role?.name === 'admin',
    isManager: user?.role?.name === 'manager',
    isAgent: user?.role?.name === 'agent',
    isRequester: user?.role?.name === 'requester',
  };
}
