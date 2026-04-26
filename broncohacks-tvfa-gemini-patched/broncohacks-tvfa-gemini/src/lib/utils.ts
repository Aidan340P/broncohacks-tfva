import type { Note } from "@/types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
]);

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function excerpt(value: string, maxLength = 160) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function makeTitle(content: string, fallback = "Untitled") {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return fallback;
  }

  return excerpt(firstLine, 64) || fallback;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

export function getStyleSummary(notes: Note[]) {
  if (notes.length === 0) {
    return "No saved notes yet, so the generator will use a clean default outline.";
  }

  const joined = notes.map((note) => note.content).join("\n");
  const lineSamples = joined
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);

  const usesArrows = joined.includes("->");
  const usesAbbrev = /\b(resp|bc|w\/|w\/o|ex|ex\.)\b/i.test(joined);
  const usesNumbering = lineSamples.some((line) => /^\d+[.)]/.test(line));
  const usesBullets = lineSamples.some((line) => /^[-*]/.test(line));
  const lowercaseHeavy = lineSamples.filter((line) => /^[a-z]/.test(line)).length > lineSamples.length / 2;

  const traits = [
    lowercaseHeavy ? "mostly lowercase wording" : "standard sentence casing",
    usesArrows ? "frequent arrows for cause/effect" : null,
    usesAbbrev ? "uses shorthand abbreviations" : null,
    usesNumbering ? "likes numbered breakdowns" : null,
    usesBullets ? "uses quick bullet lists" : "leans toward paragraph notes",
  ].filter(Boolean);

  return `Style cues: ${traits.join(", ")}. Match the user's formatting without copying the examples verbatim.`;
}

export function buildDemoNotes(sourceText: string, lectureTitle: string | undefined, notes: Note[]) {
  const cleaned = sourceText.replace(/\s+/g, " ").trim();
  const styleSummary = getStyleSummary(notes);
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const frequency = new Map<string, number>();
  for (const word of cleaned.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
    if (STOP_WORDS.has(word)) continue;
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  const topTerms = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([term]) => term);

  const intro = lectureTitle ? `${lectureTitle}\n` : "Lecture Notes\n";
  const bullets = sentences.slice(0, 6).map((sentence) => `- ${sentence}`).join("\n");
  const vocab = topTerms.length > 0 ? `\n\nkey terms: ${topTerms.join(", ")}` : "";

  return `${intro}\n${bullets}${vocab}\n\n[demo mode]\n${styleSummary}`.trim();
}
