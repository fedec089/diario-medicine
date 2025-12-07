"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function TodayMedsList({
  medsForToday,
  todayLabel,
  onEditMed,
  onDeleteMed,
  takenToday = new Set(),
  onToggleTaken,
}) {
  const [deleteId, setDeleteId] = useState(null);

  const handleConfirmDelete = () => {
    if (deleteId && onDeleteMed) {
      onDeleteMed(deleteId);
    }
    setDeleteId(null);
  };

  if (!medsForToday || medsForToday.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nessuna medicina programmata per oggi ({todayLabel}).
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {medsForToday.map((med) => {
          const isTaken = takenToday.has(med.id);

          return (
            <Card
              key={med.id}
              className="flex items-center flex-row justify-between p-3 bg-white/80 border border-white/70 shadow-sm shadow-sky-100/50"
            >
              <div className="flex items-center gap-3">
                {onToggleTaken && (
                  <button
                    type="button"
                    onClick={() => onToggleTaken(med.id)}
                    className="p-1 rounded-full hover:bg-emerald-50 transition"
                    aria-label={isTaken ? "Segna come non presa" : "Segna come presa"}
                  >
                    {isTaken ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </button>
                )}

                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {med.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {med.time} •{" "}
                    {med.days?.includes("Tutti i giorni")
                      ? "Tutti i giorni"
                      : med.days?.join(", ")}
                  </div>
                  {med.notes && (
                    <div className="text-xs text-slate-500 mt-1">
                      {med.notes}
                    </div>
                  )}
                  {isTaken && (
                    <div className="text-[10px] text-emerald-600 mt-1">
                      Segnata come presa oggi
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-500 hover:text-slate-800"
                  onClick={() => onEditMed && onEditMed(med)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-700"
                  onClick={() => setDeleteId(med.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa medicina?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa operazione non può essere annullata. La medicina verrà rimossa
              anche dai promemoria futuri.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
