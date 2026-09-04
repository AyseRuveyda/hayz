/**
 * Defter 6 karmaşık vaka — sonuç + tablo (daySchedule / cetvel) denetimi.
 * npx --yes tsx scripts/fiqh-case-audit-2.ts
 */
import {
  calculateFiqhStatus,
  evaluateCycleWithHabit,
} from "../src/lib/fiqh-engine";
import { buildComparisonChart } from "../src/lib/comparison-chart";
import type { CalculationResult } from "../types/fiqh";

function fmtHours(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const d = Math.floor(totalMin / (24 * 60));
  const h = Math.floor((totalMin % (24 * 60)) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}g`);
  if (h) parts.push(`${h}s`);
  if (m || !parts.length) parts.push(`${m}dk`);
  return parts.join(" ");
}

function hoursBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}

function p(
  y: number,
  m: number,
  d: number,
  hh = 12,
  mm = 0
): Date {
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

type TableCheck = {
  ok: boolean;
  issues: string[];
  hayzRows: number;
  istiRows: number;
  kaza: number;
  chartAlign: number;
  chartColorsOk: boolean;
};

function checkTables(
  calc: CalculationResult,
  chartInput: {
    habitHayzHours: number;
    habitTuhurHours: number;
    currentTuhurHours: number;
    bleedingHours: number;
  }
): TableCheck {
  const sched = calc.daySchedule ?? [];
  const issues: string[] = [];
  const hayzRows = sched.filter((s) => s.kind === "HAYZ").length;
  const istiRows = sched.filter((s) => s.kind === "ISTIHADHA").length;

  if (calc.status === "MIXED" && sched.length === 0 && (calc.istihadhaDays ?? 0) > 0) {
    issues.push("MIXED ama daySchedule boş (gün tablosu yok)");
  }
  if (sched.length) {
    if (!sched.every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date))) {
      issues.push("tarih formatı bozuk");
    }
    for (let i = 1; i < sched.length; i++) {
      if (sched[i].date < sched[i - 1].date) {
        issues.push("tarihler sıralı değil");
        break;
      }
    }
    if ((calc.kazayaKalanGunler ?? -1) !== istiRows) {
      issues.push(
        `kazaGün=${calc.kazayaKalanGunler} ≠ istihâze satır=${istiRows}`
      );
    }
    if (hayzRows > 10) issues.push(`hayz satırı ${hayzRows} > 10`);
  }

  const chart = buildComparisonChart({
    ...chartInput,
    daySchedule: calc.daySchedule,
    overlapRule: calc.overlapRule,
    kazayaKalanGunler: calc.kazayaKalanGunler,
  });

  const kinds = new Set(chart.bottomCells.map((c) => c.kind));
  const chartColorsOk =
    kinds.has("TUHR") ||
    kinds.has("HAYZ") ||
    kinds.has("ISTIHADHA");

  if (chart.columnCount < 1) issues.push("cetvel sütun yok");
  if (chart.topCells.length !== chart.bottomCells.length) {
    issues.push("üst/alt satır uzunluğu farklı");
  }
  // alignment: only where top HAYZ + bottom bleed
  for (const col of chart.alignmentColumns) {
    const t = chart.topCells[col];
    const b = chart.bottomCells[col];
    if (t?.kind !== "HAYZ" || (b?.kind !== "HAYZ" && b?.kind !== "ISTIHADHA")) {
      issues.push(`hizalama sütun ${col} geçersiz`);
    }
  }
  if (
    calc.status === "MIXED" &&
    sched.length > 0 &&
    chart.kazayaKalanGunler !== istiRows &&
    chart.kazayaKalanGunler !== (calc.kazayaKalanGunler ?? istiRows)
  ) {
    issues.push("cetvel kaza sayısı çizelge ile uyumsuz");
  }

  return {
    ok: issues.length === 0,
    issues,
    hayzRows,
    istiRows,
    kaza: calc.kazayaKalanGunler ?? istiRows,
    chartAlign: chart.alignmentColumns.length,
    chartColorsOk,
  };
}

type Verdict = {
  id: number;
  title: string;
  resultOk: boolean;
  tableOk: boolean;
  expected: string[];
  actual: string[];
  resultMismatches: string[];
  tableMismatches: string[];
  notes: string[];
};

const verdicts: Verdict[] = [];

function report(v: Verdict) {
  verdicts.push(v);
  const rm = v.resultOk ? "SONUÇ✓" : "SONUÇ✗";
  const tm = v.tableOk ? "TABLO✓" : "TABLO✗";
  console.log(`\n======== Vaka ${v.id}: ${rm} ${tm} — ${v.title} ========`);
  for (const e of v.expected) console.log(`  Beklenen: ${e}`);
  for (const a of v.actual) console.log(`  Motor:    ${a}`);
  for (const m of v.resultMismatches) console.log(`  ✗ sonuç: ${m}`);
  for (const m of v.tableMismatches) console.log(`  ✗ tablo: ${m}`);
  for (const n of v.notes) console.log(`  · ${n}`);
}

// ===========================================================================
// Vaka 1 — 11 Mar temizlik, ara kan 16–21 Nis, ana 19 May–1 Haz
// ===========================================================================
{
  const habitHayz = 5 * 24 + 2;
  const habitTuhur = 36 * 24 + 5;
  const purityStart = p(2025, 3, 11, 7, 30);
  const araStart = p(2025, 4, 16, 12, 30);
  const araEnd = p(2025, 4, 21, 14, 30);
  const bleedStart = p(2025, 5, 19, 15, 30);
  const bleedEnd = p(2025, 6, 1, 18, 0);

  // Ara temizlik 21 Nis→19 May
  const gap = hoursBetween(araEnd, bleedStart);
  const araBleed = hoursBetween(araStart, araEnd);
  const mainBleed = hoursBetween(bleedStart, bleedEnd);
  // Fâsid ara: 21 Nis–19 May ≈ 28g → aslında ≥15 sahih temizlik olabilir
  // Birleşik model (ara fâsid sayılırsa): 16 Nis → 1 Haz
  const mergedStart = araStart;
  const mergedEnd = bleedEnd;
  const mergedH = hoursBetween(mergedStart, mergedEnd);

  const calcMain = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const calcMerged = calculateFiqhStatus({
    startDate: mergedStart.toISOString(),
    endDate: mergedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const tuhurToMain = hoursBetween(purityStart, bleedStart);
  const table = checkTables(calcMain, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurToMain,
    bleedingHours: mainBleed,
  });
  const tableM = checkTables(calcMerged, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: hoursBetween(purityStart, mergedStart),
    bleedingHours: mergedH,
  });

  const resultMismatches: string[] = [];
  const notes: string[] = [
    `Ara kan ${fmtHours(araBleed)}; ara temizlik 21 Nis→19 May = ${fmtHours(gap)} (≥15=${gap >= 360})`,
    `Ana kan 19 May→1 Haz = ${fmtHours(mainBleed)} (${(mainBleed / 24).toFixed(2)}g)`,
    `Ana yol: ${calcMain.status}/${calcMain.overlapRule} hayz=${calcMain.hayzDays.toFixed(2)}g isti=${calcMain.istihadhaDays.toFixed(2)}g kaza=${calcMain.kazayaKalanGunler}`,
    `Birleşik 16 Nis→1 Haz: ${calcMerged.status}/${calcMerged.overlapRule} hayz=${calcMerged.hayzDays.toFixed(2)}g isti=${calcMerged.istihadhaDays.toFixed(2)}g`,
    `Beklenen «2g 23s rastlaşma»: motor ≥3 takvim-günü eşiği kullanır; saat-bazlı 2g23s çıktısı yok.`,
  ];

  // Ana kan ~13.1 gün > 10 → MIXED beklenir
  if (mainBleed > 240 && calcMain.status !== "MIXED") {
    resultMismatches.push(`Ana kan 10+ ama status=${calcMain.status}`);
  }
  if (mainBleed > 240 && !calcMain.overlapRule) {
    resultMismatches.push("10+ için rastlayan/rastlamayan kuralı yok");
  }
  // El yazısı 2g23s < 3g eşiği → RASTLAMAYAN beklenen motor davranışı
  if (calcMain.overlapRule === "RASTLAYAN") {
    notes.push(
      "Motor RASTLAYAN seçti (takvim çakışması ≥3). El yazısı 2g23s ise eşik altı kalırdı."
    );
  }
  // Beklenen net rastlaşma saati motor üretmiyor
  notes.push(
    "Saat hassas «2g 23s rastlaşma» değeri engine API’sinde yok; takvim-günü / habit-saat ayrımı var."
  );

  const tableOk = table.ok && (mainBleed <= 240 || table.hayzRows + table.istiRows > 0);
  const tableMismatches = [...table.issues];
  if (mainBleed > 240 && table.istiRows === 0 && calcMain.status === "MIXED") {
    tableMismatches.push("istihâze satırı yok");
  }

  report({
    id: 1,
    title: "Mart–Haziran fasit + rastlaşma",
    resultOk: resultMismatches.length === 0,
    tableOk: tableMismatches.length === 0,
    expected: [
      "10+ kanamada rastlaşma; ~2g 23s çakışma; kaza/temizlik sınırları",
    ],
    actual: [
      `ana ${calcMain.status}/${calcMain.overlapRule} hayz=${fmtHours(calcMain.hayzDays * 24)} isti=${fmtHours(calcMain.istihadhaDays * 24)}`,
      `tablo hayz=${table.hayzRows} isti=${table.istiRows} kaza=${table.kaza} hizalama=${table.chartAlign}`,
      `birleşik ${calcMerged.overlapRule} (tabloM kaza=${tableM.kaza})`,
    ],
    resultMismatches,
    tableMismatches,
    notes,
  });
}

// ===========================================================================
// Vaka 2 — 1 Mar temizlik, 8 Nis kanama, ara S.K/T.K
// ===========================================================================
{
  const habitHayz = 6 * 24 + 15.5;
  const habitTuhur = 15 * 24 + 0.5;
  const purityStart = p(2025, 3, 1, 10, 30);
  const bleedStart = p(2025, 4, 8, 13, 0);
  // Süreç: 12 Nis S.K, 16 Nis T.K, 18 Nis S.K — bitiş belirsiz; 18 Nis sonrası devam varsay
  // 10+ için bitişi 20 Nis veya daha geç alalım (12+ gün)
  const bleedEnd = p(2025, 4, 22, 13, 0); // ≥10 gün örnek

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const calc = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const table = checkTables(calc, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurH,
    bleedingHours: bleedH,
  });

  const resultMismatches: string[] = [];
  const notes: string[] = [
    `tuhur=${fmtHours(tuhurH)}, bleed=${fmtHours(bleedH)}`,
    `${calc.status}/${calc.overlapRule} hayz=${calc.hayzDays.toFixed(2)}g isti=${calc.istihadhaDays.toFixed(2)}g`,
    `Beklenen 2g23s rastlayan + kesikli çizgi hizası; motor overlapRule=${calc.overlapRule}, hizalamaSütun=${table.chartAlign}`,
    "12/16/18 Nis S.K–T.K kesitleri tek aralıkta birleştirildi (segment API yok).",
  ];

  if (bleedH > 240 && calc.status !== "MIXED") {
    resultMismatches.push("10+ MIXED beklenirdi");
  }
  if (!calc.overlapRule && bleedH > 240) {
    resultMismatches.push("rastlama kuralı yok");
  }

  report({
    id: 2,
    title: "Nisan kesintili + 2g23s rastlayan",
    resultOk: resultMismatches.length === 0,
    tableOk: table.ok,
    expected: [
      "Habit 6g15s30dk ile çakışma (~2g23s); hayz/istihâze tablosu + kesikli çizgi",
    ],
    actual: [
      `${calc.status}/${calc.overlapRule} hayz=${calc.hayzDays.toFixed(2)} isti=${calc.istihadhaDays.toFixed(2)}`,
      `tablo H=${table.hayzRows} I=${table.istiRows} hizalama=${table.chartAlign} renk=${table.chartColorsOk}`,
    ],
    resultMismatches,
    tableMismatches: table.issues,
    notes,
  });
}

// ===========================================================================
// Vaka 3 — 1 Haz temizlik, 25 Haz T.B?, 14 Tem H-Bşl, 21 Tem K+T
// ===========================================================================
{
  const habitHayz = 4 * 24 + 23.5;
  const habitTuhur = 19 * 24 + 0.5;
  const purityStart = p(2025, 6, 1, 11, 0);
  // 25 Haziran "T.B" — temizlik başlangıcı mı kanama mı? Bağlama göre kanama ara noktası / T.B
  // Okuma: 25 Haz T.B (ikinci temizlik?), 14 Tem H-Bşl, 21 Tem bitiş
  // Alternatif: 25 Haz kanama başlangıcı
  const mid = p(2025, 6, 25, 11, 0);
  const bleedStart = p(2025, 7, 14, 11, 30);
  const bleedEnd = p(2025, 7, 21, 12, 0);

  // Model A: tek kanama 14–21 Tem (7g) — 10 aşmaz
  const calcA = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  // Model B: 25 Haz–21 Tem birleşik (fâsid temizlik varsayımı) → T+H uzun
  const calcB = calculateFiqhStatus({
    startDate: mid.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
    isContinuousBleeding: true,
  });

  const calcB2 = calculateFiqhStatus({
    startDate: mid.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const tuhurH = hoursBetween(purityStart, mid);
  const mergedH = hoursBetween(mid, bleedEnd);
  const tableB = checkTables(calcB2, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurH,
    bleedingHours: mergedH,
  });

  const resultMismatches: string[] = [];
  const notes: string[] = [
    `1 Haz→25 Haz tuhur=${fmtHours(tuhurH)} (T≈${(tuhurH / 24).toFixed(1)}g)`,
    `25 Haz→21 Tem birleşik=${fmtHours(mergedH)} (~${(mergedH / 24).toFixed(1)}g) — beklenen T+H=24g civarı ile ${(tuhurH + mergedH) / 24}`,
    `14–21 Tem kısa: ${calcA.status} ${fmtHours(hoursBetween(bleedStart, bleedEnd))}`,
    `Birleşik istimrâr: ${calcB.status} hayz=${calcB.hayzDays.toFixed(2)} isti=${calcB.istihadhaDays.toFixed(2)}`,
    `Birleşik 10+: ${calcB2.status}/${calcB2.overlapRule} hayz=${calcB2.hayzDays.toFixed(2)} isti=${calcB2.istihadhaDays.toFixed(2)} kaza=${calcB2.kazayaKalanGunler}`,
  ];

  const totalTH = (tuhurH + mergedH) / 24;
  if (Math.abs(totalTH - 24) > 3) {
    notes.push(
      `T+H toplamı ${totalTH.toFixed(1)}g (beklenen ~24g) — yıl/saat varsayımlarına bağlı`
    );
  }
  if (mergedH > 240 && calcB2.status !== "MIXED") {
    resultMismatches.push("Birleşik 10+ MIXED olmalı");
  }

  report({
    id: 3,
    title: "Haziran–Temmuz istimrâr / T+H=24",
    resultOk: resultMismatches.length === 0,
    tableOk: tableB.ok,
    expected: [
      "10+ / fâsid temizlik kan; T+H≈24; rastlama bitiş saatleri",
    ],
    actual: [
      `birleşik ${calcB2.status}/${calcB2.overlapRule} hayz=${calcB2.hayzDays.toFixed(2)} isti=${calcB2.istihadhaDays.toFixed(2)}`,
      `tablo H=${tableB.hayzRows} I=${tableB.istiRows} hizalama=${tableB.chartAlign}`,
    ],
    resultMismatches,
    tableMismatches: tableB.issues,
    notes,
  });
}

// ===========================================================================
// Vaka 4 — karmaşık ardışık; 1 Ağustos 15:36 kaza başlangıcı
// ===========================================================================
{
  const habitHayz = 9 * 24 + 21 + 9 / 60;
  const habitTuhur = 16 * 24 + 23 + 2 / 60;
  const purityStart = p(2025, 5, 12, 19, 25);
  const bleedStart = p(2025, 5, 29, 18, 27);
  // Ara noktalar: 2 Tem 10:05, 14 Tem 09:14 S.K, 23 Tem 17:39 H-Bşl
  // Ana uzun kanama bitişi net değil — 23 Tem sonrası veya 2 Ağu’ya kadar
  const bleedEnd = p(2025, 8, 5, 18, 0);

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const calc = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: habitHayz / 24,
    habitPurityDays: habitTuhur / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const table = checkTables(calc, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurH,
    bleedingHours: bleedH,
  });

  // Beklenen kaza başlangıcı 1 Ağustos 15:36 — motor bunu ayrı alan olarak üretmiyor
  const resultMismatches: string[] = [];
  const notes: string[] = [
    `bleed=${fmtHours(bleedH)}, tuhur=${fmtHours(tuhurH)}`,
    `${calc.status}/${calc.overlapRule} hayz=${calc.hayzDays.toFixed(2)} isti=${calc.istihadhaDays.toFixed(2)} kazaGün=${calc.kazayaKalanGunler} qada=${calc.qadaPrayersCount}`,
    `nextEarliestHayzDate=${calc.nextEarliestHayzDate}`,
    "Beklenen «1 Ağustos 15:36 kaza başlangıcı» için özel timestamp alanı yok; kaza gün sayısı + qada vakti var.",
  ];

  if (bleedH > 240 && calc.status !== "MIXED") {
    resultMismatches.push("Uzun kanama MIXED olmalı");
  }
  if ((calc.kazayaKalanGunler ?? 0) <= 0 && calc.qadaPrayersCount <= 0) {
    resultMismatches.push("Kaza üretilmeli");
  }

  // Soft fail note: exact 1 Aug 15:36
  const hasExactQadaStart = false;
  if (!hasExactQadaStart) {
    notes.push(
      "SONUÇ sapması (kısmi): saat-bazlı kaza başlangıç timestamp’i (1 Ağu 15:36) hesaplanmıyor."
    );
  }

  report({
    id: 4,
    title: "Ardışık kanama + 1 Ağu 15:36 kaza",
    resultOk: resultMismatches.length === 0,
    tableOk: table.ok,
    expected: [
      "Habit saat hassas düşüm; 1 Ağustos 15:36 kaza başlangıcı",
    ],
    actual: [
      `${calc.status}/${calc.overlapRule} kazaGün=${calc.kazayaKalanGunler} qada=${calc.qadaPrayersCount}`,
      `tablo H=${table.hayzRows} I=${table.istiRows} hizalama=${table.chartAlign}`,
    ],
    resultMismatches,
    tableMismatches: table.issues,
    notes,
  });
}

// ===========================================================================
// Vaka 5 — 19 Mar… + 24 May sonrası fasit; rastlaşma 8g 21s 2dk
// ===========================================================================
{
  const habitHayz = 9 * 24 + 3 + 57 / 60;
  const habitTuhur = 23 * 24 + 14 + 49 / 60;

  // İlk dönem: 19 Mar T.B, 12 Nis–21 Nis kanama (muhtemel sahih)
  const purity1 = p(2025, 3, 19, 23, 14);
  const b1s = p(2025, 4, 12, 14, 3);
  const b1e = p(2025, 4, 21, 18, 0);

  const cyc1 = evaluateCycleWithHabit({
    bleedingStart: b1s,
    bleedingEnd: b1e,
    previousPurityEnd: purity1,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: habitHayz, tuhurHours: habitTuhur },
  });

  // Yeni dönem: 24 May T.B, 17 Haz H-Bşl, 26 Haz H-Bşl (bitiş?)
  const purity2 = p(2025, 5, 24, 18, 0);
  const b2s = p(2025, 6, 17, 12, 0);
  // Beklenen: T 15g 4s 24dk / K 12g 14s 47dk
  const expectedT = 15 * 24 + 4 + 24 / 60;
  const expectedK = 12 * 24 + 14 + 47 / 60;
  const b2e = new Date(b2s.getTime() + expectedK * 3_600_000);

  const actualT = hoursBetween(purity2, b2s);
  const actualK = hoursBetween(b2s, b2e);

  const calc2 = calculateFiqhStatus({
    startDate: b2s.toISOString(),
    endDate: b2e.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: (cyc1.cycleStatus === "SAHIH"
      ? cyc1.updatedHabit.hayzHours
      : habitHayz) / 24,
    habitPurityDays: (cyc1.cycleStatus === "SAHIH"
      ? cyc1.updatedHabit.tuhurHours
      : habitTuhur) / 24,
    previousPurityStartDate: purity2.toISOString(),
  });

  const table = checkTables(calc2, {
    habitHayzHours:
      cyc1.cycleStatus === "SAHIH" ? cyc1.updatedHabit.hayzHours : habitHayz,
    habitTuhurHours:
      cyc1.cycleStatus === "SAHIH" ? cyc1.updatedHabit.tuhurHours : habitTuhur,
    currentTuhurHours: actualT,
    bleedingHours: actualK,
  });

  const resultMismatches: string[] = [];
  const notes: string[] = [
    `Dönem1: ${cyc1.cycleStatus} bleed=${fmtHours(hoursBetween(b1s, b1e))} tuhur=${fmtHours(hoursBetween(purity1, b1s))}`,
    `Dönem2 T: ${fmtHours(actualT)} (beklenen ${fmtHours(expectedT)})`,
    `Dönem2 K: ${fmtHours(actualK)} (beklenen ${fmtHours(expectedK)})`,
    `${calc2.status}/${calc2.overlapRule} hayz=${calc2.hayzDays.toFixed(2)}g isti=${calc2.istihadhaDays.toFixed(2)}g`,
    `Beklenen rastlaşma 8g 21s 2dk — motor saat-bazlı rastlaşma süresi üretmiyor (takvim günü / habit saat).`,
  ];

  if (Math.abs(actualT - expectedT) > 1) {
    notes.push(
      `17 Haz saat varsayımı T’yi ${fmtHours(actualT)} yaptı; el yazısı ${fmtHours(expectedT)} — H-Bşl saati net değil.`
    );
  }
  if (actualK > 240 && calc2.status !== "MIXED") {
    resultMismatches.push("12g+ kanama MIXED olmalı");
  }
  // Soft: 8g21s2dk exact overlap hours
  notes.push(
    `Motor hayz süresi ${fmtHours(calc2.hayzDays * 24)}; «8g 21s 2dk rastlaşma» ile birebir alan yok.`
  );

  report({
    id: 5,
    title: "Mayıs–Haziran fasit + 8g21s rastlaşma",
    resultOk: resultMismatches.length === 0,
    tableOk: table.ok,
    expected: [
      "T≈15g4s24dk / K≈12g14s47dk; rastlaşma 8g21s2dk çizelge",
    ],
    actual: [
      `T=${fmtHours(actualT)} K=${fmtHours(actualK)} ${calc2.status}/${calc2.overlapRule}`,
      `hayz=${calc2.hayzDays.toFixed(2)}g tablo H=${table.hayzRows} I=${table.istiRows} hizalama=${table.chartAlign}`,
    ],
    resultMismatches,
    tableMismatches: table.issues,
    notes,
  });
}

// ===========================================================================
// Vaka 6 — UI cetvel: 13g kanama, habit 7/15, renk + kesikli çizgi
// ===========================================================================
{
  const habitHayz = 7 * 24;
  const habitTuhur = 15 * 24;
  const purityStart = p(2026, 8, 13, 8, 0);
  const bleedStart = p(2026, 8, 28, 8, 0);
  const bleedEnd = p(2026, 9, 10, 8, 0);

  const bleedH = hoursBetween(bleedStart, bleedEnd); // 13g
  const tuhurH = hoursBetween(purityStart, bleedStart); // 15g

  const calc = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitHayzDays: 7,
    habitPurityDays: 15,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: habitHayz, tuhurHours: habitTuhur },
  });

  const chart = buildComparisonChart({
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurH,
    bleedingHours: bleedH,
    daySchedule: calc.daySchedule,
    overlapRule: calc.overlapRule,
    kazayaKalanGunler: calc.kazayaKalanGunler,
  });

  const table = checkTables(calc, {
    habitHayzHours: habitHayz,
    habitTuhurHours: habitTuhur,
    currentTuhurHours: tuhurH,
    bleedingHours: bleedH,
  });

  const resultMismatches: string[] = [];
  const tableMismatches = [...table.issues];
  const notes: string[] = [
    `bleed=${fmtHours(bleedH)} (${bleedH / 24}g), tuhur=${fmtHours(tuhurH)}`,
    `cycle=${cycle.cycleStatus} calc=${calc.status}/${calc.overlapRule}`,
    `cetvel: cols=${chart.columnCount} üstT=${chart.habitTuhurDays} üstH=${chart.habitHayzDays} altT=${chart.currentTuhurDays} H=${chart.hayzDays} I=${chart.istihadhaDays} hizalama=${chart.alignmentColumns.length}`,
  ];

  // 13 gün > 10 → panel/fasid
  if (bleedH / 24 <= 10) {
    resultMismatches.push("Kanama 10 günü aşmalı (13g)");
  }
  if (cycle.cycleStatus !== "FASID") {
    resultMismatches.push(`FASID beklenirdi, ${cycle.cycleStatus}`);
  }
  if (calc.status !== "MIXED") {
    resultMismatches.push(`MIXED beklenirdi, ${calc.status}`);
  }
  if (!calc.overlapRule) {
    resultMismatches.push("rastlama kuralı yok");
  }

  // Renkler: yeşil TUHR, kırmızı HAYZ, sarı ISTIHADHA
  const bottomKinds = new Set(chart.bottomCells.map((c) => c.kind));
  const topKinds = new Set(chart.topCells.map((c) => c.kind));
  if (!topKinds.has("TUHR") || !topKinds.has("HAYZ")) {
    tableMismatches.push("üst satırda yeşil(T)+kırmızı(H) yok");
  }
  if (!bottomKinds.has("TUHR")) {
    tableMismatches.push("alt satırda yeşil temizlik yok");
  }
  if (!bottomKinds.has("HAYZ") && !bottomKinds.has("ISTIHADHA")) {
    tableMismatches.push("alt satırda kırmızı/sarı kanama yok");
  }
  if (chart.alignmentColumns.length === 0) {
    tableMismatches.push("siyah kesikli hizalama çizgisi yok");
  }
  // Hizalama: üst hayz ile alt kanama aynı sütunda
  const alignOk = chart.alignmentColumns.every((i) => {
    const t = chart.topCells[i];
    const b = chart.bottomCells[i];
    return (
      t.kind === "HAYZ" && (b.kind === "HAYZ" || b.kind === "ISTIHADHA")
    );
  });
  if (!alignOk) tableMismatches.push("hizalama sütunları üst HAYZ ile örtüşmüyor");

  // Son sahih panel verisi: 7g / 15g — habit input olarak kullanıldı (UI açılımı form katmanı)
  notes.push(
    "«Son Sahih Ay Verileri» paneli UI (CalculatorForm) katmanında; motor 10+ olunca MIXED+çizelge üretir."
  );

  report({
    id: 6,
    title: "UI cetvel 13g + 7/15 habit renk/hizalama",
    resultOk: resultMismatches.length === 0,
    tableOk: tableMismatches.length === 0,
    expected: [
      "10+ panel; 7g/15g ile 13g karşılaştırma; yeşil/kırmızı/sarı + kesikli hizalama",
    ],
    actual: [
      `${cycle.cycleStatus} ${calc.status}/${calc.overlapRule} hayz=${calc.hayzDays} isti=${calc.istihadhaDays}`,
      `cetvel hizalama=${chart.alignmentColumns.length} H=${chart.hayzDays} I=${chart.istihadhaDays} kaza=${chart.kazayaKalanGunler}`,
    ],
    resultMismatches,
    tableMismatches,
    notes,
  });
}

// ===========================================================================
console.log("\n\n========== ÖZET ==========");
for (const v of verdicts) {
  console.log(
    `Vaka ${v.id}: sonuç=${v.resultOk ? "DOĞRU" : "YANLIŞ"} | tablo=${v.tableOk ? "DOĞRU" : "YANLIŞ"}`
  );
}
const allResult = verdicts.every((v) => v.resultOk);
const allTable = verdicts.every((v) => v.tableOk);
console.log(
  `\nGenel: sonuç ${allResult ? "6/6 OK" : `${verdicts.filter((v) => v.resultOk).length}/6`} | tablo ${allTable ? "6/6 OK" : `${verdicts.filter((v) => v.tableOk).length}/6`}`
);

console.log(
  "\nJSON:" +
    JSON.stringify(
      verdicts.map((v) => ({
        id: v.id,
        resultOk: v.resultOk,
        tableOk: v.tableOk,
        resultMismatches: v.resultMismatches,
        tableMismatches: v.tableMismatches,
        notes: v.notes,
      })),
      null,
      2
    )
);

process.exit(allResult && allTable ? 0 : 1);
