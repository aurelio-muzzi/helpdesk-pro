import { api, type ApiResponse } from '@/lib/axios';
import type { DashboardFilters, DashboardMetrics } from '../types';

export const dashboardService = {
  getMetrics: async (filters?: DashboardFilters): Promise<DashboardMetrics> => {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics', {
      params: filters,
    });
    return response.data.data;
  },

  exportCsv: async (filters?: DashboardFilters): Promise<void> => {
    const response = await api.get('/dashboard/export', {
      params: filters,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-chamados-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
