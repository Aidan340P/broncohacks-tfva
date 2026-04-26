export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { deleteLecture, getLectureById } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lecture = await getLectureById(id);

  if (!lecture) {
    return NextResponse.json({ error: "Lecture not found." }, { status: 404 });
  }

  return NextResponse.json({ lecture });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteLecture(id);

  if (!deleted) {
    return NextResponse.json({ error: "Lecture not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
