import { getErrorMessage } from "@/lib/utils";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const MAX_INLINE_AUDIO_BYTES = 20 * 1024 * 1024;

const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/aiff",
  "audio/x-aiff",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
]);

type GeminiTextResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null;
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function getGeminiTranscriptionModel() {
  return process.env.GEMINI_TRANSCRIPTION_MODEL?.trim() || getGeminiModel();
}

function extractGeminiText(payload: GeminiTextResponse) {
  const text = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error(payload.error?.message || "Gemini returned an empty response.");
  }

  return text;
}

async function callGemini(parts: Array<Record<string, unknown>>, model: string) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY.");
  }

  const response = await fetch(`${GEMINI_API_URL}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    }),
  });

  const payload = (await response.json()) as GeminiTextResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini request failed with status ${response.status}.`);
  }

  return extractGeminiText(payload);
}

function normalizeMimeType(file: File) {
  const rawMime = file.type?.trim().toLowerCase();
  if (rawMime) {
    if (rawMime === "audio/mpeg") return "audio/mp3";
    if (rawMime === "audio/x-wav") return "audio/wav";
    if (rawMime === "audio/x-aiff") return "audio/aiff";
    return rawMime;
  }

  const lowered = file.name.toLowerCase();
  if (lowered.endsWith(".wav")) return "audio/wav";
  if (lowered.endsWith(".mp3")) return "audio/mp3";
  if (lowered.endsWith(".aiff") || lowered.endsWith(".aif")) return "audio/aiff";
  if (lowered.endsWith(".aac")) return "audio/aac";
  if (lowered.endsWith(".ogg")) return "audio/ogg";
  if (lowered.endsWith(".flac")) return "audio/flac";
  return "";
}

function assertSupportedAudioFile(file: File) {
  const mimeType = normalizeMimeType(file);

  if (!mimeType || !SUPPORTED_AUDIO_MIME_TYPES.has(mimeType)) {
    throw new Error(
      "Unsupported audio format. Use WAV, MP3, AIFF, AAC, OGG, or FLAC. Browser-recorded WebM audio is not converted automatically.",
    );
  }

  if (file.size > MAX_INLINE_AUDIO_BYTES) {
    throw new Error("Audio file is too large for inline Gemini transcription in this app. Keep it under 20 MB.");
  }

  return mimeType;
}

export async function generateNotesWithGemini(prompt: string) {
  return callGemini([{ text: prompt }], getGeminiModel());
}

export async function transcribeAudioWithGemini(file: File) {
  const mimeType = assertSupportedAudioFile(file);
  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  const prompt = [
    "Generate a clean transcript of the speech in this audio file.",
    "Only return the transcript text.",
    "Do not add headings, notes, bullet points, timestamps, or commentary.",
  ].join(" ");

  return callGemini(
    [
      { text: prompt },
      {
        inline_data: {
          mime_type: mimeType,
          data: bytes,
        },
      },
    ],
    getGeminiTranscriptionModel(),
  );
}

export function buildGeminiWarning(error: unknown) {
  return `Gemini request failed (${getErrorMessage(error)}). Returned fallback output instead.`;
}
