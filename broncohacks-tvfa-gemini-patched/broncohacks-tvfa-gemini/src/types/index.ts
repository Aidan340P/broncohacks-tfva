export type SourceType = "text" | "audio" | "live" | "library";
export type ModelMode = "gemini" | "fallback";

export interface UserNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Note = UserNote;

export interface Lecture {
  id: string;
  title: string;
  course?: string;
  instructor?: string;
  sourceType: SourceType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  content: string;
}

export interface LectureInput {
  title: string;
  course?: string;
  instructor?: string;
  content: string;
  sourceType?: SourceType;
}

export interface GenerateRequestBody {
  input?: string;
  sourceText?: string;
  lectureTitle?: string;
  selectedNoteIds?: string[];
}

export interface GenerateResponse {
  notes: string;
  styleSummary: string;
  styleNoteCount: number;
  mode: ModelMode;
  warning?: string;
}

export type GenerateResponseBody = GenerateResponse;

export interface TranscribeResponse {
  text: string;
  transcript: string;
  filename?: string;
  mode: ModelMode;
  warning?: string;
}

export type TranscribeResponseBody = TranscribeResponse;
