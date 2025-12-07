import Link from "next/link";
import { Home, Plus, Settings } from "lucide-react";

export function BottomNav({ onOpenAdd }) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-white/60 bg-white/70 backdrop-blur-2xl z-30">
      <div className="max-w-3xl mx-auto flex">

        {/* Home */}
        <Link
          href="/"
          className="flex-1 py-2 flex flex-col items-center justify-center text-xs text-slate-700"
        >
          <Home className="w-5 h-5 mb-0.5 stroke-slate-700" />
          Home
        </Link>

        {/* Add medicine */}
        <button
          className="flex-1 py-2 flex flex-col items-center justify-center text-xs text-emerald-600 font-medium"
          onClick={onOpenAdd}
        >
          <Plus className="w-5 h-5 mb-0.5 stroke-emerald-600" />
          Aggiungi
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className="flex-1 py-2 flex flex-col items-center justify-center text-xs text-slate-700"
        >
          <Settings className="w-5 h-5 mb-0.5 stroke-slate-700" />
          Impostazioni
        </Link>

      </div>
    </nav>
  );
}
