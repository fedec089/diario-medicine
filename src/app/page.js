"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { TodayMedsList } from "@/components/TodayMedsList";
import { BottomNav } from "@/components/BottomNav";
import { AddMedicineDialog } from "@/components/AddMedicineDialog";
import { getTodayLabel } from "@/lib/meds";
import { WeeklyMedsList } from "@/components/WeeklyMedsList";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import Link from "next/link";

export default function Home() {
  const { session, sessionLoading } = useSupabaseSession();
  const [meds, setMeds] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [takenToday, setTakenToday] = useState(new Set());
  const [activeTab, setActiveTab] = useState("oggi"); // "oggi" | "settimana"

  const todayLabel = getTodayLabel();
  const userId = session?.user?.id;

  const getTodayISO = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

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

  const dayOfMonth = new Date().getDate();
  const isEvenDay = dayOfMonth % 2 === 0;

  const medsForToday = meds.filter((m) => {
    const days = m.days || [];
    const matchesEveryDay = days.includes("Tutti i giorni");
    const matchesWeekday = days.includes(todayLabel);
    const matchesEven = days.includes("Pari") && isEvenDay;
    const matchesOdd = days.includes("Dispari") && !isEvenDay;

    return matchesEveryDay || matchesWeekday || matchesEven || matchesOdd;
  });

  const weekDays = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  const weeklyMeds = useMemo(() => {
    const grouped = {};

    const today = new Date();
    const todayIndex = weekDays.indexOf(todayLabel);

    weekDays.forEach((dayName, index) => {
      const dateForDay = new Date(today);
      const diff = index - todayIndex;
      dateForDay.setDate(today.getDate() + diff);

      const dayOfMonthForDay = dateForDay.getDate();
      const isEvenForDay = dayOfMonthForDay % 2 === 0;

      grouped[dayName] = meds
        .filter((m) => {
          const days = m.days || [];

          const matchesEveryDay = days.includes("Tutti i giorni");
          const matchesWeekday = days.includes(dayName);
          const matchesEven = days.includes("Pari") && isEvenForDay;
          const matchesOdd = days.includes("Dispari") && !isEvenForDay;

          return (
            matchesEveryDay ||
            matchesWeekday ||
            matchesEven ||
            matchesOdd
          );
        })
        .slice()
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });

    return grouped;
  }, [meds, todayLabel]);


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

  useEffect(() => {
    if (!userId) return;

    const fetchIntakes = async () => {
      try {
        const todayISO = getTodayISO();
        const { data, error } = await supabase
          .from("med_intakes")
          .select("med_id")
          .eq("user_id", userId)
          .eq("date", todayISO);

        if (error) {
          console.error("Errore fetch intakes:", error);
          return;
        }

        const ids = new Set(data?.map((row) => row.med_id) || []);
        setTakenToday(ids);
      } catch (e) {
        console.error("Errore generico fetch intakes:", e);
      }
    };

    fetchIntakes();
  }, [userId]);

  const handleToggleTaken = async (medId) => {
    if (!userId) return;

    const todayISO = getTodayISO();
    const alreadyTaken = takenToday.has(medId);

    if (alreadyTaken) {
      const { error } = await supabase
        .from("med_intakes")
        .delete()
        .eq("user_id", userId)
        .eq("med_id", medId)
        .eq("date", todayISO);

      if (error) {
        console.error("Errore delete intake:", error);
        return;
      }

      setTakenToday((prev) => {
        const copy = new Set(prev);
        copy.delete(medId);
        return copy;
      });
    } else {
      const { error } = await supabase.from("med_intakes").insert({
        user_id: userId,
        med_id: medId,
        date: todayISO,
      });

      if (error && error.code !== "23505") {
        console.error("Errore insert intake:", error);
        return;
      }

      setTakenToday((prev) => {
        const copy = new Set(prev);
        copy.add(medId);
        return copy;
      });
    }
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

          <div className="pb-32 space-y-4">
            {/* Tabs Oggi / Settimana */}
            <div className="flex rounded-full bg-white/60 p-1 shadow-sm shadow-sky-100/60 backdrop-blur-md border border-white/70 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("oggi")}
                className={`flex-1 py-2 text-sm font-medium rounded-full transition ${
                  activeTab === "oggi"
                    ? "bg-emerald-500 text-white shadow"
                    : "text-slate-600 hover:bg-white/80"
                }`}
              >
                Oggi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settimana")}
                className={`flex-1 py-2 text-sm font-medium rounded-full transition ${
                  activeTab === "settimana"
                    ? "bg-emerald-500 text-white shadow"
                    : "text-slate-600 hover:bg-white/80"
                }`}
              >
                Settimana
              </button>
            </div>

            {/* Contenuto tab */}
            {loadingMeds ? (
              <p className="text-sm text-slate-500">Caricamento medicine...</p>
            ) : activeTab === "oggi" ? (
              <TodayMedsList
                medsForToday={medsForToday}
                todayLabel={todayLabel}
                onEditMed={openDialogForEdit}
                onDeleteMed={handleDeleteMed}
                takenToday={takenToday}
                onToggleTaken={handleToggleTaken}
              />
            ) : (
              <WeeklyMedsList
                weeklyMeds={weeklyMeds}
                weekDays={weekDays}
                onEditMed={openDialogForEdit}
                onDeleteMed={handleDeleteMed}
              />
            )}
          </div>
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
