"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function WeeklyMedsList({ weeklyMeds, weekDays, onEditMed, onDeleteMed }) {
  return (
    <div className="space-y-4">
      {weekDays.map((day) => {
        const medsForDay = weeklyMeds[day] || [];

        return (
          <div key={day} className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {day}
            </div>

            {medsForDay.length === 0 ? (
              <p className="text-xs text-slate-400">
                Nessuna medicina programmata.
              </p>
            ) : (
              <div className="space-y-2">
                {medsForDay.map((med) => (
                  <Card
                    key={med.id}
                    className="flex flex-row items-center justify-between p-3 bg-white/80 border border-white/70 shadow-sm shadow-sky-100/50"
                  >
                    <div>
                      <div className="text-l font-medium text-slate-900">
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
                        onClick={() => onDeleteMed && onDeleteMed(med.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
