"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Supabase mette automaticamente l'utente in "modalità reset".
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setIsReady(true);
      } else {
        setStatus("Link di reset non valido o scaduto.");
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (password.length < 6) {
      setStatus("La password deve avere almeno 6 caratteri.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Password aggiornata con successo! 👌");

    setTimeout(() => {
      router.push("/auth");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-white/70 shadow-lg shadow-sky-100/60">
        <CardHeader>
          <CardTitle>Imposta nuova password</CardTitle>
          <CardDescription>
            Inserisci la tua nuova password qui sotto.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <p className="text-sm text-red-500">{status}</p>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                type="password"
                placeholder="Nuova password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {status && (
                <p className="text-xs text-center text-emerald-600">
                  {status}
                </p>
              )}

              <Button type="submit" className="w-full">
                Aggiorna password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
