"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatDate } from "@/lib/utils";
import type { Lecture, LectureInput } from "@/types";

const emptyForm: LectureInput = {
  title: "",
  course: "",
  instructor: "",
  content: "",
  sourceType: "text",
};

export function LecturesClient() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [form, setForm] = useState<LectureInput>(emptyForm);
  const [status, setStatus] = useState("Loading lectures...");
  const [busy, setBusy] = useState(false);

  async function loadLectures() {
    const response = await fetch("/api/lectures", { cache: "no-store" });
    const data = (await response.json()) as { lectures?: Lecture[] };
    const nextLectures = data.lectures ?? [];
    setLectures(nextLectures);
    setStatus(nextLectures.length > 0 ? "Lecture library loaded." : "No lectures saved yet.");
  }

  useEffect(() => {
    loadLectures().catch(() => setStatus("Couldn't load lectures right now."));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title?.trim() || !form.content?.trim()) {
      setStatus("Lecture title and content are required.");
      return;
    }

    setBusy(true);
    setStatus("Saving lecture...");

    const response = await fetch("/api/lectures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setBusy(false);
      setStatus("Save failed.");
      return;
    }

    setForm(emptyForm);
    await loadLectures();
    setBusy(false);
    setStatus("Lecture saved.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Add a lecture</h2>
        <p className="mt-1 text-sm text-slate-600">Store raw lecture text here so anyone can reuse it later.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="ex: Unit 4 review session"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Course
              <input
                value={form.course}
                onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="ex: BIO 101"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Instructor
              <input
                value={form.instructor}
                onChange={(event) => setForm((current) => ({ ...current, instructor: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="ex: Dr. Nguyen"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Lecture content
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              className="mt-2 min-h-72 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              placeholder="Paste transcript text, lecture notes, or slide text."
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition cursor-pointer hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save lecture
            </button>
            <p className="text-sm text-slate-500">{status}</p>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Lecture library</h2>
        <p className="mt-1 text-sm text-slate-600">Pick one and send it straight into the generator.</p>

        <div className="mt-6 space-y-4">
          {lectures.map((lecture) => (
            <article key={lecture.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{lecture.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {[lecture.course, lecture.instructor].filter(Boolean).join(" · ") || "No course metadata"}
                  </p>
                </div>
                <Link
                  href={`/generate?lecture=${lecture.id}`}
                  className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Use in generator
                </Link>
              </div>
              <p className="mt-3 line-clamp-4 text-sm text-slate-700">{lecture.content}</p>
              <p className="mt-3 text-xs text-slate-500">Added {formatDate(lecture.createdAt)}</p>
            </article>
          ))}

          {lectures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No lectures yet. Add one from the form on the left.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
