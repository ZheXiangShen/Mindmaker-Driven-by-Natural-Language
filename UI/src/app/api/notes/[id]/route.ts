import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildNotePath, toClientNote } from "@/lib/note-mapper";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

type UpdateNoteBody = {
  title?: string;
  content?: string;
  folderId?: string | null;
  folderName?: string;
  tags?: string[];
  deleted?: boolean;
  deletedAt?: string | null;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note: toClientNote(note) });
  } catch (error) {
    console.error("GET /api/notes/[id] error", error);
    return NextResponse.json({ error: "Failed to load note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateNoteBody;

    if (body.folderId) {
      await prisma.folder.upsert({
        where: { id: body.folderId },
        create: {
          id: body.folderId,
          name: body.folderName?.trim() || "未命名文件夹",
          path: `/folders/${body.folderId}`,
        },
        update: {
          name: body.folderName?.trim() || undefined,
        },
      });
    }

    const data: {
      title?: string;
      content?: string;
      folderId?: string | null;
      deletedAt?: Date | null;
      path?: string;
      tags?: {
        set: never[];
        connectOrCreate: Array<{ where: { name: string }; create: { name: string } }>;
      };
    } = {};

    if (typeof body.title === "string") {
      data.title = body.title;
      data.path = buildNotePath(id, body.title);
    }

    if (typeof body.content === "string") data.content = body.content;
    if (body.folderId !== undefined) data.folderId = body.folderId;

    if (body.deleted !== undefined) {
      data.deletedAt = body.deleted
        ? body.deletedAt
          ? new Date(body.deletedAt)
          : new Date()
        : null;
    } else if (body.deletedAt !== undefined) {
      data.deletedAt = body.deletedAt ? new Date(body.deletedAt) : null;
    }

    if (body.tags) {
      const tags = Array.from(new Set(body.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
      data.tags = {
        set: [],
        connectOrCreate: tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      };
    }

    const note = await prisma.note.update({
      where: { id },
      data,
      include: { tags: true },
    });

    return NextResponse.json({ note: toClientNote(note) });
  } catch (error) {
    console.error("PATCH /api/notes/[id] error", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "1";

    if (hardDelete) {
      await prisma.note.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const note = await prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { tags: true },
    });

    return NextResponse.json({ note: toClientNote(note) });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
