const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  durationMs: number;
  createdAt: string;
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? `Error ${res.status}`);
  }

  return data as T;
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  submitScore: (token: string, score: number, durationMs: number) =>
    request<{ message: string }>('/scores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ score, durationMs }),
    }),

  getLeaderboard: (limit = 10) =>
    request<{ leaderboard: LeaderboardEntry[] }>(`/scores/leaderboard?limit=${limit}`),
};
