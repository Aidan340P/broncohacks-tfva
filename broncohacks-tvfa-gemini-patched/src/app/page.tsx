import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
const featureCards = [
  {
    title: "Train your style",
    body: "Save your own notes so the generator can copy your formatting, shorthand, and level of detail.",
  },
  {
    title: "Generate from text or audio",
    body: "Paste lecture text, transcribe an upload, or record live audio in the browser before generating notes.",
  },
  {
    title: "Use the lecture library",
    body: "Store reusable lecture content so you can regenerate personalized notes whenever you need them.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen space-y-16">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-sky-950/20 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn lectures into notes that sound like you.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Your notes. Your style. Any lecture.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/my-notes"
                className="rounded-full bg-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
              >
                Add style notes
              </Link>
              <Link
                href="/generate"
                className="rounded-full bg-slate-900 border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Generate notes
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Quick start</p>
            <ol className="space-y-4 text-sm leading-6 text-slate-300">
              <li>1. Open <a href="/my-notes" className="font-medium text-white hover:text-white-400 hover:underline hover:decoration-1"><span className="font-medium text-white">My Notes</span></a> and add a few real note samples.</li>
              <li>2. Open <a href="/generate" className="font-medium text-white hover:text-white-400 hover:underline hover:decoration-1"><span className="font-medium text-white">Generate</span></a> and paste a lecture or transcribe audio.</li>
              <li>3. Open <a href="/lecture-library" className="font-medium text-white hover:text-white-400 hover:underline hover:decoration-1"><span className="font-medium text-white">Lecture Library</span></a> to reuse saved lectures.</li>
            </ol>
          </div>
        </div>
      </section>
      <RevealOnScroll>
      <section className="grid gap-5 md:grid-cols-3">
        {featureCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">{card.title}</h2>
            <p className="text-sm leading-6 text-slate-300">{card.body}</p>
          </article>
        ))}
      </section>
      </RevealOnScroll>
      <RevealOnScroll>
  <section className="mx-auto max-w-6xl px-6 py-20">
    <div className="mb-12 text-center">
      <h2 className="text-3xl font-bold text-sky">How it works</h2>
      <p className="mt-4 text-slate-400">
        A simple workflow that turns lectures into notes written in your style.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold text-white">1. Upload your notes</h3>
        <p className="mt-3 text-slate-400">
          Train the AI on your personal writing style, formatting, and level of detail.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold text-white">2. Add lecture content</h3>
        <p className="mt-3 text-slate-400">
          Paste lecture text, upload recordings, or capture live lectures directly in the app.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold text-white">3. Generate your notes</h3>
        <p className="mt-3 text-slate-400">
          Get personalized notes that feel like you wrote them, making studying easier and more familiar.
        </p>
      </div>
    </div>
  </section>
</RevealOnScroll>
<RevealOnScroll>
  <section className="mx-auto max-w-6xl px-6 py-24">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-sky">Why it matters</h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-400">
        Students learn better when notes match how they naturally organize and process information.
      </p>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">Personalized to you</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Instead of generic summaries, NoteAI adapts to your formatting, shorthand, and preferred level of detail.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">Built for real lectures</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Turn transcripts, recordings, and shared class materials into notes that feel familiar and easier to review.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold text-white">Designed for better learning</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Familiar structure can improve comprehension, retention, and confidence when studying new material.
        </p>
      </div>
    </div>
  </section>
</RevealOnScroll>
<RevealOnScroll>
  <section className="mx-auto max-w-5xl px-6 pb-24">
    <div className="rounded-3xl border border-500/20 bg-sky-500/100 p-10 text-center">
      <h2 className="text-3xl font-bold text-black">Start building your note style</h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-300">
        Upload your own notes, train the model on how you write, and turn any lecture into study material that feels natural to you.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/my-notes"
          className="rounded-full border border-slate-700 bg-sky-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
        >
          Upload notes
        </Link>
        <Link
          href="/lectures"
          className="rounded-full border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Browse lectures
        </Link>
      </div>
    </div>
  </section>
</RevealOnScroll>
    </div>
  );
}
