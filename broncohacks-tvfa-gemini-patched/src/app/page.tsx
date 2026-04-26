import Link from "next/link";

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
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-sky-950/20 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm text-sky-200">
              BroncoHacks project scaffold restored
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn lectures into notes that sound like you.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This repo now has a working Next.js App Router skeleton with pages, API routes, JSON storage,
                and a built-in offline fallback so you can test the full flow even before your API key is set.
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

      <section className="grid gap-5 md:grid-cols-3">
        {featureCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">{card.title}</h2>
            <p className="text-sm leading-6 text-slate-300">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 text-sm leading-6 text-amber-100">
        <p className="font-medium text-amber-50">Heads up</p>
        <p className="mt-2">
          JSON file storage is fine for local testing, but it is not durable production storage. If you deploy this
          later, move notes and lectures to a real database.
        </p>
      </section>
    </div>
  );
}
