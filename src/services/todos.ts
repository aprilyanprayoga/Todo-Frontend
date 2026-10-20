import { api } from './api';
import type { Todo, TodoQuery, Priority } from '../types/api';

export interface TodoInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
  is_completed?: boolean;
}

export async function listTodos(query: TodoQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return api<Todo[]>(`/todos${params.size ? `?${params.toString()}` : ''}`);
}

export async function createTodo(input: TodoInput) {
  return api<Todo>('/todos', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateTodo(id: string, input: Partial<TodoInput>) {
  return api<Todo>(`/todos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteTodo(id: string) {
  return api<{ id: string }>(`/todos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
