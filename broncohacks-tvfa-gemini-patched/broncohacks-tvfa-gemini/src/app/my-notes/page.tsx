"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserNote } from "@/types";
import { formatDate } from "@/lib/utils";

type NoteForm = {
  title: string;
  content: string;
};

const emptyForm: NoteForm = { title: "", content: "" };

export default function MyNotesPage() {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [form, setForm] = useState<NoteForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function loadNotes() {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/notes", { cache: "no-store" });
      const data = (await response.json()) as { notes?: UserNote[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load notes");
      }

      setNotes(data.notes ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  const styleReadiness = useMemo(() => {
    if (notes.length >= 3) return "Style training ready";
    if (notes.length === 0) return "Add 3 notes to train your style";
    return `Add ${3 - notes.length} more note${3 - notes.length === 1 ? "" : "s"} to train your style`;
  }, [notes.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    const endpoint = editingId ? `/api/notes/${editingId}` : "/api/notes";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save note");
      }

      setForm(emptyForm);
      setEditingId(null);
      setStatus(editingId ? "Note updated." : "Note saved.");
      await loadNotes();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(note: UserNote) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
    setStatus(`Editing “${note.title}”.`);
  }

  async function handleDelete(id: string) {
    setStatus("");

    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete note");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setStatus("Note deleted.");
      await loadNotes();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete note");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Style trainer</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">My Notes</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Save a few notes written in your own style. The generator uses these as examples.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">{styleReadiness}</p>
          <p className="mt-2">The more real examples you add, the less generic the generated notes feel.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Week 4 biology lecture"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="content">
              Note content
            </label>
            <textarea
              id="content"
              rows={14}
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Paste notes that actually sound like you."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update note" : "Save note"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setStatus("Edit cancelled.");
                }}
                className="rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        {status ? <p className="text-sm text-sky-200">{status}</p> : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Saved notes</h2>
            <p className="mt-2 text-sm text-slate-300">These are the samples used to imitate your style.</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">{notes.length} total</span>
        </div>

        {loading ? <p className="text-sm text-slate-300">Loading notes...</p> : null}

        {!loading && notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
            No notes yet. Add one on the left to start training the generator.
          </div>
        ) : null}

        <div className="space-y-4">
          {notes.map((note) => (
            <article key={note.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-white">{note.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(note.id)}
                    className="rounded-full border border-rose-500/40 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-300">{note.content}</pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
