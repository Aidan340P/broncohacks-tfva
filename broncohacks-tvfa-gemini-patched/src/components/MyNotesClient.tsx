"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDate } from "@/lib/utils";
import type { Note, NoteInput } from "@/types";

const emptyForm: NoteInput = {
  title: "",
  content: "",
};

export function MyNotesClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState<NoteInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Loading notes...");
  const [busy, setBusy] = useState(false);

  async function loadNotes() {
    const response = await fetch("/api/notes", { cache: "no-store" });
    const data = (await response.json()) as { notes?: Note[] };
    const nextNotes = data.notes ?? [];
    setNotes(nextNotes);
    setStatus(nextNotes.length >= 3 ? "Style library looks healthy." : "Add at least 3 notes for better style matching.");
  }

  useEffect(() => {
    loadNotes().catch(() => setStatus("Couldn't load notes right now."));
  }, []);

  const noteCountLabel = useMemo(() => `${notes.length} saved style sample${notes.length === 1 ? "" : "s"}`, [notes.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setStatus("Title and content are both required.");
      return;
    }

    setBusy(true);
    setStatus(editingId ? "Updating note..." : "Saving note...");

    const response = await fetch(editingId ? `/api/notes/${editingId}` : "/api/notes", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setBusy(false);
      setStatus("Save failed. Check the terminal for server errors.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadNotes();
    setBusy(false);
    setStatus(editingId ? "Note updated." : "Note saved.");
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setStatus("Deleting note...");
    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setBusy(false);
      setStatus("Delete failed.");
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    await loadNotes();
    setBusy(false);
    setStatus("Note deleted.");
  }

  function handleEdit(note: Note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
    setStatus(`Editing \"${note.title}\".`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Train your style</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add your real notes here. The generator uses them as writing-style examples.
            </p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{noteCountLabel}</span>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="ex: bio unit 3 lecture"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Note content
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              className="mt-2 min-h-64 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
              placeholder="Paste a note sample written in your natural style."
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition cursor-pointer hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId ? "Update note" : "Save note"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setStatus("Edit cancelled.");
                }}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Cancel edit
              </button>
            ) : null}
            <p className="text-sm text-slate-500">{status}</p>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Saved notes</h2>
        <p className="mt-1 text-sm text-slate-600">These are the note samples the app can learn from.</p>

        <div className="mt-5 space-y-4">
          {notes.map((note) => (
            <article key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{note.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">Updated {formatDate(note.updatedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:border-rose-600 hover:text-rose-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{note.content}</pre>
            </article>
          ))}

          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No notes saved yet. Add a few examples so the generator has something to imitate.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
