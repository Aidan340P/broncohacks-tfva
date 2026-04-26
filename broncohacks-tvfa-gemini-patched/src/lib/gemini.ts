export {
  buildGeminiWarning,
  generateNotesWithGemini as generateStudyNotes,
  getGeminiApiKey,
  getGeminiInlineAudioLimitBytes as getInlineAudioSoftLimitBytes,
  hasGeminiApiKey as hasGeminiKey,
  transcribeAudioWithGemini as transcribeAudioInline,
} from "@/lib/ai";

export function toBase64(input: ArrayBuffer) {
  return Buffer.from(input).toString("base64");
}

export function describeGeminiFailure(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
