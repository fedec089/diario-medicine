import { supabase } from "./supabaseClient";

function toISO(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const parts = ddmmyyyy.replace(/\//g, "-").split("-");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (y.length === 2) return null;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatDateIt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("it-IT");
  } catch (e) {
    return iso;
  }
}

function isoAddDays(iso, days) {
  const parts = iso.split("-");
  const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function fetchMedIntakes(clientSupabase, userId, fromISO, toISO) {
  if (!userId) return { data: [], error: null };

  try {
    const { data, error } = await clientSupabase
      .from("med_intakes")
      .select("id, med_id, date, taken_at, meds(id, name, time, notes)")
      .eq("user_id", userId)
      .gte("date", fromISO)
      .lte("date", toISO)
      .order("date", { ascending: false })
      .order("taken_at", { ascending: false });

    if (error) {
      console.error("fetchMedIntakes error:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (e) {
    console.error("fetchMedIntakes exception:", e);
    return { data: [], error: e };
  }
}

export { toISO, formatDateIt, isoAddDays, fetchMedIntakes };
