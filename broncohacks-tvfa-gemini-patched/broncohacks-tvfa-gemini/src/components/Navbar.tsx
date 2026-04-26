import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/my-notes", label: "My Notes" },
  { href: "/generate", label: "Generate" },
  { href: "/lectures", label: "Lectures" },
];

export function Navbar() {
  return (
    <header className="border-b border-black/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          NoteAI
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 transition hover:bg-slate-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
