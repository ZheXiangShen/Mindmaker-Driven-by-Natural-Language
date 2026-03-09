// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    note: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      deleteMany: vi.fn(),
    },
    folder: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { DELETE, GET, POST } from "@/app/api/notes/route";

describe("/api/notes route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mapped notes on GET", async () => {
    prismaMock.note.findMany.mockResolvedValue([
      {
        id: "n1",
        title: "title",
        content: "content",
        path: "/notes/title-n1.md",
        folderId: null,
        createdAt: new Date("2026-03-07T00:00:00.000Z"),
        updatedAt: new Date("2026-03-07T00:00:00.000Z"),
        deletedAt: null,
        tags: [],
      },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0].id).toBe("n1");
  });

  it("creates note on POST", async () => {
    prismaMock.note.create.mockResolvedValue({
      id: "n1",
      title: "new",
      content: "body",
      path: "/notes/new-n1.md",
      folderId: null,
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T00:00:00.000Z"),
      deletedAt: null,
      tags: [],
    });
    prismaMock.note.findUniqueOrThrow.mockResolvedValue({
      id: "n1",
      title: "new",
      content: "body",
      path: "/notes/new-n1.md",
      folderId: null,
      createdAt: new Date("2026-03-07T00:00:00.000Z"),
      updatedAt: new Date("2026-03-07T00:00:00.000Z"),
      deletedAt: null,
      tags: [],
    });

    const request = new Request("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "new", content: "body", tags: ["tag1"] }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.note.title).toBe("new");
    expect(prismaMock.note.create).toHaveBeenCalledTimes(1);
  });

  it("bulk hard deletes notes", async () => {
    prismaMock.note.deleteMany.mockResolvedValue({ count: 2 });

    const response = await DELETE(new Request("http://localhost/api/notes?hard=1", { method: "DELETE" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prismaMock.note.deleteMany).toHaveBeenCalledTimes(1);
  });
});
