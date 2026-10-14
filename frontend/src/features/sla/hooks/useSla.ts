import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slaService } from '../services/slaService';
import type { CreateSlaPolicyPayload } from '../types';

export const SLA_KEYS = {
  policies: ['sla-policies'] as const,
  notifications: ['notifications'] as const,
};

export const useSlaPolicies = () => {
  return useQuery({
    queryKey: SLA_KEYS.policies,
    queryFn: () => slaService.getPolicies(),
  });
};

export const useCreateSlaPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlaPolicyPayload) => slaService.createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLA_KEYS.policies });
    },
  });
};

export const useUpdateSlaPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateSlaPolicyPayload> }) =>
      slaService.updatePolicy(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLA_KEYS.policies });
    },
  });
};

export const useDeleteSlaPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => slaService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLA_KEYS.policies });
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: SLA_KEYS.notifications,
    queryFn: () => slaService.getNotifications(),
    refetchInterval: 30000, // Auto refresh notifications every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => slaService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLA_KEYS.notifications });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => slaService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLA_KEYS.notifications });
    },
  });
};
