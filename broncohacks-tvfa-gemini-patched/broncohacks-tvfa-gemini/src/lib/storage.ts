import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { seedLectures } from "@/lib/seeds";
import type { Lecture, LectureInput, UserNote } from "@/types";

const dataDirectory = path.join(process.cwd(), "data");
const notesFile = path.join(dataDirectory, "notes.json");
const lecturesFile = path.join(dataDirectory, "lectures.json");

async function ensureDataDirectory() {
  await mkdir(dataDirectory, { recursive: true });
}

async function readCollection<T>(filePath: string, fallback: T[] = []): Promise<T[]> {
  await ensureDataDirectory();

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch (error) {
    const isMissing =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT";

    if (!isMissing) {
      return fallback;
    }

    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function writeCollection<T>(filePath: string, records: T[]) {
  await ensureDataDirectory();
  await writeFile(filePath, JSON.stringify(records, null, 2), "utf8");
}

export async function listNotes(): Promise<UserNote[]> {
  return readCollection<UserNote>(notesFile, []);
}

export async function getNoteById(id: string): Promise<UserNote | null> {
  const notes = await listNotes();
  return notes.find((note) => note.id === id) ?? null;
}

export async function saveNote(note: UserNote): Promise<UserNote> {
  const notes = await listNotes();
  const existingIndex = notes.findIndex((item) => item.id === note.id);

  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }

  await writeCollection(notesFile, notes);
  return note;
}

export async function updateNote(
  id: string,
  updates: { title: string; content: string }
): Promise<UserNote | null> {
  const current = await getNoteById(id);
  if (!current) {
    return null;
  }

  const nextNote: UserNote = {
    ...current,
    title: updates.title.trim(),
    content: updates.content.trim(),
    updatedAt: new Date().toISOString(),
  };

  return saveNote(nextNote);
}

export async function removeNote(id: string): Promise<boolean> {
  const notes = await listNotes();
  const nextNotes = notes.filter((note) => note.id !== id);

  if (nextNotes.length === notes.length) {
    return false;
  }

  await writeCollection(notesFile, nextNotes);
  return true;
}

export const deleteNote = removeNote;

export async function listLectures(): Promise<Lecture[]> {
  const lectures = await readCollection<Lecture>(lecturesFile, seedLectures);

  if (lectures.length === 0) {
    await writeCollection(lecturesFile, seedLectures);
    return seedLectures;
  }

  return lectures;
}

export async function getLectureById(id: string): Promise<Lecture | null> {
  const lectures = await listLectures();
  return lectures.find((lecture) => lecture.id === id) ?? null;
}

export async function saveLecture(lecture: Lecture): Promise<Lecture> {
  const lectures = await listLectures();
  const existingIndex = lectures.findIndex((item) => item.id === lecture.id);

  if (existingIndex >= 0) {
    lectures[existingIndex] = lecture;
  } else {
    lectures.unshift(lecture);
  }

  await writeCollection(lecturesFile, lectures);
  return lecture;
}

export async function createLecture(input: LectureInput): Promise<Lecture> {
  const now = new Date().toISOString();
  const lecture: Lecture = {
    id: randomUUID(),
    title: input.title.trim(),
    course: input.course?.trim() || undefined,
    instructor: input.instructor?.trim() || undefined,
    sourceType: input.sourceType ?? "text",
    content: input.content.trim(),
    createdAt: now,
    updatedAt: now,
  };

  return saveLecture(lecture);
}

export async function removeLecture(id: string): Promise<boolean> {
  const lectures = await listLectures();
  const nextLectures = lectures.filter((lecture) => lecture.id !== id);

  if (nextLectures.length === lectures.length) {
    return false;
  }

  await writeCollection(lecturesFile, nextLectures);
  return true;
}

export const deleteLecture = removeLecture;
