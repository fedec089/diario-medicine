"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const WEEK_DAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export function AddMedicineDialog({ open, onOpenChange, onSaveMed, initialMed }) {
  const [name, setName] = useState(initialMed?.name || "");
  const [time, setTime] = useState(initialMed?.time || "");
  const [days, setDays] = useState(initialMed?.days || []); // 👈 QUI definiamo days
  const [notes, setNotes] = useState(initialMed?.notes || "");

  // Quando entro in "modifica", sincronizzo i campi con initialMed
  useEffect(() => {
    if (initialMed) {
      setName(initialMed.name || "");
      setTime(initialMed.time || "");
      setDays(initialMed.days || []);
      setNotes(initialMed.notes || "");
    } else {
      setName("");
      setTime("");
      setDays([]);
      setNotes("");
    }
  }, [initialMed, open]);

  const handleClose = (openValue) => {
    if (!openValue) {
      // opzionale: se vuoi resettare sempre quando chiudi
      // setName("");
      // setTime("");
      // setDays([]);
      // setNotes("");
    }
    onOpenChange(openValue);
  };

  const toggleDay = (day) => {
    setDays((prev) => {
      let newDays = [...prev];

      // Gestione mutua esclusione Pari / Dispari
      if (day === "Pari") {
        newDays = newDays.filter((d) => d !== "Dispari");
      } else if (day === "Dispari") {
        newDays = newDays.filter((d) => d !== "Pari");
      }

      if (newDays.includes(day)) {
        return newDays.filter((d) => d !== day);
      } else {
        return [...newDays, day];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !time) return;

    await onSaveMed({
      id: initialMed?.id,
      name: name.trim(),
      time,
      days,
      notes: notes.trim(),
    });

    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl border border-white/70 shadow-lg shadow-sky-100/60">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {initialMed ? "Modifica medicina" : "Aggiungi medicina"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Imposta nome, orario, frequenza e note opzionali.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Nome medicina
            </label>
            <Input
              className="text-[16px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Tachipirina 1000"
            />
          </div>

          {/* Orario */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Orario
            </label>
            <Input
              className="text-[16px]"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Giorni */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Frequenza
            </label>

            <br/>

            {/* Tutti i giorni */}
            <button
              type="button"
              onClick={() => toggleDay("Tutti i giorni")}
              className={`px-3 py-1 rounded-full text-xs border transition mt-3 ${
                days.includes("Tutti i giorni")
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white/60 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              Tutti i giorni
            </button>

            {/* Giorni della settimana */}
            <div className="flex flex-wrap gap-1 mt-2">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-2 py-1 rounded-full text-xs border transition ${
                    days.includes(day)
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white/60 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Giorni pari / dispari */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => toggleDay("Pari")}
                className={
                  days.includes("Pari")
                    ? "bg-emerald-500 text-white px-2 py-1 rounded-full text-xs border border-emerald-500"
                    : "bg-white/60 text-slate-600 px-2 py-1 rounded-full text-xs border border-slate-200 hover:bg-white"
                }
              >
                Giorni pari
              </button>

              <button
                type="button"
                onClick={() => toggleDay("Dispari")}
                className={
                  days.includes("Dispari")
                    ? "bg-emerald-500 text-white px-2 py-1 rounded-full text-xs border border-emerald-500"
                    : "bg-white/60 text-slate-600 px-2 py-1 rounded-full text-xs border border-slate-200 hover:bg-white"
                }
              >
                Giorni dispari
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-1">
              Puoi combinare giorni della settimana con "Tutti i giorni" oppure
              usare solo "Giorni pari" o "Giorni dispari".
            </p>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Note (opzionale)
            </label>
            <Textarea
              className="min-h-[70px] text-[16px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Dopo i pasti, non a stomaco vuoto..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-xs"
              onClick={() => handleClose(false)}
            >
              Annulla
            </Button>
            <Button type="submit" className="text-xs">
              {initialMed ? "Salva modifiche" : "Aggiungi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
