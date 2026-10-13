import { api, type ApiResponse } from '@/lib/axios';
import type {
  Department,
  Team,
  Category,
  Priority,
  CreateDepartmentPayload,
  CreateTeamPayload,
  SyncTeamMembersPayload,
  CreateCategoryPayload,
  CreatePriorityPayload,
} from '../types';

export const organizationalService = {
  // Departamentos
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
    return response.data.data;
  },

  createDepartment: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const response = await api.post<ApiResponse<Department>>('/departments', payload);
    return response.data.data;
  },

  // Equipes
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get<ApiResponse<Team[]>>('/teams');
    return response.data.data;
  },

  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const response = await api.post<ApiResponse<Team>>('/teams', payload);
    return response.data.data;
  },

  syncTeamMembers: async (teamId: number, payload: SyncTeamMembersPayload): Promise<Team> => {
    const response = await api.post<ApiResponse<Team>>(`/teams/${teamId}/members`, payload);
    return response.data.data;
  },

  // Categorias
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', payload);
    return response.data.data;
  },

  // Prioridades
  getPriorities: async (): Promise<Priority[]> => {
    const response = await api.get<ApiResponse<Priority[]>>('/priorities');
    return response.data.data;
  },

  createPriority: async (payload: CreatePriorityPayload): Promise<Priority> => {
    const response = await api.post<ApiResponse<Priority>>('/priorities', payload);
    return response.data.data;
  },
};
