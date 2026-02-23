import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, verifyUserPassword } from "@/lib/auth";
import { AuthUser } from "@/types/auth";

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

describe("auth security helpers", () => {
  it("hashes and verifies passwords with pbkdf2 format", async () => {
    const hashed = await hashPassword("StrongPass123");
    expect(hashed.startsWith("pbkdf2_sha256$")).toBe(true);

    await expect(verifyPassword("StrongPass123", hashed)).resolves.toBe(true);
    await expect(verifyPassword("WrongPass", hashed)).resolves.toBe(false);
  });

  it("supports legacy credentials and flags them for migration", async () => {
    const legacyUser: AuthUser = {
      name: "Legacy",
      email: "legacy@example.com",
      passwordHash: "sha256:dummy",
      passwordLegacy: "old-password",
    };

    const result = await verifyUserPassword(legacyUser, "old-password");
    expect(result.isValid).toBe(true);
    expect(result.shouldUpgradeHash).toBe(true);
  });
});
