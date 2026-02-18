import { AuthSession, AuthUser } from "@/types/auth";
import { SavedInfographic } from "@/types/infographic";

export const STORAGE_KEYS = {
  users: "vizzy_users",
  session: "vizzy_current_user",
  saved: "vizzy_saved",
} as const;

const safeParse = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const getUsers = (): AuthUser[] => {
  const users = safeParse<AuthUser[]>(
    localStorage.getItem(STORAGE_KEYS.users) || "[]",
    [],
  );
  return Array.isArray(users) ? users : [];
};

export const saveUsers = (users: AuthUser[]) => {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

export const getSession = (): AuthSession | null => {
  return safeParse<AuthSession | null>(
    localStorage.getItem(STORAGE_KEYS.session) || "null",
    null,
  );
};

export const saveSession = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.session);
};

export const getSavedInfographics = (): SavedInfographic[] => {
  const items = safeParse<SavedInfographic[]>(
    localStorage.getItem(STORAGE_KEYS.saved) || "[]",
    [],
  );
  return Array.isArray(items) ? items : [];
};

export const saveSavedInfographics = (items: SavedInfographic[]) => {
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(items));
};
