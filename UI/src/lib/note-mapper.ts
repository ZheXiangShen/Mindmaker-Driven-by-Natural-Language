import { type Note, type Tag } from "@prisma/client";

export type DbNoteWithTags = Note & { tags: Tag[] };

export function toClientNote(note: DbNoteWithTags) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    tags: note.tags.map((tag) => tag.name),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    deleted: Boolean(note.deletedAt),
    deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
    snapshots: [],
  };
}

export function buildNotePath(id: string, title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\u4e00-\u9fa5]/g, "")
    .slice(0, 60);

  return `/notes/${slug || "untitled"}-${id}.md`;
}
