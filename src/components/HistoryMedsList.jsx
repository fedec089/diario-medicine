import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateIt } from "@/lib/medsHistory";
import { CheckCircle2, CircleX } from "lucide-react";

export function HistoryMedsList({
  records = [],
  daysData = [],
  loading,
  pageIndex,
  totalPages,
  onPrev,
  onNext,
  statusFilter = "all",
}) {
  const filteredDays = daysData
    .map(({ date, scheduled = [], orphanedIntakes = [] }) => {
      const filteredScheduled = scheduled.filter(({ takenRecord }) => {
        if (statusFilter === "taken") return Boolean(takenRecord);
        if (statusFilter === "missed") return !takenRecord;
        return true;
      });
      const filteredOrphaned = statusFilter === "all" ? orphanedIntakes : [];
      return {
        date,
        scheduled: filteredScheduled,
        orphanedIntakes: filteredOrphaned,
      };
    })
    .filter((day) => day.scheduled.length > 0 || day.orphanedIntakes.length > 0);

  const hasData = filteredDays.length > 0;
  const showPagination = totalPages > 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-sm text-slate-700">Registrazioni trovate: {records.length}</div>
        {showPagination && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onPrev} disabled={pageIndex <= 0}>
              ← Nuovi
            </Button>
            <div className="text-xs text-slate-600">Pagina {pageIndex + 1} / {totalPages}</div>
            <Button variant="ghost" size="sm" onClick={onNext} disabled={pageIndex + 1 >= totalPages}>
              Vecchi →
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Caricamento...</div>
      ) : !hasData ? (
        <div className="text-sm text-slate-500">
          Nessuna medicina programmata o segnata per l&apos;intervallo selezionato.
        </div>
      ) : (
        filteredDays.map(({ date, scheduled = [], orphanedIntakes = [] }) => (
          <div key={date}>
            <h3 className="text-sm font-semibold mb-2">{formatDateIt(date)}</h3>
            <div className="space-y-2">
              {scheduled.map(({ med, takenRecord }) => {
                const takenAtText = takenRecord
                  ? new Date(takenRecord.taken_at).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;

                return (
                  <Card
                    key={`scheduled-${med.id}-${date}`}
                    className={`p-3 border ${
                      takenRecord
                        ? "bg-white/85 border-white/70 shadow-sm shadow-emerald-50"
                        : "bg-rose-50/80 border-rose-100"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-medium text-slate-900">{med.name}</div>
                        <div className="text-xs text-slate-600">
                          Orario programmato: {med.time ?? "—"}
                        </div>
                        {med.notes && (
                          <div className="text-xs text-slate-500 mt-1">{med.notes}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end text-xs text-slate-600">
                        {takenRecord ? (
                          <>
                            <div className="flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Presa
                            </div>
                            <div className="text-[11px] mt-0.5">alle {takenAtText}</div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600 font-medium">
                            <CircleX className="h-4 w-4" />
                            Non presa
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {orphanedIntakes.map((r) => (
                <Card key={r.id} className="p-3 border bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-900">
                        {r.meds?.name ?? "Medicinale eliminato"}
                      </div>
                      <div className="text-xs text-slate-600">
                        Orario programmato: {r.meds?.time ?? "—"}
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <div>
                        {new Date(r.taken_at).toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[11px]">
                        {new Date(r.taken_at).toLocaleDateString("it-IT")}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryMedsList;
