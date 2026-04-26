import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "NoteAI",
  description: "AI-powered lecture notes that match your writing style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
