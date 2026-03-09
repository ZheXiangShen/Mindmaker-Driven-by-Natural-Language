// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    note: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { POST } from "@/app/api/notes/[id]/restore/route";

describe("/api/notes/[id]/restore route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores note", async () => {
    prismaMock.note.update.mockResolvedValue({
      id: "n1",
      title: "restored",
      content: "body",
      path: "/notes/restored-n1.md",
      folderId: null,
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T00:00:00.000Z"),
      deletedAt: null,
      tags: [],
    });

    const response = await POST(new Request("http://localhost/api/notes/n1/restore", { method: "POST" }), {
      params: Promise.resolve({ id: "n1" }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.note.deleted).toBe(false);
  });
});
