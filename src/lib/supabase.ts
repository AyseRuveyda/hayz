import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Supabase istemcisi — env yoksa null (misafir / localStorage modu). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export type DbProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  madhhab: string;
  habit_hayz_days: number;
  habit_purity_days: number;
  maliki_max_days: number | null;
  locale: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type DbCycleRecord = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  madhhab: string;
  status: string;
  hayz_days: number;
  istihadha_days: number;
  purity_days: number | null;
  requires_ghusl: boolean;
  qada_prayers_count: number;
  next_earliest_hayz_date: string | null;
  summary_tr: string | null;
  summary_en: string | null;
  is_continuous_bleeding: boolean | null;
  created_at: string;
  updated_at: string;
};

export type DbSpottingLog = {
  id: string;
  user_id: string;
  date: string;
  discharge_type: string;
  kursuf_state: string;
  symptoms: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbQadaItem = {
  id: string;
  user_id: string;
  kind: string;
  remaining: number;
  total: number;
  source: string;
  related_cycle_id: string | null;
  related_date: string | null;
  note_tr: string | null;
  note_en: string | null;
  created_at: string;
  updated_at: string;
};
