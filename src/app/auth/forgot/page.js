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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus(null);

    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setStatus("Inserisci un'email valida");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset`
          : undefined,
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus(
        "Ti abbiamo inviato un'email con il link per reimpostare la password."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/70 shadow-lg shadow-sky-100/60">
        <CardHeader>
          <CardTitle>Recupera Password</CardTitle>
          <CardDescription>
            Inserisci la tua email per ricevere il link di reset.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="nome@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {status && (
              <p className="text-xs text-center text-emerald-600">{status}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Invio..." : "Invia link di reset"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/auth" className="text-emerald-600 hover:underline">
              Torna al login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
