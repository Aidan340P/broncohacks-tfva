import { NextResponse } from "next/server";

import {
  describeGeminiFailure,
  getInlineAudioSoftLimitBytes,
  hasGeminiKey,
  toBase64,
  transcribeAudioInline,
} from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildFallbackTranscript(filename: string) {
  return `Transcription fallback for ${filename}: add GEMINI_API_KEY to get a real transcript, or paste lecture text manually for now.`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  const filename = file.name || "audio-upload";
  const mimeType = file.type || "audio/webm";

  if (!hasGeminiKey()) {
    const fallback = buildFallbackTranscript(filename);
    return NextResponse.json({
      text: fallback,
      transcript: fallback,
      mode: "fallback",
      filename,
      warning: "GEMINI_API_KEY or GOOGLE_API_KEY is not set, so the audio was not actually transcribed.",
    });
  }

  if (file.size > getInlineAudioSoftLimitBytes()) {
    const fallback = buildFallbackTranscript(filename);
    return NextResponse.json({
      text: fallback,
      transcript: fallback,
      mode: "fallback",
      filename,
      warning:
        "This audio file is too large for the inline Gemini transcription path used by this app. Keep uploads under roughly 18 MB or paste lecture text manually.",
    });
  }

  try {
    const buffer = await file.arrayBuffer();
    const transcript = await transcribeAudioInline({
      base64Data: toBase64(buffer),
      mimeType,
      filename,
    });

    return NextResponse.json({
      text: transcript,
      transcript,
      mode: "gemini",
      filename,
    });
  } catch (error) {
    const fallback = buildFallbackTranscript(filename);
    return NextResponse.json({
      text: fallback,
      transcript: fallback,
      mode: "fallback",
      filename,
      warning: `Gemini transcription failed (${describeGeminiFailure(error)}).`,
    });
  }
}
