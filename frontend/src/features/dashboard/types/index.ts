export interface DashboardSummary {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  cancelled_tickets: number;
  sla_breached: number;
  sla_within: number;
  sla_compliance_rate: number;
  avg_first_response_minutes: number | null;
  avg_resolution_minutes: number | null;
}

export interface StatusCount {
  status: string;
  label: string;
  color: string;
  count: number;
}

export interface PriorityCount {
  id: number;
  name: string;
  display_name: string;
  color: string;
  count: number;
}

export interface DepartmentCount {
  id: number;
  name: string;
  count: number;
}

export interface VolumeDataPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface AgentPerformance {
  id: number;
  name: string;
  email: string;
  assigned_count: number;
  resolved_count: number;
  resolution_rate: number;
}

export interface RecentTicket {
  id: number;
  code: string;
  title: string;
  status: string;
  status_label: string;
  status_color: string;
  priority_name: string;
  priority_color: string;
  requester_name: string;
  assigned_name: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  period: {
    from: string;
    to: string;
  };
  summary: DashboardSummary;
  tickets_by_status: StatusCount[];
  tickets_by_priority: PriorityCount[];
  tickets_by_department: DepartmentCount[];
  volume_over_time: VolumeDataPoint[];
  agent_performance: AgentPerformance[];
  recent_tickets: RecentTicket[];
}

export interface DashboardFilters {
  period?: '7d' | '30d' | '90d' | 'custom';
  date_from?: string;
  date_to?: string;
  department_id?: number;
  priority_id?: number;
  category_id?: number;
  assigned_to?: number;
}
