import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSavedInfographicsByEmail,
  getSavedInfographics,
  mergeGuestSavedIntoUser,
  migrateSavedInfographicsByEmail,
  saveSavedInfographics,
} from "@/lib/storage";
import { SavedInfographic } from "@/types/infographic";

const item = (id: number, title: string): SavedInfographic => ({
  id,
  title,
  chartType: "bar",
  data: [{ label: "A", value: id }],
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("saved infographic storage isolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("isolates saved items by user email", () => {
    saveSavedInfographics([item(1, "Ana")], "ana@example.com");
    saveSavedInfographics([item(2, "Bia")], "bia@example.com");

    expect(getSavedInfographics("ana@example.com")).toHaveLength(1);
    expect(getSavedInfographics("bia@example.com")).toHaveLength(1);
    expect(getSavedInfographics("ana@example.com")[0].title).toBe("Ana");
  });

  it("merges guest items into authenticated user", () => {
    saveSavedInfographics([item(1, "Guest item")]);
    saveSavedInfographics([item(2, "User item")], "user@example.com");

    mergeGuestSavedIntoUser("user@example.com");

    const merged = getSavedInfographics("user@example.com");
    expect(merged).toHaveLength(2);
    expect(getSavedInfographics()).toHaveLength(0);
  });

  it("migrates saved items when account email changes", () => {
    saveSavedInfographics([item(3, "Old email data")], "old@example.com");
    migrateSavedInfographicsByEmail("old@example.com", "new@example.com");

    expect(getSavedInfographics("old@example.com")).toHaveLength(0);
    expect(getSavedInfographics("new@example.com")).toHaveLength(1);
  });

  it("clears saved items when account is removed", () => {
    saveSavedInfographics([item(4, "Delete me")], "remove@example.com");
    clearSavedInfographicsByEmail("remove@example.com");
    expect(getSavedInfographics("remove@example.com")).toHaveLength(0);
  });
});
