import type { Priority } from '@/features/teams/types';

export interface SlaPolicy {
  id: number;
  name: string;
  description?: string | null;
  priority: Priority;
  first_response_time_minutes: number;
  resolution_time_minutes: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSlaPolicyPayload {
  name: string;
  description?: string;
  priority_id: number;
  first_response_time_minutes: number;
  resolution_time_minutes: number;
  is_active?: boolean;
}

export interface AppNotification {
  id: string;
  data: {
    type: string;
    message: string;
    ticket_id?: number;
    code?: string;
    priority?: string;
    reason?: string;
    created_at?: string;
  };
  read_at?: string | null;
  created_at: string;
}

export interface NotificationResponse {
  data: AppNotification[];
  meta: {
    unread_count: number;
  };
}
