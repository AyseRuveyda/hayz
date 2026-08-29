import type {
  CalendarDayCell,
  CycleRecord,
  DailySpottingLog,
  FiqhDayKind,
} from "@/types/cycle";
import { FIQH_COLORS } from "@/types/cycle";

function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function eachDay(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    days.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/**
 * Döngü kayıtlarından gün bazlı fıkhi renk haritası üretir.
 * Hayız → kırmızı, istihâze → sarı, aradaki temiz günler → yeşil,
 * 15 günden az aralık → fâsid temizlik (çizgili gri).
 */
export function buildCalendarMap(
  cycles: CycleRecord[],
  spotting: DailySpottingLog[],
  rangeStart: Date,
  rangeEnd: Date
): Map<string, CalendarDayCell> {
  const map = new Map<string, CalendarDayCell>();
  const allDays = eachDay(rangeStart, rangeEnd);

  for (const day of allDays) {
    map.set(day, {
      date: day,
      kind: "EMPTY",
      hasSpotting: false,
    });
  }

  const sorted = [...cycles].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    const hayzEnd = new Date(start);
    hayzEnd.setTime(
      start.getTime() + Math.max(0, c.hayzDays) * 24 * 60 * 60 * 1000
    );

    for (const day of eachDay(start, end)) {
      const cell = map.get(day);
      if (!cell) continue;
      const dayDate = new Date(day + "T12:00:00");
      let kind: FiqhDayKind = "HAYZ";
      if (c.istihadhaDays > 0 && dayDate >= hayzEnd) {
        kind = "ISTIHADHA";
      } else if (c.status === "INVALID_SHORT" || c.status === "ISTIHADHA") {
        kind = "ISTIHADHA";
      } else if (c.hayzDays <= 0) {
        kind = "ISTIHADHA";
      }
      cell.kind = kind;
      cell.labelTR =
        kind === "HAYZ" ? "Hayız" : kind === "ISTIHADHA" ? "İstihâze" : cell.labelTR;
      cell.labelEN =
        kind === "HAYZ" ? "Hayd" : kind === "ISTIHADHA" ? "Istihadha" : cell.labelEN;
    }

    const next = sorted[i + 1];
    const purityStart = new Date(end);
    purityStart.setDate(purityStart.getDate() + 1);
    const purityEnd = next
      ? new Date(new Date(next.startDate).getTime() - 24 * 60 * 60 * 1000)
      : new Date(end.getTime() + 20 * 24 * 60 * 60 * 1000);

    if (purityEnd >= purityStart) {
      const purityDays = eachDay(purityStart, purityEnd);
      const isFasid = purityDays.length < 15;
      for (const day of purityDays) {
        const cell = map.get(day);
        if (!cell || cell.kind === "HAYZ" || cell.kind === "ISTIHADHA") continue;
        cell.kind = isFasid ? "FASID_TUHR" : "TUHR";
        cell.labelTR = isFasid ? "Fâsid temizlik" : "Sahih temizlik";
        cell.labelEN = isFasid ? "Invalid purity" : "Valid purity";
      }
    }
  }

  for (const s of spotting) {
    const cell = map.get(s.date);
    if (!cell) continue;
    cell.hasSpotting = true;
    cell.spottingColor =
      s.dischargeType === "BLOOD_RED"
        ? FIQH_COLORS.hayz
        : s.dischargeType === "BROWN_SPOT"
          ? FIQH_COLORS.spotting
          : s.dischargeType === "YELLOW"
            ? FIQH_COLORS.istihadha
            : FIQH_COLORS.tuhr;
    if (s.dischargeType === "BROWN_SPOT" && cell.kind === "EMPTY") {
      cell.kind = "SPOTTING";
      cell.labelTR = "Leke";
      cell.labelEN = "Spotting";
    }
  }

  return map;
}

export function colorForKind(kind: FiqhDayKind): string {
  switch (kind) {
    case "HAYZ":
      return FIQH_COLORS.hayz;
    case "TUHR":
      return FIQH_COLORS.tuhr;
    case "ISTIHADHA":
      return FIQH_COLORS.istihadha;
    case "SPOTTING":
      return FIQH_COLORS.spotting;
    case "FASID_TUHR":
      return FIQH_COLORS.fasidTuhr;
    default:
      return "transparent";
  }
}

/** Ramazan günleri ile hayız örtüşen gün sayısı (kaba miladi yaklaşık). */
export function countHayzDaysInRamadanApprox(
  cycles: CycleRecord[],
  year: number
): number {
  // Basitleştirilmiş: kullanıcı yılı için Mart–Nisan penceresi yerine
  // döngüdeki hayız günlerini sayıp harici takvim entegrasyonuna bırakırız.
  // Burada örnek: yıl içindeki tüm HAYZ günlerini döndürür; UI Ramazan etiketi gösterir.
  let days = 0;
  for (const c of cycles) {
    const start = new Date(c.startDate);
    if (start.getFullYear() !== year) continue;
    days += Math.ceil(c.hayzDays);
  }
  return days;
}

/**
 * İslami takvim olmadan pratik yaklaşım:
 * Verilen [ramadanStart, ramadanEnd] aralığında hayız günlerini say.
 */
export function countHayzOverlapWithRange(
  cycles: CycleRecord[],
  rangeStart: string,
  rangeEnd: string
): number {
  const rs = new Date(rangeStart);
  const re = new Date(rangeEnd);
  let count = 0;
  for (const c of cycles) {
    const hs = new Date(c.startDate);
    const he = new Date(
      hs.getTime() + Math.max(0, c.hayzDays) * 24 * 60 * 60 * 1000
    );
    const overlapStart = hs > rs ? hs : rs;
    const overlapEnd = he < re ? he : re;
    if (overlapEnd > overlapStart) {
      count += Math.ceil(
        (overlapEnd.getTime() - overlapStart.getTime()) / (24 * 60 * 60 * 1000)
      );
    }
  }
  return count;
}
