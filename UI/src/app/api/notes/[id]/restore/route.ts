import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClientNote } from "@/lib/note-mapper";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = await prisma.note.update({
      where: { id },
      data: { deletedAt: null },
      include: { tags: true },
    });

    return NextResponse.json({ note: toClientNote(note) });
  } catch (error) {
    console.error("POST /api/notes/[id]/restore error", error);
    return NextResponse.json({ error: "Failed to restore note" }, { status: 500 });
  }
}
