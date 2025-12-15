"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSupabaseSession } from "@/lib/useSupabaseSession";
import { supabase } from "@/lib/supabaseClient";
import { fetchMedIntakes, isoAddDays } from "@/lib/medsHistory";
import HistoryMedsList from "@/components/HistoryMedsList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateDiffDays(fromISO, toISO) {
  if (!fromISO || !toISO) return 0;
  const start = new Date(`${fromISO}T00:00:00Z`).getTime();
  const end = new Date(`${toISO}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

const WEEK_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

function getWeekdayLabelFromISO(iso) {
  if (!iso) return "";
  const dt = new Date(`${iso}T00:00:00`);
  return WEEK_LABELS[dt.getDay()] ?? "";
}

function isMedScheduledOnDate(med, iso) {
  if (!med) return false;
  const days = med.days || [];
  if (days.includes("Tutti i giorni")) return true;
  const weekdayLabel = getWeekdayLabelFromISO(iso);
  if (weekdayLabel && days.includes(weekdayLabel)) return true;
  const dayOfMonth = new Date(`${iso}T00:00:00`).getDate();
  if (days.includes("Pari") && dayOfMonth % 2 === 0) return true;
  if (days.includes("Dispari") && dayOfMonth % 2 !== 0) return true;
  return false;
}

export default function HistoryPage() {
  const { session, sessionLoading } = useSupabaseSession();
  const userId = session?.user?.id;
  const today = todayISO();

  const initialRange = useMemo(() => {
    const toIso = todayISO();
    return { from: isoAddDays(toIso, -(7 - 1)), to: toIso };
  }, []);

  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [currentWindow, setCurrentWindow] = useState(initialRange);
  const [pageIndex, setPageIndex] = useState(0);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meds, setMeds] = useState([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const rangeDays = useMemo(() => Math.max(1, dateDiffDays(fromDate, toDate) + 1), [fromDate, toDate]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(rangeDays / 30)), [rangeDays]);

  useEffect(() => {
    setPageIndex(0);
  }, [fromDate, toDate]);

  async function loadPage() {
    if (!userId) return;
    const selectedTo = toDate;
    const selectedFrom = fromDate;
    if (!selectedTo || !selectedFrom) return;

    // compute the window for this page (30-day windows, newest first)
    const windowSize = 30;
    const pageOffsetDays = pageIndex * windowSize;
    if (pageOffsetDays >= rangeDays) {
      setCurrentWindow({ from: null, to: null });
      setRecords([]);
      return;
    }
    const windowTo = isoAddDays(selectedTo, -pageOffsetDays);
    const remaining = rangeDays - pageOffsetDays;
    const thisWindowSize = Math.min(windowSize, remaining);
    const windowFrom = isoAddDays(windowTo, -(thisWindowSize - 1));
    setCurrentWindow({ from: windowFrom, to: windowTo });

    setLoading(true);
    const { data, error } = await fetchMedIntakes(supabase, userId, windowFrom, windowTo);
    if (error) {
      setRecords([]);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!userId) return;
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pageIndex, rangeDays, toDate, fromDate]);

  useEffect(() => {
    if (!userId) {
      setMeds([]);
      return;
    }

    const loadMeds = async () => {
      try {
        setMedsLoading(true);
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
        setMedsLoading(false);
      }
    };

    loadMeds();
  }, [userId]);

  const onPreset = (days) => {
    const toIso = todayISO();
    const fromIso = isoAddDays(toIso, -(days - 1));
    setToDate(toIso);
    setFromDate(fromIso);
    setPageIndex(0);
  };

  const onPrev = () => {
    setPageIndex((p) => Math.max(0, p - 1));
  };

  const onNext = () => {
    setPageIndex((p) => Math.min(totalPages - 1, p + 1));
  };

  const handleFromChange = (value) => {
    if (!value) return;
    setFromDate(value);
    if (value > toDate) {
      setToDate(value);
    }
  };

  const handleToChange = (value) => {
    if (!value) return;
    setToDate(value);
    if (value < fromDate) {
      setFromDate(value);
    }
  };

  const openPicker = (ref) => {
    if (ref?.current) {
      if (ref.current.showPicker) {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    }
  };

  const windowDates = useMemo(() => {
    if (!currentWindow.from || !currentWindow.to) return [];
    const diff = dateDiffDays(currentWindow.from, currentWindow.to);
    const result = [];
    for (let offset = 0; offset <= diff; offset += 1) {
      result.push(isoAddDays(currentWindow.to, -offset));
    }
    return result.filter((iso) => iso !== today);
  }, [currentWindow, today]);

  const daysData = useMemo(() => {
    if (!windowDates.length) return [];

    const recordsByDate = new Map();
    records.forEach((rec) => {
      const list = recordsByDate.get(rec.date) || [];
      list.push(rec);
      recordsByDate.set(rec.date, list);
    });

    return windowDates
      .map((date) => {
        const dateRecords = (recordsByDate.get(date) || []).slice();
        const recordsByMed = dateRecords.reduce((acc, rec) => {
          if (!acc[rec.med_id]) {
            acc[rec.med_id] = [];
          }
          acc[rec.med_id].push(rec);
          return acc;
        }, {});
        const used = new Set();

        const scheduled = meds
          .filter((med) => isMedScheduledOnDate(med, date))
          .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
          .map((med) => {
            const entries = recordsByMed[med.id] || [];
            const takenRecord = entries.length > 0 ? entries.shift() : null;
            if (takenRecord) {
              used.add(takenRecord.id);
            }
            return { med, takenRecord };
          });

        const orphanedIntakes = dateRecords.filter((rec) => !used.has(rec.id));

        return {
          date,
          scheduled,
          orphanedIntakes,
        };
      })
      .filter((day) => day.scheduled.length > 0 || day.orphanedIntakes.length > 0);
  }, [windowDates, meds, records]);

  const summary = useMemo(() => {
    let total = 0;
    let taken = 0;
    daysData.forEach((day) => {
      day.scheduled.forEach(({ takenRecord }) => {
        total += 1;
        if (takenRecord) taken += 1;
      });
    });
    return {
      total,
      taken,
      missed: Math.max(0, total - taken),
    };
  }, [daysData]);

  const displayRecords = useMemo(
    () => records.filter((rec) => rec.date !== today),
    [records, today],
  );

  const content = !session ? (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
      <p>Per visualizzare lo storico devi effettuare il login.</p>
      <Link href="/auth" className="px-4 py-2 rounded-md bg-emerald-500 text-white">Vai al login</Link>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-semibold mb-4">Storico medicine</h2>

      <div className="space-y-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="flex flex-col gap-1 text-xs text-slate-600"
            onClick={(e) => {
              if (e.target.tagName !== "INPUT") openPicker(fromInputRef);
            }}
          >
            <span className="font-semibold uppercase tracking-wide">Dal</span>
            <Input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => handleFromChange(e.target.value)}
              className="cursor-pointer bg-white text-slate-900"
              ref={fromInputRef}
            />
          </div>
          <div
            className="flex flex-col gap-1 text-xs text-slate-600"
            onClick={(e) => {
              if (e.target.tagName !== "INPUT") openPicker(toInputRef);
            }}
          >
            <span className="font-semibold uppercase tracking-wide">Al</span>
            <Input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => handleToChange(e.target.value)}
              className="cursor-pointer bg-white text-slate-900"
              ref={toInputRef}
            />
          </div>
        </div>

        <div className="flex gap-2 text-xs flex-wrap">
          <Button variant={rangeDays===7?"secondary":"ghost"} size="sm" onClick={() => onPreset(7)}>7 giorni</Button>
          <Button variant={rangeDays===30?"secondary":"ghost"} size="sm" onClick={() => onPreset(30)}>30 giorni</Button>
          <Button variant={rangeDays===90?"secondary":"ghost"} size="sm" onClick={() => onPreset(90)}>90 giorni</Button>
          <Button variant={rangeDays===180?"secondary":"ghost"} size="sm" onClick={() => onPreset(180)}>180 giorni</Button>
        </div>

        <div className="text-xs text-slate-600">
          Intervallo totale: {rangeDays} {rangeDays === 1 ? "giorno" : "giorni"}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-4 mb-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">Recap intervallo</div>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-3xl font-semibold text-emerald-600">{summary.taken}</div>
            <div className="text-sm text-slate-500">Medicinali presi</div>
          </div>
          <div className="w-px h-12 bg-slate-100" />
          <div>
            <div className="text-3xl font-semibold text-rose-500">{summary.missed}</div>
            <div className="text-sm text-slate-500">Medicinali non presi</div>
          </div>
          <div className="w-px h-12 bg-slate-100" />
          <div>
            <div className="text-lg font-semibold text-slate-900">{summary.total}</div>
            <div className="text-sm text-slate-500">Totale pianificati</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div
          className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm"
          role="group"
          aria-label="Filtra medicinali presi o non presi"
        >
          {[
            { value: "all", label: "Tutti" },
            { value: "taken", label: "Prese" },
            { value: "missed", label: "Non prese" },
          ].map((option, index, array) => {
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1 text-xs font-medium transition ${
                  isActive ? "bg-emerald-500 text-white" : "text-slate-600"
                } ${index === 0 ? "rounded-l-full" : ""} ${
                  index === array.length - 1 ? "rounded-r-full" : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <HistoryMedsList
        records={displayRecords}
        daysData={daysData}
        loading={loading || medsLoading}
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPrev={onPrev}
        onNext={onNext}
        statusFilter={statusFilter}
      />
    </>
  );

  if (sessionLoading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="p-4">Verifica sessione...</div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-sky-100 via-slate-50 to-emerald-100 text-slate-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {content}
      </main>
      <BottomNav />
    </div>
  );
}
