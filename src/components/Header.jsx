// components/Header.jsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header({ todayLabel, onOpenAdd }) {
  return (
    <header className="border-b border-white/50 bg-white/60 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Diario Medicine</h1>
          {todayLabel && (
            <p className="text-xs text-slate-600">
              Oggi è <span className="font-medium">{todayLabel}</span>
            </p>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-800 bg-white/70 hover:bg-white"
            >
              Home
            </Button>
          </Link>

          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-800 bg-white/70 hover:bg-white"
            >
              Impostazioni
            </Button>
          </Link>

          {onOpenAdd && (
            <Button
              size="sm"
              className="bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
              onClick={onOpenAdd}
            >
              Aggiungi medicina
            </Button>
          )}

          
        </div>
      </div>
    </header>
  );
}
