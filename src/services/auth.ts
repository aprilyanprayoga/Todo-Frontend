import { api, clearLocalSession } from './api';
import type { ApiSuccess, PublicUser, Session } from '../types/api';

interface AuthResult {
  user: PublicUser;
  session: Session | null;
  requires_email_confirmation?: boolean;
}

export async function register(email: string, password: string, display_name?: string) {
  const result = await api<AuthResult>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...(display_name ? { display_name } : {}) }),
  });
  if (result.data.session) saveSession(result.data.session);
  return result.data;
}

export async function login(email: string, password: string) {
  const result = await api<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(result.data.session!);
  return result.data;
}

export async function getCurrentUser() {
  const result = await api<{ user: PublicUser }>('/auth/me');
  return result.data.user;
}

export async function logout() {
  try {
    await api<{ message: string }>('/auth/logout', { method: 'POST' });
  } finally {
    clearLocalSession();
  }
}

export async function forgotPassword(email: string) {
  return api<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(password: string, recoveryToken: string) {
  const result = await fetch(
    `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')}/auth/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recoveryToken}` },
      body: JSON.stringify({ password }),
    },
  );
  const json = (await result.json()) as ApiSuccess<{ message: string }> | {
    success: false; error: { code: string; message: string; details?: { field: string; message: string }[] }
  };
  if (!result.ok || !json.success) {
    const err = !json.success ? json.error : { code: 'HTTP_ERROR', message: 'Reset password gagal.' };
    throw Object.assign(new Error(err.message), err);
  }
  clearLocalSession();
  return json.data;
}

function saveSession(session: Session) {
  localStorage.setItem('access_token', session.access_token);
  localStorage.setItem('refresh_token', session.refresh_token);
}
