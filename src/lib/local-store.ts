import type {
  CyclePrediction,
  CycleRecord,
  DailySpottingLog,
  QadaItem,
  UserProfile,
} from "@/types/cycle";

const KEYS = {
  profile: "hayzapp.guest.profile",
  cycles: "hayzapp.guest.cycles",
  spotting: "hayzapp.guest.spotting",
  qada: "hayzapp.guest.qada",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getGuestProfile(): UserProfile {
  const now = new Date().toISOString();
  return (
    readJson<UserProfile | null>(KEYS.profile, null) ?? {
      id: "guest",
      email: null,
      displayName: "Misafir",
      madhhab: "HANAFI",
      habitHayzDays: 7,
      habitPurityDays: 15,
      malikiMaxDays: 15,
      locale: "tr",
      notificationsEnabled: true,
      createdAt: now,
      updatedAt: now,
    }
  );
}

export function saveGuestProfile(profile: UserProfile) {
  writeJson(KEYS.profile, { ...profile, updatedAt: new Date().toISOString() });
}

export function getGuestCycles(): CycleRecord[] {
  return readJson<CycleRecord[]>(KEYS.cycles, []);
}

export function saveGuestCycles(cycles: CycleRecord[]) {
  writeJson(KEYS.cycles, cycles);
}

export function upsertGuestCycle(record: CycleRecord) {
  const cycles = getGuestCycles();
  const idx = cycles.findIndex((c) => c.id === record.id);
  if (idx >= 0) cycles[idx] = record;
  else cycles.unshift(record);
  saveGuestCycles(cycles);
  return cycles;
}

export function getGuestSpotting(): DailySpottingLog[] {
  return readJson<DailySpottingLog[]>(KEYS.spotting, []);
}

export function saveGuestSpotting(logs: DailySpottingLog[]) {
  writeJson(KEYS.spotting, logs);
}

export function upsertGuestSpotting(log: DailySpottingLog) {
  const logs = getGuestSpotting().filter((l) => l.date !== log.date);
  logs.push(log);
  logs.sort((a, b) => b.date.localeCompare(a.date));
  saveGuestSpotting(logs);
  return logs;
}

export function getGuestQada(): QadaItem[] {
  return readJson<QadaItem[]>(KEYS.qada, []);
}

export function saveGuestQada(items: QadaItem[]) {
  writeJson(KEYS.qada, items);
}

export function upsertGuestQada(item: QadaItem) {
  const items = getGuestQada();
  const idx = items.findIndex((q) => q.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  saveGuestQada(items);
  return items;
}

/** Son döngülerden tahmin üretir. */
export function buildPrediction(
  cycles: CycleRecord[],
  habitHayzDays: number,
  habitPurityDays: number,
  locale: "tr" | "en" = "tr"
): CyclePrediction {
  const sorted = [...cycles].sort((a, b) =>
    b.endDate.localeCompare(a.endDate)
  );
  const sample = sorted.slice(0, 6);
  const avgHayz =
    sample.length > 0
      ? sample.reduce((s, c) => s + c.hayzDays, 0) / sample.length
      : habitHayzDays;
  const avgPurity =
    sample.length > 0
      ? sample.reduce(
          (s, c) => s + (c.purityDays ?? habitPurityDays),
          0
        ) / sample.length
      : habitPurityDays;

  const lastEnd = sorted[0]
    ? new Date(sorted[0].endDate)
    : new Date();
  const minTuhrMs = Math.max(15, Math.round(avgPurity)) * 24 * 60 * 60 * 1000;
  const nextHayz = new Date(lastEnd.getTime() + minTuhrMs);
  const now = new Date();
  const daysUntilNextHayz = Math.max(
    0,
    Math.ceil((nextHayz.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );
  const daysSinceEnd = Math.floor(
    (now.getTime() - lastEnd.getTime()) / (24 * 60 * 60 * 1000)
  );
  const daysUntilMinTuhrComplete = Math.max(0, 15 - daysSinceEnd);

  return {
    estimatedNextHayzDate: nextHayz.toISOString(),
    daysUntilNextHayz,
    daysUntilMinTuhrComplete,
    averageHayzDays: Number(avgHayz.toFixed(2)),
    averagePurityDays: Number(avgPurity.toFixed(2)),
    messageTR:
      daysUntilMinTuhrComplete > 0
        ? `15 günlük asgari temizlik barajının dolmasına ${daysUntilMinTuhrComplete} gün kaldı. Tahmini yeni hayız: ${daysUntilNextHayz} gün sonra.`
        : `Asgari temizlik barajı doldu. Tahmini yeni hayız başlangıcı: ${daysUntilNextHayz} gün sonra.`,
    messageEN:
      daysUntilMinTuhrComplete > 0
        ? `${daysUntilMinTuhrComplete} day(s) left until the 15-day minimum purity. Estimated next hayd in ${daysUntilNextHayz} day(s).`
        : `Minimum purity barrier reached. Estimated next hayd in ${daysUntilNextHayz} day(s).`,
  };
}

export type { CyclePrediction };
