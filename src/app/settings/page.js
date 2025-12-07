"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import Link from "next/link";

export default function SettingsPage() {
  const { session, sessionLoading } = useSupabaseSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("email")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Errore fetch settings:", error);
        }

        if (data?.email) {
          setEmail(data.email);
        }
      } catch (e) {
        console.error("Errore generico fetch settings:", e);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const trimmed = email.trim();

    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      return;
    }

    try {
      const { error } = await supabase.from("settings").upsert({
        user_id: userId,
        email: trimmed,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Errore upsert settings:", error);
        setStatus("error");
        return;
      }

      setStatus("saved");
    } catch (e) {
      console.error("Errore generico upsert settings:", e);
      setStatus("error");
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
        <p className="text-sm text-slate-600">Verifica sessione...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900 px-4">
        <p className="mb-4 text-sm text-slate-700 text-center">
          Per modificare le impostazioni devi accedere.
        </p>
        <Link
          href="/auth"
          className="px-4 py-2 rounded-md bg-emerald-500 text-white text-sm shadow-md shadow-emerald-200/60 hover:bg-emerald-600"
        >
          Vai alla pagina di login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Impostazioni</h1>

        <Card className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg shadow-sky-100/60">
          <CardHeader>
            <CardTitle className="text-slate-900">Reminder giornalieri</CardTitle>
            <CardDescription className="text-slate-600">
              Imposta la tua email per ricevere promemoria personalizzati sulle
              medicine giornaliere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSettings ? (
              <p className="text-sm text-slate-500">
                Caricamento impostazioni...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">
                    Email per i reminder
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
                  <p className="text-xs text-slate-500">
                    In futuro useremo questa email per inviarti un riepilogo
                    delle medicine del giorno.
                  </p>
                </div>

                {status === "saved" && (
                  <p className="text-xs text-emerald-600">
                    ✅ Impostazioni salvate.
                  </p>
                )}

                {status === "error" && (
                  <p className="text-xs text-red-500">
                    ⚠️ Inserisci un indirizzo email valido o riprova più tardi.
                  </p>
                )}

                <Button
                  type="submit"
                  className="bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
                >
                  Salva impostazioni
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
