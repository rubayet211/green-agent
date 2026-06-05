"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, History, Cpu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0E1A] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30">
      {/* Keep decorative glows out of document geometry on narrow screens. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-64 w-64 sm:h-96 sm:w-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 sm:h-96 sm:w-96 bg-sky-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 group-hover:border-emerald-400 transition-all">
              <Leaf className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent max-[420px]:sr-only">
              GreenAgent
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-emerald-400 flex items-center gap-2 ${
                pathname === "/" ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span className="max-[420px]:sr-only">Copilot</span>
            </Link>
            <Link
              href="/history"
              className={`text-sm font-medium transition-colors hover:text-emerald-400 flex items-center gap-2 ${
                pathname === "/history" ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              <History className="h-4 w-4" />
              <span className="max-[420px]:sr-only">History</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main core layout wrapper */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>

      {/* Footer layout */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 GreenAgent hackathon MVP. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real and simulated integration status shown per action
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
