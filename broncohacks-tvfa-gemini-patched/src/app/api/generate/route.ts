import { NextResponse } from "next/server";

import { generateNotesWithGemini, hasGeminiApiKey } from "@/lib/ai";
import { listNotes } from "@/lib/storage";
import { buildDemoNotes, getErrorMessage, getStyleSummary } from "@/lib/utils";
import type { GenerateRequestBody } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildPrompt(input: string, lectureTitle: string | undefined, styleExamples: string[], styleSummary: string) {
  return [
    "You are NoteAI.",
    "Rewrite the lecture into concise study notes that imitate the user's style examples.",
    "Keep the notes directly useful for studying.",
    "Do not mention AI, the prompt, or the style examples.",
    "Use headings or bullets only if they fit the examples.",
    "",
    `Lecture title: ${lectureTitle?.trim() || "Untitled lecture"}`,
    `Style summary: ${styleSummary}`,
    "",
    "User style examples:",
    styleExamples.length > 0 ? styleExamples.join("\n\n---\n\n") : "No style examples provided yet.",
    "",
    "Lecture content:",
    input,
  ].join("\n");
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequestBody;
  const input = body.input?.trim() || body.sourceText?.trim();

  if (!input) {
    return NextResponse.json({ error: "Lecture input is required." }, { status: 400 });
  }

  const notes = await listNotes();
  const styleSummary = getStyleSummary(notes);
  const fallbackNotes = buildDemoNotes(input, body.lectureTitle, notes);

  if (!hasGeminiApiKey()) {
    return NextResponse.json({
      notes: fallbackNotes,
      styleSummary,
      styleNoteCount: notes.length,
      mode: "fallback",
      warning: "GEMINI_API_KEY or GOOGLE_API_KEY is not set, so the app returned offline demo notes instead.",
    });
  }

  try {
    const output = await generateNotesWithGemini(
      buildPrompt(
        input,
        body.lectureTitle,
        notes.map((note) => `${note.title}\n${note.content}`),
        styleSummary,
      ),
    );

    return NextResponse.json({
      notes: output,
      styleSummary,
      styleNoteCount: notes.length,
      mode: "gemini",
    });
  } catch (error) {
    return NextResponse.json({
      notes: fallbackNotes,
      styleSummary,
      styleNoteCount: notes.length,
      mode: "fallback",
      warning: `Gemini request failed (${getErrorMessage(error)}). Returned offline demo notes instead.`,
    });
  }
}
