import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { listNotes, saveNote } from "@/lib/storage";
import { makeTitle } from "@/lib/utils";
import type { UserNote } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateNoteBody = {
  title?: string;
  content?: string;
};

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateNoteBody;
  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json({ error: "Note content is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const note: UserNote = {
    id: randomUUID(),
    title: body.title?.trim() || makeTitle(content, "Untitled Note"),
    content,
    createdAt: now,
    updatedAt: now,
  };

  await saveNote(note);
  return NextResponse.json({ note }, { status: 201 });
}
