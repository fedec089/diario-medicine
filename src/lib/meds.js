// lib/meds.js

export const STORAGE_KEY = "diario-medicine-meds";

export const WEEKDAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export const DEFAULT_MEDS = [
  {
    id: 1,
    name: "Ibuprofene 400mg",
    time: "08:00",
    days: ["Lunedì", "Mercoledì", "Venerdì"],
    notes: "Dopo colazione",
  },
  {
    id: 2,
    name: "Vitamina D",
    time: "12:30",
    days: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"],
    notes: "Con il pranzo",
  },
  {
    id: 3,
    name: "Magnesio",
    time: "22:00",
    days: ["Tutti i giorni"],
    notes: "Prima di dormire",
  },
];

export function getTodayLabel() {
  const todayIndex = new Date().getDay(); // 0 Domenica, 1 Lunedì...
  const map = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  return map[todayIndex];
}
