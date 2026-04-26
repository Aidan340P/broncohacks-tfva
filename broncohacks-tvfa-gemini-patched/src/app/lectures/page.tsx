"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lecture } from "@/types";
import { excerpt, formatDate } from "@/lib/utils";

type LectureForm = {
  title: string;
  content: string;
  sourceType: Lecture["sourceType"];
};

const emptyForm: LectureForm = {
  title: "",
  content: "",
  sourceType: "library",
};

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [form, setForm] = useState<LectureForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function loadLectures() {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/lectures", { cache: "no-store" });
      const data = (await response.json()) as { lectures?: Lecture[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load lectures");
      }

      setLectures(data.lectures ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLectures();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save lecture");
      }

      setForm(emptyForm);
      setStatus("Lecture saved.");
      await loadLectures();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save lecture");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setStatus("");

    try {
      const response = await fetch(`/api/lectures/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete lecture");
      }

      setStatus("Lecture deleted.");
      await loadLectures();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete lecture");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Shared library</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Lecture Library</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Save reusable lecture text so you can generate personalized notes from it later.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="lecture-title">
              Title
            </label>
            <input
              id="lecture-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Week 7: Cellular Respiration"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="source-type">
              Source type
            </label>
            <select
              id="source-type"
              value={form.sourceType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sourceType: event.target.value as Lecture["sourceType"],
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            >
              <option value="library">Library</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="lecture-content">
              Lecture content
            </label>
            <textarea
              id="lecture-content"
              rows={16}
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Paste lecture transcript, slide text, or a cleaned transcript here."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 transition cursor-pointer hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save lecture"}
          </button>
        </form>

        {status ? <p className="text-sm text-sky-200">{status}</p> : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Saved lectures</h2>
            <p className="mt-2 text-sm text-slate-300">
              A sample lecture is seeded automatically so you can test the app right away.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            {lectures.length} total
          </span>
        </div>

        {loading ? <p className="text-sm text-slate-300">Loading lectures...</p> : null}

        <div className="space-y-4">
          {lectures.map((lecture) => (
            <article key={lecture.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-white">{lecture.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {lecture.sourceType} • updated {formatDate(lecture.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/generate?lectureId=${lecture.id}`}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    Open in generator
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDelete(lecture.id)}
                    className="rounded-full border border-rose-500/40 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{excerpt(lecture.content, 260)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
