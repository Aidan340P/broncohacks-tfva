"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { formatDate } from "@/lib/utils";
import type { GenerateResponseBody, Lecture, Note, TranscribeResponseBody } from "@/types";

export function GenerateClient() {
  const searchParams = useSearchParams();
  const initialLectureId = searchParams.get("lecture");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string>(initialLectureId ?? "");
  const [sourceText, setSourceText] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [result, setResult] = useState<GenerateResponseBody | null>(null);
  const [status, setStatus] = useState("Loading note samples...");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  async function bootstrap() {
    const [notesResponse, lecturesResponse] = await Promise.all([
      fetch("/api/notes", { cache: "no-store" }),
      fetch("/api/lectures", { cache: "no-store" }),
    ]);

    const notesData = (await notesResponse.json()) as { notes?: Note[] };
    const lecturesData = (await lecturesResponse.json()) as { lectures?: Lecture[] };

    const nextNotes = notesData.notes ?? [];
    const nextLectures = lecturesData.lectures ?? [];

    setNotes(nextNotes);
    setLectures(nextLectures);

    const startingLecture = nextLectures.find((lecture) => lecture.id === initialLectureId) ?? nextLectures[0] ?? null;
    if (startingLecture && !sourceText) {
      setSelectedLectureId(startingLecture.id);
      setSourceText(startingLecture.content);
      setLectureTitle(startingLecture.title);
    }

    setStatus(
      nextNotes.length >= 3
        ? "Ready. Your style samples are loaded."
        : "Ready, but style matching will be better after you add at least 3 note samples."
    );
  }

  useEffect(() => {
    bootstrap().catch(() => setStatus("Failed to load starter data."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLecture = useMemo(
    () => lectures.find((lecture) => lecture.id === selectedLectureId) ?? null,
    [lectures, selectedLectureId]
  );

  function loadLectureIntoEditor() {
    if (!selectedLecture) {
      setStatus("Pick a lecture first.");
      return;
    }
    setSourceText(selectedLecture.content);
    setLectureTitle(selectedLecture.title);
    setStatus(`Loaded \"${selectedLecture.title}\" into the editor.`);
  }

  async function transcribeBlob(blob: Blob, filename: string) {
    const formData = new FormData();
    formData.append("file", blob, filename);

    setBusy(true);
    setStatus("Transcribing audio...");

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as Partial<TranscribeResponseBody> & { error?: string };
    const transcript = data.transcript ?? data.text;

    if (!response.ok || !transcript) {
      setBusy(false);
      setStatus(data.error ?? "Transcription failed.");
      return;
    }

    setSourceText((current) => [current.trim(), transcript.trim()].filter(Boolean).join("\n\n"));
    setStatus(data.mode === "gemini" ? "Transcript added to the editor." : "Fallback transcript placeholder inserted.");
    setBusy(false);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await transcribeBlob(file, file.name);
    event.target.value = "";
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const preferredMimeType = [
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/webm;codecs=opus",
      "audio/webm",
    ].find((value) => MediaRecorder.isTypeSupported?.(value));
    const recorder = preferredMimeType
      ? new MediaRecorder(stream, { mimeType: preferredMimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      setRecording(false);
      const recordedType = recorder.mimeType || preferredMimeType || "audio/webm";
      const extension = recordedType.includes("ogg") ? "ogg" : "webm";
      const blob = new Blob(chunksRef.current, { type: recordedType });
      stream.getTracks().forEach((track) => track.stop());
      await transcribeBlob(blob, `live-recording.${extension}`);
    };

    recorder.start();
    setRecording(true);
    setStatus("Recording... click stop when you're done.");
  }

  async function handleGenerate() {
    if (!sourceText.trim()) {
      setStatus("Add lecture text or transcribe audio first.");
      return;
    }

    setBusy(true);
    setResult(null);
    setStatus("Generating notes...");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceText,
        lectureTitle: lectureTitle || selectedLecture?.title || undefined,
      }),
    });

    const data = (await response.json()) as Partial<GenerateResponseBody> & { error?: string };

    if (!response.ok || !data.notes || !data.styleSummary || !data.mode || typeof data.styleNoteCount !== "number") {
      setBusy(false);
      setStatus(data.error ?? "Generation failed.");
      return;
    }

    setResult(data as GenerateResponseBody);
    setBusy(false);
    setStatus(data.mode === "gemini" ? "Notes generated with Gemini." : "Notes generated in fallback mode.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Lecture input</h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste raw text, load a lecture from the library, upload audio, or record live.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-sm font-medium text-slate-700">
            Load from lecture library
            <select
              value={selectedLectureId}
              onChange={(event) => setSelectedLectureId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="">Choose a lecture</option>
              {lectures.map((lecture) => (
                <option key={lecture.id} value={lecture.id}>
                  {lecture.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={loadLectureIntoEditor}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Load lecture
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Lecture title (optional)
          <input
            value={lectureTitle}
            onChange={(event) => setLectureTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="ex: Intro to machine learning"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Source text
          <textarea
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            className="mt-2 min-h-80 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Paste slides, transcript text, or lecture notes here."
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-100">
            Upload audio to transcribe
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            type="button"
            onClick={toggleRecording}
            className="rounded-2xl border border-slate-300 px-4 py-5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            {recording ? "Stop recording + transcribe" : "Start live recording"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={handleGenerate}
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition cursor-pointer hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate notes
          </button>
          <p className="text-sm text-slate-500">{status}</p>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Output</h2>
          <p className="mt-1 text-sm text-slate-600">Generated notes appear here.</p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Style samples</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{notes.length}</p>
            <p className="mt-1 text-sm text-slate-600">More samples generally improve tone matching.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Library lectures</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{lectures.length}</p>
            <p className="mt-1 text-sm text-slate-600">Latest: {selectedLecture ? `${selectedLecture.title} · ${formatDate(selectedLecture.createdAt)}` : "none"}</p>
          </div>
        </div>

        {result ? (
          <>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">mode: {result.mode}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">ready to copy</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Style summary</p>
              <p className="mt-2 text-sm text-slate-700">{result.styleSummary}</p>
            </div>
            <pre className="min-h-96 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-5 text-sm leading-6 text-slate-50">
              {result.notes}
            </pre>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Nothing generated yet. Add a lecture on the left and click generate.
          </div>
        )}
      </section>
    </div>
  );
}
