import type { DayScheduleEntry, OverlapRule } from "@/types/fiqh";

export type ChartCellKind = "TUHR" | "HAYZ" | "ISTIHADHA" | "EMPTY";

export interface ChartCell {
  kind: ChartCellKind;
  /** 1-based süre günü / sütun numarası (takvim günü değil). */
  col: number;
  labelTR: string;
  labelEN: string;
}

export interface ComparisonChartData {
  columnCount: number;
  topCells: ChartCell[];
  bottomCells: ChartCell[];
  /** Rastlama / hizalama için siyah kesikli çizgi (0-based sütun). */
  alignmentColumns: number[];
  topCycleDays: number;
  bottomCycleDays: number;
  habitHayzDays: number;
  habitTuhurDays: number;
  currentTuhurDays: number;
  hayzDays: number;
  istihadhaDays: number;
  kazayaKalanGunler: number;
  overlapRule: OverlapRule | null;
}

/** Saat → kutucuk sayısı: 17g 8s → 18 kutucuk (kısmi gün yukarı yuvarlanır). */
export function hoursToCellCount(hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.max(1, Math.ceil(hours / 24 - 1e-9));
}

function cell(kind: ChartCellKind, col: number): ChartCell {
  const labels: Record<ChartCellKind, { tr: string; en: string }> = {
    TUHR: { tr: "Temizlik", en: "Purity" },
    HAYZ: { tr: "Hayz", en: "Hayd" },
    ISTIHADHA: { tr: "İstihâze", en: "Istihadha" },
    EMPTY: { tr: "—", en: "—" },
  };
  return {
    kind,
    col,
    labelTR: labels[kind].tr,
    labelEN: labels[kind].en,
  };
}

function pushKind(cells: ChartCell[], kind: ChartCellKind, count: number) {
  const n = Math.max(0, Math.round(count));
  for (let i = 0; i < n; i++) {
    cells.push(cell(kind, cells.length + 1));
  }
}

function padTo(cells: ChartCell[], len: number) {
  while (cells.length < len) {
    cells.push(cell("EMPTY", cells.length + 1));
  }
}

export type BuildComparisonInput = {
  /** Önceki sahih hayz süresi (saat). */
  habitHayzHours: number;
  /** Önceki sahih temizlik süresi (saat). */
  habitTuhurHours: number;
  /** Mevcut ay temizlik süresi (saat) — temizlik başlangıcı → kanama başlangıcı. */
  currentTuhurHours: number;
  /** Yeni kanama süresi (saat). */
  bleedingHours: number;
  /** Motorun gün gün çizelgesi (varsa) — sıra = süre günleri. */
  daySchedule?: DayScheduleEntry[];
  overlapRule?: OverlapRule | null;
  kazayaKalanGunler?: number;
};

/**
 * Üst: Son Sahih Ay = [Hayz × âdet][Temizlik × âdet]  (süre kutucukları)
 * Alt: 10 günü aşan ay = [Temizlik × mevcut][Kanama çizelgesi…]
 *
 * Takvim ay-günü kullanılmaz. Örn. 17g 8s temizlik → 18 yeşil, 19. kutucuk kan.
 * Rastlama çizgisi: aynı sütunda üstte hayz + altta kanama (hayz/istihâze).
 */
export function buildComparisonChart(
  input: BuildComparisonInput
): ComparisonChartData {
  const habitHayzDays = Math.max(1, hoursToCellCount(input.habitHayzHours) || 7);
  const habitTuhurDays = Math.max(
    15,
    hoursToCellCount(input.habitTuhurHours) || 15
  );
  const currentTuhurDays = hoursToCellCount(input.currentTuhurHours);
  const bleedingDayCount =
    input.daySchedule && input.daySchedule.length > 0
      ? input.daySchedule.length
      : Math.max(1, hoursToCellCount(input.bleedingHours));

  // Üst satır — süre sırası: önce âdet hayz, sonra âdet temizlik
  const top: ChartCell[] = [];
  pushKind(top, "HAYZ", habitHayzDays);
  pushKind(top, "TUHR", habitTuhurDays);

  // Alt satır — süre sırası: önce mevcut temizlik, sonra kanama günleri
  const bottom: ChartCell[] = [];
  pushKind(bottom, "TUHR", currentTuhurDays);

  if (input.daySchedule && input.daySchedule.length > 0) {
    for (const row of input.daySchedule) {
      const kind: ChartCellKind =
        row.kind === "HAYZ" ? "HAYZ" : "ISTIHADHA";
      bottom.push(cell(kind, bottom.length + 1));
    }
  } else {
    pushKind(bottom, "HAYZ", bleedingDayCount);
  }

  const columnCount = Math.max(top.length, bottom.length, 1);
  padTo(top, columnCount);
  padTo(bottom, columnCount);

  // Sütun hizası: üstte hayz olan sütunda altta kanama varsa rastlama çizgisi
  const alignmentColumns: number[] = [];
  for (let i = 0; i < columnCount; i++) {
    const t = top[i];
    const b = bottom[i];
    const bottomBleed = b.kind === "HAYZ" || b.kind === "ISTIHADHA";
    if (t.kind === "HAYZ" && bottomBleed) {
      alignmentColumns.push(i);
    }
  }

  // Çizgi yoksa: üst hayz sütunlarına yine de hizalama çiz (karşılaştırma)
  if (alignmentColumns.length === 0) {
    for (let i = 0; i < columnCount; i++) {
      if (top[i].kind === "HAYZ") alignmentColumns.push(i);
    }
  }

  const hayzDays =
    input.daySchedule?.filter((d) => d.kind === "HAYZ").length ??
    Math.min(
      bleedingDayCount,
      hoursToCellCount(
        Math.min(input.bleedingHours, input.habitHayzHours || input.bleedingHours)
      )
    );
  const istihadhaDays =
    input.daySchedule?.filter((d) => d.kind === "ISTIHADHA").length ??
    Math.max(0, bleedingDayCount - Math.round(hayzDays));

  return {
    columnCount,
    topCells: top,
    bottomCells: bottom,
    alignmentColumns,
    topCycleDays: habitHayzDays + habitTuhurDays,
    bottomCycleDays: currentTuhurDays + bleedingDayCount,
    habitHayzDays,
    habitTuhurDays,
    currentTuhurDays,
    hayzDays: Number(hayzDays),
    istihadhaDays: Number(istihadhaDays),
    kazayaKalanGunler: input.kazayaKalanGunler ?? istihadhaDays,
    overlapRule: input.overlapRule ?? null,
  };
}

export const CHART_COLORS = {
  page: "#FFF3EE",
  card: "#FFF8F5",
  fuchsia: "#F42566",
  tuhr: "#22C55E",
  tuhrSoft: "#DCFCE7",
  hayz: "#E11D48",
  hayzSoft: "#FFE4E6",
  istihadha: "#EAB308",
  istihadhaSoft: "#FEF9C3",
  empty: "#F5F5F4",
  ink: "#1C1917",
} as const;
