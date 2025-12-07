"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TodayMedsList } from "@/components/TodayMedsList";
import { BottomNav } from "@/components/BottomNav";
import { AddMedicineDialog } from "@/components/AddMedicineDialog";
import { getTodayLabel } from "@/lib/meds";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import Link from "next/link";

export default function Home() {
  const { session, sessionLoading } = useSupabaseSession();
  const [meds, setMeds] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [loadingMeds, setLoadingMeds] = useState(true);

  const todayLabel = getTodayLabel();
  const userId = session?.user?.id;

  // Carica medicine quando ho un userId
  useEffect(() => {
    if (!userId) return;

    const fetchMeds = async () => {
      try {
        setLoadingMeds(true);
        const { data, error } = await supabase
          .from("meds")
          .select("*")
          .eq("user_id", userId)
          .order("time", { ascending: true });

        if (error) {
          console.error("Errore fetch meds:", error);
          setMeds([]);
        } else {
          setMeds(data || []);
        }
      } catch (err) {
        console.error("Errore generico fetch meds:", err);
        setMeds([]);
      } finally {
        setLoadingMeds(false);
      }
    };

    fetchMeds();
  }, [userId]);

  const medsForToday = meds.filter((m) => {
    if (m.days?.includes("Tutti i giorni")) return true;
    return m.days?.includes(todayLabel);
  });

  const openDialogForAdd = () => {
    setEditingMed(null);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (med) => {
    setEditingMed(med);
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingMed(null);
    }
  };

  const handleSaveMed = async (med) => {
    if (!userId) return;

    const payload = {
      user_id: userId,
      name: med.name,
      time: med.time,
      days: med.days,
      notes: med.notes,
    };

    const isEdit = med.id && meds.some((m) => m.id === med.id);

    if (isEdit) {
      const { data, error } = await supabase
        .from("meds")
        .update(payload)
        .eq("id", med.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Errore update med:", error);
        return;
      }

      setMeds((prev) => prev.map((m) => (m.id === med.id ? data : m)));
    } else {
      const { data, error } = await supabase
        .from("meds")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Errore insert med:", error);
        return;
      }

      setMeds((prev) => [...prev, data]);
    }
  };

  const handleDeleteMed = async (id) => {
    if (!userId) return;

    const { error } = await supabase
      .from("meds")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Errore delete med:", error);
      return;
    }

    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 1) Session in caricamento
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
        <p className="text-sm text-slate-600">Verifica sessione...</p>
      </div>
    );
  }

  // 2) Nessuna sessione → chiedi login
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900 px-4">
        <p className="mb-4 text-sm text-slate-700 text-center">
          Per usare Diario Medicine devi accedere.
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

  // 3) Utente loggato → normale UI
  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Header todayLabel={todayLabel} onOpenAdd={openDialogForAdd} />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Loggato come: {session.user.email}</span>
            <button
              onClick={handleLogout}
              className="text-emerald-600 hover:underline"
            >
              Esci
            </button>
          </div>

          {loadingMeds ? (
            <p className="text-sm text-slate-500">Caricamento medicine...</p>
          ) : (
            <TodayMedsList
              medsForToday={medsForToday}
              todayLabel={todayLabel}
              onEditMed={openDialogForEdit}
              onDeleteMed={handleDeleteMed}
            />
          )}
        </div>
      </main>

      <BottomNav onOpenAdd={openDialogForAdd} />

      <AddMedicineDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSaveMed={handleSaveMed}
        initialMed={editingMed}
      />
    </div>
  );
}
