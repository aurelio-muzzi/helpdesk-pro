export interface AuditUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuditLog {
  id: number;
  event: string;
  description: string;
  auditable_type: string | null;
  auditable_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
  user: AuditUser | null;
}

export interface AuditFilterParams {
  event?: string;
  user_id?: number;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface AuditLogsPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: AuditLogsPaginationMeta;
}
