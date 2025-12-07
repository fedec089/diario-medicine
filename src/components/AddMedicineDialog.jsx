"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { WEEKDAYS } from "@/lib/meds";

export function AddMedicineDialog({ open, onOpenChange, onSaveMed, initialMed }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);

  const isEditMode = !!initialMed;

  useEffect(() => {
    if (open && initialMed) {
      setName(initialMed.name || "");
      setTime(initialMed.time || "");
      setNotes(initialMed.notes || "");
      setSelectedDays(initialMed.days || []);
    } else if (open && !initialMed) {
      // se è apertura in "add", pulisco
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMed]);

  const resetForm = () => {
    setName("");
    setTime("");
    setNotes("");
    setSelectedDays([]);
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleEveryday = () => {
    if (selectedDays.includes("Tutti i giorni")) {
      setSelectedDays([]);
    } else {
      setSelectedDays(["Tutti i giorni"]);
    }
  };

  const isEveryday = selectedDays.includes("Tutti i giorni");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !time || selectedDays.length === 0) {
      return;
    }

    const med = {
      id: initialMed?.id ?? Date.now(),
      name: name.trim(),
      time,
      days: selectedDays,
      notes: notes.trim(),
    };

    onSaveMed(med);
    resetForm();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : handleClose())}>
      <DialogContent className="bg-white/85 backdrop-blur-2xl border border-white/70 shadow-xl shadow-emerald-100/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {isEditMode ? "Modifica medicina" : "Aggiungi medicina"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">Nome farmaco</label>
            <Input
              placeholder="Es. Ibuprofene 400mg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/80 border-slate-200 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">Orario</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/80 border-slate-200 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Giorni della settimana
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = selectedDays.includes(day) && !isEveryday;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`text-xs px-3 py-1 rounded-full border transition shadow-sm ${
                      active
                        ? "bg-emerald-500/90 text-white border-emerald-500 shadow-emerald-200/70"
                        : "bg-white/70 border-slate-200 text-slate-800 hover:bg-slate-50"
                    }`}
                    disabled={isEveryday}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={toggleEveryday}
                className={`text-xs px-3 py-1 rounded-full border transition shadow-sm ${
                  isEveryday
                    ? "bg-emerald-500/90 text-white border-emerald-500 shadow-emerald-200/70"
                    : "bg-white/70 border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                Tutti i giorni
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">Note</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Es. Dopo i pasti, con un bicchiere d'acqua..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-800 bg-white/70 hover:bg-slate-50"
              onClick={handleClose}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
            >
              {isEditMode ? "Aggiorna" : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
