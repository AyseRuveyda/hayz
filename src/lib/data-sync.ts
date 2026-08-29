import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  getGuestCycles,
  getGuestProfile,
  getGuestQada,
  getGuestSpotting,
  saveGuestCycles,
  saveGuestProfile,
  saveGuestQada,
  saveGuestSpotting,
  upsertGuestCycle,
  upsertGuestQada,
  upsertGuestSpotting,
  uid,
} from "@/lib/local-store";
import type {
  CycleRecord,
  DailySpottingLog,
  QadaItem,
  UserProfile,
} from "@/types/cycle";

export async function getCurrentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadCycles(): Promise<CycleRecord[]> {
  const userId = await getCurrentUserId();
  if (!userId || !isSupabaseConfigured) return getGuestCycles();

  const sb = getSupabase()!;
  const { data, error } = await sb
    .from("cycle_records")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error || !data) return getGuestCycles();

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    startDate: row.start_date,
    endDate: row.end_date,
    madhhab: row.madhhab,
    status: row.status,
    hayzDays: Number(row.hayz_days),
    istihadhaDays: Number(row.istihadha_days),
    purityDays: row.purity_days != null ? Number(row.purity_days) : undefined,
    requiresGhusl: row.requires_ghusl,
    qadaPrayersCount: row.qada_prayers_count,
    nextEarliestHayzDate: row.next_earliest_hayz_date ?? undefined,
    summaryTR: row.summary_tr ?? undefined,
    summaryEN: row.summary_en ?? undefined,
    isContinuousBleeding: row.is_continuous_bleeding ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveCycle(record: CycleRecord): Promise<CycleRecord> {
  const userId = await getCurrentUserId();
  const payload: CycleRecord = {
    ...record,
    id: record.id || uid(),
    updatedAt: new Date().toISOString(),
  };

  if (!userId || !isSupabaseConfigured) {
    upsertGuestCycle(payload);
    return payload;
  }

  const sb = getSupabase()!;
  await sb.from("cycle_records").upsert({
    id: payload.id,
    user_id: userId,
    start_date: payload.startDate,
    end_date: payload.endDate,
    madhhab: payload.madhhab,
    status: payload.status,
    hayz_days: payload.hayzDays,
    istihadha_days: payload.istihadhaDays,
    purity_days: payload.purityDays ?? null,
    requires_ghusl: payload.requiresGhusl,
    qada_prayers_count: payload.qadaPrayersCount,
    next_earliest_hayz_date: payload.nextEarliestHayzDate ?? null,
    summary_tr: payload.summaryTR ?? null,
    summary_en: payload.summaryEN ?? null,
    is_continuous_bleeding: payload.isContinuousBleeding ?? false,
    updated_at: payload.updatedAt,
  });

  return { ...payload, userId };
}

export async function loadSpotting(): Promise<DailySpottingLog[]> {
  const userId = await getCurrentUserId();
  if (!userId || !isSupabaseConfigured) return getGuestSpotting();

  const sb = getSupabase()!;
  const { data, error } = await sb
    .from("daily_spotting_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error || !data) return getGuestSpotting();

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    dischargeType: row.discharge_type,
    kursufState: row.kursuf_state,
    symptoms: row.symptoms ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveSpotting(
  log: DailySpottingLog
): Promise<DailySpottingLog> {
  const userId = await getCurrentUserId();
  const payload: DailySpottingLog = {
    ...log,
    id: log.id || uid(),
    updatedAt: new Date().toISOString(),
  };

  if (!userId || !isSupabaseConfigured) {
    upsertGuestSpotting(payload);
    return payload;
  }

  const sb = getSupabase()!;
  await sb.from("daily_spotting_logs").upsert(
    {
      id: payload.id,
      user_id: userId,
      date: payload.date,
      discharge_type: payload.dischargeType,
      kursuf_state: payload.kursufState,
      symptoms: payload.symptoms,
      notes: payload.notes ?? null,
      updated_at: payload.updatedAt,
    },
    { onConflict: "user_id,date" }
  );

  return { ...payload, userId };
}

export async function loadQada(): Promise<QadaItem[]> {
  const userId = await getCurrentUserId();
  if (!userId || !isSupabaseConfigured) return getGuestQada();

  const sb = getSupabase()!;
  const { data, error } = await sb
    .from("qada_tracker")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return getGuestQada();

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    kind: row.kind as QadaItem["kind"],
    remaining: row.remaining,
    total: row.total,
    source: row.source,
    relatedCycleId: row.related_cycle_id ?? undefined,
    relatedDate: row.related_date ?? undefined,
    noteTR: row.note_tr ?? undefined,
    noteEN: row.note_en ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveQada(item: QadaItem): Promise<QadaItem> {
  const userId = await getCurrentUserId();
  const payload: QadaItem = {
    ...item,
    id: item.id || uid(),
    updatedAt: new Date().toISOString(),
  };

  if (!userId || !isSupabaseConfigured) {
    upsertGuestQada(payload);
    return payload;
  }

  const sb = getSupabase()!;
  await sb.from("qada_tracker").upsert({
    id: payload.id,
    user_id: userId,
    kind: payload.kind,
    remaining: payload.remaining,
    total: payload.total,
    source: payload.source,
    related_cycle_id: payload.relatedCycleId ?? null,
    related_date: payload.relatedDate ?? null,
    note_tr: payload.noteTR ?? null,
    note_en: payload.noteEN ?? null,
    updated_at: payload.updatedAt,
  });

  return { ...payload, userId };
}

/** Misafir verilerini oturum açılınca Supabase'e iter. */
export async function syncGuestDataToCloud(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId || !isSupabaseConfigured) return;

  const profile = getGuestProfile();
  const sb = getSupabase()!;
  await sb.from("profiles").upsert({
    id: userId,
    display_name: profile.displayName,
    madhhab: profile.madhhab,
    habit_hayz_days: profile.habitHayzDays,
    habit_purity_days: profile.habitPurityDays,
    maliki_max_days: profile.malikiMaxDays ?? 15,
    locale: profile.locale,
    notifications_enabled: profile.notificationsEnabled,
    updated_at: new Date().toISOString(),
  });

  for (const c of getGuestCycles()) {
    await saveCycle({ ...c, userId });
  }
  for (const s of getGuestSpotting()) {
    await saveSpotting({ ...s, userId });
  }
  for (const q of getGuestQada()) {
    await saveQada({ ...q, userId });
  }
}

export async function loadOrCreateProfile(): Promise<UserProfile> {
  const userId = await getCurrentUserId();
  if (!userId || !isSupabaseConfigured) return getGuestProfile();

  const sb = getSupabase()!;
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return getGuestProfile();

  const profile: UserProfile = {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    madhhab: data.madhhab,
    habitHayzDays: data.habit_hayz_days,
    habitPurityDays: data.habit_purity_days,
    malikiMaxDays: data.maliki_max_days ?? 15,
    locale: (data.locale as "tr" | "en") || "tr",
    notificationsEnabled: data.notifications_enabled,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
  saveGuestProfile(profile);
  return profile;
}

export { saveGuestProfile, getGuestProfile };
