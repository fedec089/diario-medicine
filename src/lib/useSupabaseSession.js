"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSupabaseSession() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Errore getSession:", error);
      }
      setSession(data?.session ?? null);
      setSessionLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, sessionLoading };
}
