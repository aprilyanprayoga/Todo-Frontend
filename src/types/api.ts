export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, unknown>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  expires_at: number | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; total_pages: number };
}

export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

export interface TodoQuery {
  search?: string;
  is_completed?: boolean;
  priority?: Priority;
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
