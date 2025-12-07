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
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // success/error message
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setStatus(null);
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setStatus("Inserisci email e password");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          setStatus(error.message);
        } else {
          setStatus("Registrazione completata! Ora puoi effettuare il login.");
          setMode("login");
        }
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          setStatus(error.message);
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setStatus("Errore imprevisto, riprova");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg shadow-sky-100/60">
        <CardHeader>
          <CardTitle className="text-slate-900 text-lg">
            {mode === "login" ? "Accedi" : "Registrati"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {mode === "login"
              ? "Inserisci email e password per accedere."
              : "Crea un nuovo account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Email</label>
              <Input
                type="email"
                placeholder="nome@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/80 border-slate-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/80 border-slate-200"
              />
            </div>

            <div className="text-right">
            <Link href="/auth/forgot" className="text-emerald-600 text-sm hover:underline">
                Password dimenticata?
            </Link>
            </div>

            {status && (
              <p className="text-xs text-center text-red-500">{status}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-white"
            >
              {loading
                ? "Attendere..."
                : mode === "login"
                ? "Accedi"
                : "Registrati"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={toggleMode}
              className="text-emerald-600 hover:underline"
            >
              {mode === "login"
                ? "Non hai un account? Registrati"
                : "Hai già un account? Accedi"}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Torna alla{" "}
            <Link href="/" className="text-emerald-600 hover:underline">
              Home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
