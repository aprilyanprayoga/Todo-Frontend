import type { ApiError, ApiSuccess } from '../types/api';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

type RefreshPayload = {
  user: unknown;
  session: {
    access_token: string;
    refresh_token: string;
    token_type: 'bearer';
    expires_in: number;
    expires_at: number | null;
  };
};

let refreshInFlight: Promise<boolean> | null = null;

export class ApiRequestError extends Error {
  code: string;
  status: number;
  details?: { field: string; message: string }[];

  constructor(error: ApiError, status: number) {
    super(error.message || 'Permintaan gagal.');
    this.name = 'ApiRequestError';
    this.code = error.code || 'INTERNAL_ERROR';
    this.status = status;
    this.details = error.details;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiRequestError(
      { code: 'INVALID_JSON', message: 'Respons server tidak dapat dibaca.' },
      response.status,
    );
  }
}

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });
      const json = await readJson<
        ApiSuccess<RefreshPayload> | { success: false; error: ApiError }
      >(response);

      if (!response.ok || !json.success) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }

      localStorage.setItem('access_token', json.data.session.access_token);
      localStorage.setItem('refresh_token', json.data.session.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<ApiSuccess<T>> {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiRequestError(
      { code: 'NETWORK_ERROR', message: 'Tidak bisa terhubung ke server. Periksa koneksi dan URL API.' },
      0,
    );
  }

  const json = await readJson<
    ApiSuccess<T> | { success: false; error: ApiError }
  >(response);

  if (
    response.status === 401 &&
    retry &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register') &&
    !path.startsWith('/auth/refresh') &&
    ['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(!json.success ? json.error.code : '')
  ) {
    const refreshed = await refreshSession();
    if (refreshed) return api<T>(path, init, false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.dispatchEvent(new Event('auth:session-expired'));
  }

  if (!response.ok || !json.success) {
    const error = !json.success
      ? json.error
      : { code: 'HTTP_ERROR', message: 'Permintaan gagal.' };
    throw new ApiRequestError(error, response.status);
  }

  return json;
}

export function clearLocalSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
