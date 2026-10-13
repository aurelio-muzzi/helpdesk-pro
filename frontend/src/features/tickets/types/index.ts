import type { Department, Team, Category, Priority } from '@/features/teams/types';

export type TicketStatusValue =
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export interface TicketStatusInfo {
  value: TicketStatusValue;
  label: string;
  color: string;
  is_final: boolean;
}

export interface TicketUser {
  id: number;
  name: string;
  email: string;
}

export interface TicketHistory {
  id: number;
  ticket_id: number;
  action: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  comment?: string | null;
  user?: TicketUser | null;
  created_at: string;
}

export interface TicketSatisfactionInfo {
  id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  code: string;
  title: string;
  description: string;
  status: TicketStatusInfo;
  requester: TicketUser;
  assigned_to?: TicketUser | null;
  team?: Team | null;
  department?: Department | null;
  category: Category;
  priority: Priority;
  sla?: {
    status: 'normal' | 'warning' | 'breached' | 'met';
    first_response_due_at?: string | null;
    first_response_at?: string | null;
    resolution_due_at?: string | null;
    policy_name?: string | null;
  };
  satisfaction?: TicketSatisfactionInfo | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  histories?: TicketHistory[];
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category_id: number;
  priority_id: number;
  department_id?: number | null;
  team_id?: number | null;
}

export interface AssignTicketPayload {
  assigned_to: number | null;
  team_id?: number | null;
  comment?: string;
}

export interface ChangeTicketStatusPayload {
  status: TicketStatusValue;
  comment?: string;
}

export interface TicketFilterParams {
  status?: string;
  priority_id?: number;
  category_id?: number;
  assigned_to?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface TicketAttachment {
  id: number;
  ticket_id: number;
  comment_id?: number | null;
  original_name: string;
  file_size: number;
  formatted_size: string;
  mime_type: string;
  download_url: string;
  created_at: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  content: string;
  is_internal: boolean;
  user: TicketUser & { role?: string };
  attachments?: TicketAttachment[];
  created_at: string;
  updated_at?: string;
}

export interface CreateCommentPayload {
  content: string;
  is_internal?: boolean;
  attachments?: File[];
}
