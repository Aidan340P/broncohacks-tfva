export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { createLecture, listLectures } from "@/lib/storage";
import type { LectureInput } from "@/types";

export async function GET() {
  const lectures = await listLectures();
  return NextResponse.json({ lectures });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LectureInput>;

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const lecture = await createLecture({
    title: body.title,
    course: body.course,
    instructor: body.instructor,
    content: body.content,
    sourceType: body.sourceType ?? "text",
  });

  return NextResponse.json({ lecture }, { status: 201 });
}
