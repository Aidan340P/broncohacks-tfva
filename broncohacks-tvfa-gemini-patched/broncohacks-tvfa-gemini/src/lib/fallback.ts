import type { UserNote } from "@/types";
import { buildDemoNotes } from "@/lib/utils";

export function buildFallbackNotes(input: string, notes: UserNote[], lectureTitle?: string) {
  return buildDemoNotes(input, lectureTitle, notes);
}
