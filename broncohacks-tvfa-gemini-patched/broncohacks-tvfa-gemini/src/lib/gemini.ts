import { getErrorMessage } from "@/lib/utils";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";
const INLINE_AUDIO_SOFT_LIMIT_BYTES = 18 * 1024 * 1024;

type GeminiTextPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiTextPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

function getApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

function getModel(model: string | undefined) {
  return model?.trim() || process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function extractText(payload: GeminiResponse) {
  const text =
    payload.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error(payload.error?.message || "Gemini returned an empty response.");
  }

  return text;
}

async function callGenerateContent(body: Record<string, unknown>, model: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini request failed with ${response.status}.`);
  }

  return payload;
}

export function hasGeminiKey() {
  return Boolean(getApiKey());
}

export function getInlineAudioSoftLimitBytes() {
  return INLINE_AUDIO_SOFT_LIMIT_BYTES;
}

export async function generateStudyNotes(options: {
  prompt: string;
  model?: string;
}) {
  const payload = await callGenerateContent(
    {
      contents: [
        {
          role: "user",
          parts: [{ text: options.prompt }],
        },
      ],
    },
    getModel(options.model)
  );

  return extractText(payload);
}

export async function transcribeAudioInline(options: {
  base64Data: string;
  mimeType: string;
  filename: string;
  model?: string;
}) {
  const prompt = [
    `Transcribe the spoken audio from the file named "${options.filename}".`,
    "Return only the transcript text.",
    "Do not add speaker labels, bullet points, timestamps, explanations, or summaries unless they are literally spoken.",
  ].join(" ");

  const payload = await callGenerateContent(
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: options.mimeType,
                data: options.base64Data,
              },
            },
          ],
        },
      ],
    },
    getModel(options.model || process.env.GEMINI_TRANSCRIPTION_MODEL)
  );

  return extractText(payload);
}

export function toBase64(buffer: ArrayBuffer) {
  return Buffer.from(buffer).toString("base64");
}

export function describeGeminiFailure(error: unknown) {
  return getErrorMessage(error);
}
