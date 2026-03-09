// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    note: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    folder: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { DELETE, GET, PATCH } from "@/app/api/notes/[id]/route";

describe("/api/notes/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when note is missing", async () => {
    prismaMock.note.findUnique.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/notes/n1"), {
      params: Promise.resolve({ id: "n1" }),
    });

    expect(response.status).toBe(404);
  });

  it("updates note by PATCH", async () => {
    prismaMock.note.update.mockResolvedValue({
      id: "n1",
      title: "patched",
      content: "updated",
      path: "/notes/patched-n1.md",
      folderId: null,
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T00:00:00.000Z"),
      deletedAt: null,
      tags: [{ id: "t1", name: "tag", createdAt: new Date(), updatedAt: new Date() }],
    });

    const response = await PATCH(
      new Request("http://localhost/api/notes/n1", {
        method: "PATCH",
        body: JSON.stringify({ title: "patched", content: "updated", tags: ["tag"] }),
      }),
      { params: Promise.resolve({ id: "n1" }) },
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.note.title).toBe("patched");
  });

  it("hard deletes note", async () => {
    prismaMock.note.delete.mockResolvedValue({ id: "n1" });

    const response = await DELETE(
      new Request("http://localhost/api/notes/n1?hard=1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "n1" }) },
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
