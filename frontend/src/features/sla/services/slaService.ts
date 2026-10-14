import { api, type ApiResponse } from '@/lib/axios';
import type {
  SlaPolicy,
  CreateSlaPolicyPayload,
  NotificationResponse,
} from '../types';

export const slaService = {
  getPolicies: async (): Promise<SlaPolicy[]> => {
    const response = await api.get<ApiResponse<SlaPolicy[]>>('/sla-policies');
    return response.data.data;
  },

  createPolicy: async (payload: CreateSlaPolicyPayload): Promise<SlaPolicy> => {
    const response = await api.post<ApiResponse<SlaPolicy>>('/sla-policies', payload);
    return response.data.data;
  },

  updatePolicy: async (id: number, payload: Partial<CreateSlaPolicyPayload>): Promise<SlaPolicy> => {
    const response = await api.put<ApiResponse<SlaPolicy>>(`/sla-policies/${id}`, payload);
    return response.data.data;
  },

  deletePolicy: async (id: number): Promise<void> => {
    await api.delete(`/sla-policies/${id}`);
  },

  getNotifications: async (): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
