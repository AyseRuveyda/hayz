import type { DayScheduleEntry, OverlapRule } from "@/types/fiqh";

export type ChartCellKind = "TUHR" | "HAYZ" | "ISTIHADHA" | "EMPTY";

export interface ChartCell {
  kind: ChartCellKind;
  /** 1-based sütun numarası (görüntü). */
  col: number;
  /** Ayın günü (1–31), varsa. */
  dayOfMonth?: number;
  labelTR: string;
  labelEN: string;
}

export interface ComparisonChartData {
  columnCount: number;
  topCells: ChartCell[];
  bottomCells: ChartCell[];
  /** Rastlama / hizalama için siyah kesikli çizgi çizilecek sütun indeksleri (0-based). */
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

function roundDays(hours: number): number {
  return Math.max(0, Math.round((hours / 24) * 10) / 10);
}

function ceilDays(hours: number): number {
  return Math.max(0, Math.ceil(hours / 24 - 1e-9));
}

function cell(
  kind: ChartCellKind,
  col: number,
  dayOfMonth?: number
): ChartCell {
  const labels: Record<ChartCellKind, { tr: string; en: string }> = {
    TUHR: { tr: "Temizlik", en: "Purity" },
    HAYZ: { tr: "Hayz", en: "Hayd" },
    ISTIHADHA: { tr: "İstihâze", en: "Istihadha" },
    EMPTY: { tr: "—", en: "—" },
  };
  return {
    kind,
    col,
    dayOfMonth,
    labelTR: labels[kind].tr,
    labelEN: labels[kind].en,
  };
}

function pushKind(
  cells: ChartCell[],
  kind: ChartCellKind,
  count: number,
  startDom?: number
) {
  const n = Math.max(0, Math.round(count));
  for (let i = 0; i < n; i++) {
    const dom =
      typeof startDom === "number"
        ? ((startDom - 1 + i) % 31) + 1
        : undefined;
    cells.push(cell(kind, cells.length + 1, dom));
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
  /** Motorun gün gün çizelgesi (varsa). */
  daySchedule?: DayScheduleEntry[];
  overlapRule?: OverlapRule | null;
  kazayaKalanGunler?: number;
  /** Önceki hayzın başladığı ay günü (1–31); yoksa 1. */
  previousHayzStartDom?: number;
  /** Mevcut temizlik başlangıç ay günü. */
  currentTuhurStartDom?: number;
  /** Mevcut kanama başlangıç ay günü. */
  bleedingStartDom?: number;
};

/**
 * Üst satır: Son Sahih Ay = [Hayz][Temizlik]
 * Alt satır: Yeni Ay = [Temizlik][Hayz/İstihâze…]
 * Sütun sayısı = max(üst, alt)
 * Kesikli çizgi: üstte HAYZ olan ve altta aynı ay-günü (veya aynı sütunda HAYZ/İSTİHÂZE) olan sütunlar.
 */
export function buildComparisonChart(
  input: BuildComparisonInput
): ComparisonChartData {
  const habitHayzDays = Math.max(1, Math.round(input.habitHayzHours / 24) || 7);
  const habitTuhurDays = Math.max(
    15,
    Math.round(input.habitTuhurHours / 24) || 15
  );
  const currentTuhurDays = Math.max(0, ceilDays(input.currentTuhurHours));
  const bleedingDayCount =
    input.daySchedule && input.daySchedule.length > 0
      ? input.daySchedule.length
      : Math.max(1, ceilDays(input.bleedingHours));

  const top: ChartCell[] = [];
  const prevDom = input.previousHayzStartDom ?? 1;
  pushKind(top, "HAYZ", habitHayzDays, prevDom);
  const afterHayzDom = ((prevDom - 1 + habitHayzDays) % 31) + 1;
  pushKind(top, "TUHR", habitTuhurDays, afterHayzDom);

  const bottom: ChartCell[] = [];
  const tuhurDom = input.currentTuhurStartDom ?? 1;
  pushKind(bottom, "TUHR", currentTuhurDays, tuhurDom);

  if (input.daySchedule && input.daySchedule.length > 0) {
    for (const row of input.daySchedule) {
      const kind: ChartCellKind =
        row.kind === "HAYZ" ? "HAYZ" : "ISTIHADHA";
      const dom = Number(row.date.slice(8, 10));
      bottom.push(cell(kind, bottom.length + 1, dom));
    }
  } else {
    // Fallback: tamamı hayz gibi boya (sahih kısa kanama)
    const bleedDom = input.bleedingStartDom ?? tuhurDom;
    pushKind(bottom, "HAYZ", bleedingDayCount, bleedDom);
  }

  const columnCount = Math.max(top.length, bottom.length, 1);
  padTo(top, columnCount);
  padTo(bottom, columnCount);

  // Üst hayz ay-günleri
  const topHayzDom = new Set(
    top.filter((c) => c.kind === "HAYZ" && c.dayOfMonth).map((c) => c.dayOfMonth!)
  );

  const alignmentColumns: number[] = [];
  for (let i = 0; i < columnCount; i++) {
    const b = bottom[i];
    const t = top[i];
    const bottomBleed = b.kind === "HAYZ" || b.kind === "ISTIHADHA";
    const sameDom =
      typeof b.dayOfMonth === "number" && topHayzDom.has(b.dayOfMonth);
    const stackedHayz = t.kind === "HAYZ" && bottomBleed;
    if (sameDom || stackedHayz) {
      alignmentColumns.push(i);
    }
  }

  // Eğer hiç hizalama yoksa her sütun sınırına ince çizgi için boş bırak — UI her sütun arasına hafif çizgi koyabilir;
  // kullanıcı siyah kesikli çizgiyi rastlama için istedi → alignmentColumns kullanırız.
  // Rastlama yoksa yine de her dolu sütuna çizgi (karşılaştırma kolaylığı)
  if (alignmentColumns.length === 0) {
    for (let i = 0; i < columnCount; i++) {
      if (top[i].kind !== "EMPTY" || bottom[i].kind !== "EMPTY") {
        alignmentColumns.push(i);
      }
    }
  }

  const hayzDays =
    input.daySchedule?.filter((d) => d.kind === "HAYZ").length ??
    roundDays(Math.min(input.bleedingHours, input.habitHayzHours || input.bleedingHours));
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
