"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "sent" | "error"
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/`
              : undefined,
        },
      });

      if (error) {
        console.error("Errore signInWithOtp:", error);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err) {
      console.error("Errore generico login:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg shadow-sky-100/60">
        <CardHeader>
          <CardTitle className="text-slate-900 text-lg">
            Accedi a Diario Medicine
          </CardTitle>
          <CardDescription className="text-slate-600">
            Inserisci la tua email, ti invieremo un link di accesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">
                Email
              </label>
              <Input
                type="email"
                placeholder="es. nome@dominio.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus(null);
                }}
                className="bg-white/80 border-slate-200 focus:ring-emerald-400 focus:border-emerald-400"
              />
            </div>

            {status === "sent" && (
              <p className="text-xs text-emerald-600">
                ✅ Controlla la tua email: ti abbiamo inviato un link.
              </p>
            )}

            {status === "error" && (
              <p className="text-xs text-red-500">
                ⚠️ Qualcosa è andato storto. Verifica l&apos;email o riprova.
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
            >
              {loading ? "Invio..." : "Mandami il link di accesso"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Torna alla{" "}
            <Link href="/" className="text-emerald-600 hover:underline">
              home
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
