export interface AuthUser {
  name: string;
  email: string;
  passwordHash: string;
  passwordLegacy?: string;
  password?: string;
}

export interface AuthSession {
  name: string;
  email: string;
}
