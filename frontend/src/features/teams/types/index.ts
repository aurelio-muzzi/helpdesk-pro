export interface Department {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  teams_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  role?: string;
  role_in_team?: string;
}

export interface Team {
  id: number;
  department_id: number | null;
  name: string;
  description: string | null;
  is_active: boolean;
  department?: Department | null;
  members?: TeamMember[];
  members_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  department_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  department?: Department | null;
  created_at: string;
  updated_at: string;
}

export interface Priority {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  order: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateTeamPayload {
  department_id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
}


export interface CreateCategoryPayload {
  department_id?: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreatePriorityPayload {
  name: string;
  display_name: string;
  description?: string;
  order: number;
  color: string;
  is_active?: boolean;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_active: boolean;
  role?: Role | null;
  teams?: Team[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role_id: number;
  is_active?: boolean;
  team_ids?: number[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
  team_ids?: number[];
}

export interface SyncTeamMemberItem {
  user_id: number;
  is_leader?: boolean;
}

export interface SyncTeamMembersPayload {
  members: SyncTeamMemberItem[];
}
