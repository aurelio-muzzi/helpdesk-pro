import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type { DashboardFilters, DashboardMetrics } from '../types';

export const useDashboardMetrics = (filters: DashboardFilters = { period: '7d' }) => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics', filters],
    queryFn: () => dashboardService.getMetrics(filters),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useExportDashboardCsv = () => {
  return useMutation({
    mutationFn: (filters?: DashboardFilters) => dashboardService.exportCsv(filters),
  });
};
