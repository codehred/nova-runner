import type { AuthUser } from './api';

const STORAGE_KEY = 'nova-runner-session';

export interface Session {
  token: string;
  user: AuthUser;
}

let currentSession: Session | null = loadFromStorage();

function loadFromStorage(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null): void {
  currentSession = session;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getSession(): Session | null {
  return currentSession;
}

export function isGuest(): boolean {
  return currentSession === null;
}
