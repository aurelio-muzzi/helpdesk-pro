import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationalService } from '../services/organizationalService';
import type {
  CreateDepartmentPayload,
  CreateTeamPayload,
  SyncTeamMembersPayload,
  CreateCategoryPayload,
  CreatePriorityPayload,
} from '../types';

export const ORGANIZATIONAL_KEYS = {
  departments: ['departments'] as const,
  teams: ['teams'] as const,
  categories: ['categories'] as const,
  priorities: ['priorities'] as const,
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ORGANIZATIONAL_KEYS.departments,
    queryFn: () => organizationalService.getDepartments(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: ORGANIZATIONAL_KEYS.teams,
    queryFn: () => organizationalService.getTeams(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ORGANIZATIONAL_KEYS.categories,
    queryFn: () => organizationalService.getCategories(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

export const usePriorities = () => {
  return useQuery({
    queryKey: ORGANIZATIONAL_KEYS.priorities,
    queryFn: () => organizationalService.getPriorities(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => organizationalService.createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONAL_KEYS.departments });
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => organizationalService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONAL_KEYS.teams });
    },
  });
};

export const useSyncTeamMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: number; payload: SyncTeamMembersPayload }) =>
      organizationalService.syncTeamMembers(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONAL_KEYS.teams });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => organizationalService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONAL_KEYS.categories });
    },
  });
};

export const useCreatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePriorityPayload) => organizationalService.createPriority(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIZATIONAL_KEYS.priorities });
    },
  });
};
