import { AuthSession, AuthUser } from "@/types/auth";
import { SavedInfographic } from "@/types/infographic";

export const STORAGE_KEYS = {
  users: "vizzy_users",
  session: "vizzy_current_user",
  savedLegacy: "vizzy_saved",
  savedGuest: "vizzy_saved_guest",
  savedByUserPrefix: "vizzy_saved_user:",
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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const userSavedKey = (email: string) =>
  `${STORAGE_KEYS.savedByUserPrefix}${normalizeEmail(email)}`;

export const getSavedInfographics = (email?: string | null): SavedInfographic[] => {
  const key = email ? userSavedKey(email) : STORAGE_KEYS.savedGuest;
  const items = safeParse<SavedInfographic[]>(
    localStorage.getItem(key) || "[]",
    [],
  );
  return Array.isArray(items) ? items : [];
};

export const saveSavedInfographics = (items: SavedInfographic[], email?: string | null) => {
  const key = email ? userSavedKey(email) : STORAGE_KEYS.savedGuest;
  localStorage.setItem(key, JSON.stringify(items));
};

export const mergeGuestSavedIntoUser = (email: string) => {
  const guestItems = getSavedInfographics();
  if (guestItems.length === 0) return;

  const userItems = getSavedInfographics(email);
  const byId = new Map<number, SavedInfographic>();

  [...userItems, ...guestItems].forEach((item) => {
    byId.set(item.id, item);
  });

  saveSavedInfographics(Array.from(byId.values()), email);
  localStorage.removeItem(STORAGE_KEYS.savedGuest);
};

export const migrateSavedInfographicsByEmail = (oldEmail: string, newEmail: string) => {
  const oldKey = userSavedKey(oldEmail);
  const newKey = userSavedKey(newEmail);

  if (oldKey === newKey) return;

  const oldItems = safeParse<SavedInfographic[]>(localStorage.getItem(oldKey) || "[]", []);
  const newItems = safeParse<SavedInfographic[]>(localStorage.getItem(newKey) || "[]", []);
  const byId = new Map<number, SavedInfographic>();

  [...newItems, ...oldItems].forEach((item) => {
    byId.set(item.id, item);
  });

  localStorage.setItem(newKey, JSON.stringify(Array.from(byId.values())));
  localStorage.removeItem(oldKey);
};

export const clearSavedInfographicsByEmail = (email: string) => {
  localStorage.removeItem(userSavedKey(email));
};

export const clearLegacyGlobalSaved = () => {
  localStorage.removeItem(STORAGE_KEYS.savedLegacy);
};
