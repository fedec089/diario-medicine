"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

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

export function TodayMedsList({
  medsForToday,
  todayLabel,
  onEditMed,
  onDeleteMed,
}) {
  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = (id) => setDeleteId(id);
  const closeDialog = () => setDeleteId(null);

  const executeDelete = () => {
    if (deleteId) {
      onDeleteMed(deleteId);
    }
    closeDialog();
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-2xl border border-white/70 shadow-lg shadow-sky-100/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-900">
            <span>Medicine di oggi</span>
            <span className="text-xs text-slate-500">{todayLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {medsForToday.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nessuna medicina programmata per oggi.
            </p>
          ) : (
            medsForToday
              .slice()
              .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
              .map((med) => (
                <div
                  key={med.id}
                  className="flex items-start justify-between rounded-xl border border-white/70 bg-white/70 backdrop-blur-md px-3 py-2 shadow-sm shadow-slate-200/70"
                >
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-medium text-slate-900">{med.name}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {med.time || "Orario non specificato"}
                    </p>
                    {med.notes && (
                      <p className="text-xs text-slate-500 mt-1">{med.notes}</p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {med.days?.includes("Tutti i giorni")
                        ? "Tutti i giorni"
                        : med.days?.join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditMed(med)}
                      className="p-1 rounded-full border border-slate-200 bg-white/80 hover:bg-slate-50 shadow-sm"
                      aria-label="Modifica medicina"
                    >
                      <Pencil className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(med.id)}
                      className="p-1 rounded-full border border-red-100 bg-white/80 hover:bg-red-50 shadow-sm"
                      aria-label="Elimina medicina"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* ALERT DIALOG */}
      <AlertDialog open={!!deleteId}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-xl border border-white/70">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">
              Eliminare questa medicina?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Questa azione non può essere annullata. La medicina verrà rimossa
              dalla tua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeDialog}
              className="border-slate-200 bg-white/70 hover:bg-white text-slate-800"
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-500 hover:bg-red-600 text-white shadow-red-200"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
