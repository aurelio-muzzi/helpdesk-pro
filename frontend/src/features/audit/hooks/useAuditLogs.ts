import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type { AuditFilterParams, AuditLogsResponse } from '../types';

export const useAuditLogs = (params?: AuditFilterParams) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params),
  });
};
