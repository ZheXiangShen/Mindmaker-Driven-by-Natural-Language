import { describe, expect, it } from "vitest";
import { buildNotePath, toClientNote } from "@/lib/note-mapper";

describe("note-mapper", () => {
  it("maps db note to client note shape", () => {
    const dbNote = {
      id: "n1",
      title: "Test",
      content: "content",
      path: "/notes/test-n1.md",
      folderId: null,
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T01:00:00.000Z"),
      deletedAt: new Date("2026-03-07T02:00:00.000Z"),
      tags: [
        {
          id: "t1",
          name: "guide",
          createdAt: new Date("2026-03-07T00:00:00.000Z"),
          updatedAt: new Date("2026-03-07T00:00:00.000Z"),
        },
      ],
    };

    const mapped = toClientNote(dbNote);

    expect(mapped).toEqual({
      id: "n1",
      title: "Test",
      content: "content",
      folderId: null,
      tags: ["guide"],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T01:00:00.000Z",
      deleted: true,
      deletedAt: "2026-03-07T02:00:00.000Z",
      snapshots: [],
    });
  });

  it("builds stable note path from title and id", () => {
    const path = buildNotePath("abc123", "My First Note 你好 !!");
    expect(path).toBe("/notes/my-first-note-你好--abc123.md");
  });
});
