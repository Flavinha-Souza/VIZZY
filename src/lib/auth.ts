import { AuthUser } from "@/types/auth";

export const MIN_PASSWORD_LENGTH = 6;
const PBKDF2_PREFIX = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 210000;

const encoder = new TextEncoder();

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const bytesToBase64 = (bytes: Uint8Array) => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
};

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const ensureCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error("Secure crypto API indisponivel.");
  }
};

const sha256 = async (value: string) => {
  ensureCrypto();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return `sha256:${bytesToHex(new Uint8Array(hashBuffer))}`;
};

const fallbackHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `fallback:${Math.abs(hash).toString(16)}`;
};

const derivePbkdf2Hash = async (rawPassword: string, salt: Uint8Array, iterations: number) => {
  ensureCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(rawPassword),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(derived);
};

export const isStrongPassword = (rawPassword: string) => rawPassword.length >= MIN_PASSWORD_LENGTH;

export const isStrongHashFormat = (storedHash: string) => storedHash.startsWith(`${PBKDF2_PREFIX}$`);

export const hashPassword = async (rawPassword: string) => {
  ensureCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePbkdf2Hash(rawPassword, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(derived)}`;
};

export const verifyPassword = async (rawPassword: string, storedHash: string) => {
  if (storedHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    const [, iterationsRaw, saltRaw, hashRaw] = storedHash.split("$");
    const iterations = Number(iterationsRaw);
    if (!iterations || !saltRaw || !hashRaw) return false;

    const salt = base64ToBytes(saltRaw);
    const expectedHash = base64ToBytes(hashRaw);
    const derived = await derivePbkdf2Hash(rawPassword, salt, iterations);

    if (expectedHash.length !== derived.length) return false;
    return expectedHash.every((byte, index) => byte === derived[index]);
  }

  if (storedHash.startsWith("sha256:")) {
    return storedHash === (await sha256(rawPassword));
  }

  if (storedHash.startsWith("fallback:")) {
    return storedHash === fallbackHash(rawPassword);
  }

  return false;
};

export const verifyUserPassword = async (user: AuthUser, rawPassword: string) => {
  const hashMatch = await verifyPassword(rawPassword, user.passwordHash);
  const isLegacyMatch =
    (typeof user.passwordLegacy === "string" && user.passwordLegacy === rawPassword) ||
    (typeof user.password === "string" && user.password === rawPassword);

  return {
    isValid: hashMatch || isLegacyMatch,
    shouldUpgradeHash: isLegacyMatch || !isStrongHashFormat(user.passwordHash),
  };
};
