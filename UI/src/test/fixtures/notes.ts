import type { Note } from "@/app/store";

export const noteA: Note = {
  id: "n-1",
  title: "第一篇笔记",
  content: "# Hello\\n\\n这是第一篇笔记",
  folderId: null,
  tags: ["guide"],
  createdAt: "2026-03-07T10:00:00.000Z",
  updatedAt: "2026-03-07T10:00:00.000Z",
  deleted: false,
  deletedAt: null,
  snapshots: [],
};

export const noteDeleted: Note = {
  id: "n-2",
  title: "已删除笔记",
  content: "deleted",
  folderId: null,
  tags: ["trash"],
  createdAt: "2026-03-07T10:00:00.000Z",
  updatedAt: "2026-03-07T10:00:00.000Z",
  deleted: true,
  deletedAt: "2026-03-07T11:00:00.000Z",
  snapshots: [],
};
