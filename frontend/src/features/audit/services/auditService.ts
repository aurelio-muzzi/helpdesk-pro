import { api } from '@/lib/axios';
import type { AuditFilterParams, AuditLogsResponse } from '../types';

export const auditService = {
  getAuditLogs: async (params?: AuditFilterParams): Promise<AuditLogsResponse> => {
    const response = await api.get<AuditLogsResponse>('/audit-logs', { params });
    return response.data;
  },
};
