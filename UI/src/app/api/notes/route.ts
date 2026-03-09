import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildNotePath, toClientNote } from "@/lib/note-mapper";

export const dynamic = "force-dynamic";

type CreateNoteBody = {
  id?: string;
  title?: string;
  content?: string;
  folderId?: string | null;
  folderName?: string;
  tags?: string[];
  deleted?: boolean;
  deletedAt?: string | null;
};

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: { tags: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes: notes.map(toClientNote) });
  } catch (error) {
    console.error("GET /api/notes error", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateNoteBody;
    const id = body.id?.trim();
    const provisionalId = id || crypto.randomUUID();
    const title = body.title?.trim() || "无标题笔记";
    const content = body.content ?? "";
    const folderId = body.folderId ?? null;
    const tags = Array.from(new Set((body.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean)));

    if (folderId) {
      await prisma.folder.upsert({
        where: { id: folderId },
        create: {
          id: folderId,
          name: body.folderName?.trim() || "未命名文件夹",
          path: `/folders/${folderId}`,
        },
        update: {
          name: body.folderName?.trim() || undefined,
        },
      });
    }

    const deletedAt = body.deleted
      ? body.deletedAt
        ? new Date(body.deletedAt)
        : new Date()
      : null;

    const note = await prisma.note.create({
      data: {
        ...(id ? { id } : {}),
        title,
        content,
        folderId,
        deletedAt,
        path: buildNotePath(provisionalId, title),
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { tags: true },
    });

    if (!id) {
      await prisma.note.update({
        where: { id: note.id },
        data: { path: buildNotePath(note.id, title) },
      });
    }

    const refreshed = await prisma.note.findUniqueOrThrow({
      where: { id: note.id },
      include: { tags: true },
    });

    return NextResponse.json({ note: toClientNote(refreshed) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "1";

    if (!hardDelete) {
      return NextResponse.json(
        { error: "Only bulk hard delete is supported on this endpoint" },
        { status: 400 },
      );
    }

    await prisma.note.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes error", error);
    return NextResponse.json({ error: "Failed to clear notes" }, { status: 500 });
  }
}
