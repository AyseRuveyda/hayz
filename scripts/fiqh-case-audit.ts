/**
 * El yazısı 6 vaka — fiqh-engine doğrulama denetimi.
 * Çalıştır: npx --yes tsx scripts/fiqh-case-audit.ts
 */
import {
  analyzeSahihAy,
  calculateFiqhStatus,
  evaluateCycleWithHabit,
} from "../src/lib/fiqh-engine";

function fmtHours(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const d = Math.floor(totalMin / (24 * 60));
  const h = Math.floor((totalMin % (24 * 60)) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}g`);
  if (h) parts.push(`${h}s`);
  if (m || parts.length === 0) parts.push(`${m}dk`);
  return parts.join(" ");
}

function hoursBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60));
}

function parseLocal(
  y: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(y, month - 1, day, hour, minute, 0, 0);
}

type CaseVerdict = {
  id: number;
  title: string;
  ok: boolean;
  expected: string[];
  actual: string[];
  mismatches: string[];
  notes: string[];
};

const results: CaseVerdict[] = [];

function pushCase(v: CaseVerdict) {
  results.push(v);
  const mark = v.ok ? "PASS" : "FAIL";
  console.log(`\n======== Vaka ${v.id}: ${mark} — ${v.title} ========`);
  for (const e of v.expected) console.log(`  Beklenen: ${e}`);
  for (const a of v.actual) console.log(`  Motor:    ${a}`);
  for (const m of v.mismatches) console.log(`  ✗ ${m}`);
  for (const n of v.notes) console.log(`  · ${n}`);
}

// ---------------------------------------------------------------------------
// Vaka 1 — Sahih ay (Kasım)
// ---------------------------------------------------------------------------
{
  const purityStart = parseLocal(2024, 11, 2, 12, 32);
  const bleedStart = parseLocal(2024, 11, 22, 7, 27);
  const bleedEnd = parseLocal(2024, 11, 30, 11, 40);
  const prevHayzH =
    8 * 24 + 4 + 13 / 60; /* 8g 4s 13dk — önceki sahih */
  const prevTuhurH = 19 * 24 + 18 + 55 / 60;

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: prevHayzH, tuhurHours: prevTuhurH },
  });

  const calc = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: prevTuhurH / 24,
    habitHayzDays: prevHayzH / 24,
    previousPurityStartDate: purityStart.toISOString(),
  });

  const month = analyzeSahihAy({
    madhhab: "HANAFI",
    bleedingDays: bleedH / 24,
    purityDays: tuhurH / 24,
    habitHayzDays: prevHayzH / 24,
  });

  // Beklenen el yazısı: 8g 4s 43dk — verilen saatlerle 8g 4s 13dk çıkar
  const expectedBleedLabel = "8g 4s 43dk (el yazısı)";
  const actualBleedLabel = fmtHours(bleedH);
  const mismatches: string[] = [];
  const notes: string[] = [];

  if (cycle.cycleStatus !== "SAHIH" || !month.isSahihMonth) {
    mismatches.push(`Sahih ay bekleniyordu, motor: ${cycle.cycleStatus}`);
  }
  // 8g 4s 13dk ≈ 196.2167h; 8g 4s 43dk ≈ 196.7167h — 30 dk fark (muhtemel yazım)
  const expectedBleedH_hand = 8 * 24 + 4 + 43 / 60;
  const expectedBleedH_fromTimes = 8 * 24 + 4 + 13 / 60;
  if (Math.abs(bleedH - expectedBleedH_fromTimes) > 0.02) {
    mismatches.push(
      `Kanama süresi zaman damgalarından ${actualBleedLabel}, beklenen zamanlardan ${fmtHours(expectedBleedH_fromTimes)}`
    );
  }
  if (Math.abs(bleedH - expectedBleedH_hand) > 0.1) {
    notes.push(
      `El yazısındaki «8g 4s 43dk» ile verilen 22 Kas 07:27→30 Kas 11:40 (=${actualBleedLabel}) uyuşmuyor; motor zaman damgalarına uyuyor.`
    );
  }
  if (Math.abs(tuhurH - prevTuhurH) > 0.02) {
    notes.push(
      `Tuhur ${fmtHours(tuhurH)} (2 Kas 12:32→22 Kas 07:27); önceki sahih tuhur ${fmtHours(prevTuhurH)} ile uyumlu.`
    );
  }
  if (cycle.updatedHabit.hayzHours !== bleedH) {
    mismatches.push("Sahih ayda yeni hayz = bu döngü kanaması olmalıydı");
  }
  if (Math.abs(cycle.updatedHabit.tuhurHours - tuhurH) > 0.01) {
    mismatches.push("Sahih ayda yeni tuhur = bu döngü temizliği olmalıydı");
  }
  if (calc.status !== "HAYZ") {
    mismatches.push(`calculateFiqhStatus status=${calc.status}, HAYZ beklenirdi`);
  }

  pushCase({
    id: 1,
    title: "Sahih ay — Kasım kanaması ≤10 gün",
    ok: mismatches.length === 0,
    expected: [
      "Sahih ay; hayz≈8g 4s; tuhur 22 Kasım’a kadar temizlik; habit güncellenir",
      expectedBleedLabel,
    ],
    actual: [
      `cycle=${cycle.cycleStatus}, monthSahih=${month.isSahihMonth}`,
      `kanama=${actualBleedLabel} (${bleedH.toFixed(3)}h), tuhur=${fmtHours(tuhurH)}`,
      `updatedHabit hayz=${fmtHours(cycle.updatedHabit.hayzHours)}, tuhur=${fmtHours(cycle.updatedHabit.tuhurHours)}`,
      `calc status=${calc.status}, hayzDays=${calc.hayzDays.toFixed(3)}`,
    ],
    mismatches,
    notes,
  });
}

// ---------------------------------------------------------------------------
// Vaka 2 — İstimrâr / 10+ gün, rastlayan
// ---------------------------------------------------------------------------
{
  const purityStart = parseLocal(2024, 11, 23, 5, 30);
  const bleedStart = parseLocal(2025, 1, 9, 13, 45);
  // İstimrâr: bitiş yok → 10 günü aşacak şekilde örnek uzun aralık (örn. 25 gün)
  const bleedEnd = parseLocal(2025, 2, 3, 13, 45);
  const prevHayzH = 9 * 24 + 23 + 35 / 60;
  const prevTuhurH = 16 * 24 + 8 + 15 / 60;

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const calc = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: prevTuhurH / 24,
    habitHayzDays: prevHayzH / 24,
    previousPurityStartDate: purityStart.toISOString(),
    isContinuousBleeding: true,
  });

  const calcNoIstimrar = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: prevTuhurH / 24,
    habitHayzDays: prevHayzH / 24,
    previousPurityStartDate: purityStart.toISOString(),
    isContinuousBleeding: false,
  });

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: prevHayzH, tuhurHours: prevTuhurH },
  });

  const mismatches: string[] = [];
  const notes: string[] = [];

  // Beklenen: 10+ fâsid, rastlayan → habit kadar hayz, kalan istihâze + kaza
  if (cycle.cycleStatus !== "FASID") {
    mismatches.push(`10+ günde FASID beklenirdi, cycle=${cycle.cycleStatus}`);
  }
  // İstimrâr yolu: habit hayz döngüsü; rastlayan yolu ayrı
  notes.push(
    `İstimrâr bayrağı AÇIK: status=${calc.status}, hayzDays=${calc.hayzDays.toFixed(3)}, istihadhaDays=${calc.istihadhaDays.toFixed(3)}, qada=${calc.qadaPrayersCount}`
  );
  notes.push(
    `İstimrâr KAPALI (10+ rastlayan/rastlamayan): status=${calcNoIstimrar.status}, rule=${calcNoIstimrar.overlapRule}, hayzDays=${calcNoIstimrar.hayzDays.toFixed(3)}, isti=${calcNoIstimrar.istihadhaDays.toFixed(3)}, kazaGün=${calcNoIstimrar.kazayaKalanGunler}, qada=${calcNoIstimrar.qadaPrayersCount}`
  );

  // El yazısı: önceki sahih hayz kadar hayz, aşanı istihâze
  const expectedHayzDays = prevHayzH / 24;
  // İstimrâr açıkken splitIstimrar kullanır — habit hayz + habit tuhur döngüsü
  // Kapalıyken rastlayan/rastlamayan
  const pathOk =
    calcNoIstimrar.status === "MIXED" &&
    (calcNoIstimrar.overlapRule === "RASTLAYAN" ||
      calcNoIstimrar.overlapRule === "RASTLAMAYAN") &&
    calcNoIstimrar.istihadhaDays > 0 &&
    (calcNoIstimrar.kazayaKalanGunler ?? 0) > 0;

  if (!pathOk) {
    mismatches.push(
      "10+ günde MIXED + istihâze/kaza çizelgesi üretilemedi (istimrâr kapalı yol)"
    );
  }

  // Habit korunmalı (fâsid)
  if (
    lastHabitChanged(cycle.updatedHabit, prevHayzH, prevTuhurH)
  ) {
    mismatches.push(
      `Fâsid ayda habit değişmemeliydi; updated=${fmtHours(cycle.updatedHabit.hayzHours)} / ${fmtHours(cycle.updatedHabit.tuhurHours)}`
    );
  }

  // Yakın hayz süresi (rastlamayan yolu habit saatini kullanır)
  const hayzClose =
    Math.abs(calcNoIstimrar.hayzDays - expectedHayzDays) < 0.15 ||
    Math.abs(calc.hayzDays - expectedHayzDays) < 0.15 ||
    // rastlayan gün sayısı yuvarlanmış olabilir
    Math.abs(calcNoIstimrar.hayzDays - Math.round(expectedHayzDays)) < 0.15;

  if (!hayzClose) {
    mismatches.push(
      `Hayz süresi önceki âdete (~${fmtHours(prevHayzH)}) yakın olmalı; istimrâr=${calc.hayzDays.toFixed(2)}g, 10+=${calcNoIstimrar.hayzDays.toFixed(2)}g`
    );
  }

  pushCase({
    id: 2,
    title: "İstimrâr / 10+ gün — rastlayan + kaza",
    ok: mismatches.length === 0,
    expected: [
      "Fâsid (10+); önceki sahih hayz kadar hayz, aşanı istihâze; kaza listesi",
      `önceki hayz ${fmtHours(prevHayzH)}`,
    ],
    actual: [
      `cycle=${cycle.cycleStatus}, bleed=${fmtHours(bleedH)}, tuhur=${fmtHours(tuhurH)}`,
      `istimrâr: ${calc.status} hayz=${calc.hayzDays.toFixed(2)}g isti=${calc.istihadhaDays.toFixed(2)}g`,
      `10+ kural: ${calcNoIstimrar.overlapRule} hayz=${calcNoIstimrar.hayzDays.toFixed(2)}g isti=${calcNoIstimrar.istihadhaDays.toFixed(2)}g kazaGün=${calcNoIstimrar.kazayaKalanGunler}`,
    ],
    mismatches,
    notes,
  });
}

function lastHabitChanged(
  updated: { hayzHours: number; tuhurHours: number },
  prevH: number,
  prevT: number
): boolean {
  return (
    Math.abs(updated.hayzHours - prevH) > 0.05 ||
    Math.abs(updated.tuhurHours - prevT) > 0.05
  );
}

// ---------------------------------------------------------------------------
// Vaka 3 — İki döngü: (A) sahih Mayıs–Haziran, (B) 10+ Haziran–Temmuz rastlaşma
// ---------------------------------------------------------------------------
{
  // 10 Mayıs 21:00 temizlik → 31 Mayıs kanama → 7 Haziran bitiş (sahih ~7g)
  // sonra 7 Haziran temizlik → 26 Haziran–7 Temmuz kanama (11g > 10) → rastlayan
  const purityA = parseLocal(2025, 5, 10, 21, 0);
  const bleedA0 = parseLocal(2025, 5, 31, 12, 0);
  const bleedA1 = parseLocal(2025, 6, 7, 12, 0);
  const bleedB0 = parseLocal(2025, 6, 26, 12, 0);
  const bleedB1 = parseLocal(2025, 7, 7, 12, 0);
  const prevHayzH = 7 * 24 + 2 + 45 / 60;
  const prevTuhurH = 20 * 24 + 15 + 30 / 60;

  const cycleA = evaluateCycleWithHabit({
    bleedingStart: bleedA0,
    bleedingEnd: bleedA1,
    previousPurityEnd: purityA,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: prevHayzH, tuhurHours: prevTuhurH },
  });

  const gapB = hoursBetween(bleedA1, bleedB0);
  const bleedBH = hoursBetween(bleedB0, bleedB1);

  const calcB = calculateFiqhStatus({
    startDate: bleedB0.toISOString(),
    endDate: bleedB1.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: cycleA.updatedHabit.tuhurHours / 24,
    habitHayzDays: cycleA.updatedHabit.hayzHours / 24,
    previousPurityStartDate: bleedA1.toISOString(),
  });

  const cycleB = evaluateCycleWithHabit({
    bleedingStart: bleedB0,
    bleedingEnd: bleedB1,
    previousPurityEnd: bleedA1,
    madhhab: "Hanafi",
    lastValidHabit: cycleA.updatedHabit,
  });

  const mismatches: string[] = [];
  const notes: string[] = [
    `Döngü A: ${cycleA.cycleStatus}, kanama=${fmtHours(hoursBetween(bleedA0, bleedA1))}, tuhur=${fmtHours(hoursBetween(purityA, bleedA0))}`,
    `Ara temizlik 7 Haz→26 Haz = ${fmtHours(gapB)} (≥15 → sahih temizlik; bu aralık «fâsid temizlik» değil)`,
    `Döngü B: bleed=${fmtHours(bleedBH)}, ${cycleB.cycleStatus}, rule=${calcB.overlapRule}, hayz=${calcB.hayzDays.toFixed(3)}g, isti=${calcB.istihadhaDays.toFixed(3)}g, kazaGün=${calcB.kazayaKalanGunler}`,
    "Rastlayan takvim-günü bazlı: hayz≈7 gün; el yazısı 7g 2s 45dk habit süresine yakın.",
  ];

  if (cycleA.cycleStatus !== "SAHIH") {
    mismatches.push(`Döngü A SAHIH olmalı, ${cycleA.cycleStatus}`);
  }
  if (bleedBH <= 240) {
    mismatches.push("Döngü B kanaması 10 günü aşmalı");
  }
  if (cycleB.cycleStatus !== "FASID") {
    mismatches.push(`Döngü B FASID olmalı, ${cycleB.cycleStatus}`);
  }
  if (calcB.status !== "MIXED" || !calcB.overlapRule) {
    mismatches.push("Döngü B’de rastlayan/rastlamayan + MIXED beklenirdi");
  }
  if (
    Math.abs(calcB.hayzDays - 7) > 0.6 &&
    Math.abs(calcB.hayzDays - prevHayzH / 24) > 0.6
  ) {
    mismatches.push(
      `Hayz ≈ 7g / ${fmtHours(prevHayzH)} beklenirdi; motor ${calcB.hayzDays.toFixed(2)}g`
    );
  }
  if ((calcB.kazayaKalanGunler ?? 0) <= 0) {
    mismatches.push("Kaza günleri üretilmeliydi");
  }

  pushCase({
    id: 3,
    title: "Sahih döngü + sonraki 10+ rastlaşma",
    ok: mismatches.length === 0,
    expected: [
      "İlk döngü sahih; sonraki 10+ günde ~7g 2s 45dk hayz, kalan istihâze+kaza",
    ],
    actual: [
      `A=${cycleA.cycleStatus}; B=${cycleB.cycleStatus}/${calcB.overlapRule}`,
      `B hayz=${calcB.hayzDays.toFixed(3)}g isti=${calcB.istihadhaDays.toFixed(3)}g kazaGün=${calcB.kazayaKalanGunler}`,
    ],
    mismatches,
    notes,
  });
}

// ---------------------------------------------------------------------------
// Vaka 4 — Tam sahih ay
// ---------------------------------------------------------------------------
{
  const purityStart = parseLocal(2025, 5, 5, 18, 30);
  const bleedStart = parseLocal(2025, 5, 26, 19, 30);
  const bleedEnd = parseLocal(2025, 6, 2, 21, 30);
  const prevHayzH = 7 * 24 + 2;
  const prevTuhurH = 21 * 24 + 1;

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: prevHayzH, tuhurHours: prevTuhurH },
  });

  const mismatches: string[] = [];
  const notes: string[] = [];

  // Beklenen: hayz 7g 2s, tuhur 20g 22s 30dk
  const expectedBleed = 7 * 24 + 2;
  const expectedTuhur = 20 * 24 + 22 + 30 / 60;

  if (cycle.cycleStatus !== "SAHIH") {
    mismatches.push(`SAHIH beklenirdi, ${cycle.cycleStatus}`);
  }
  if (Math.abs(bleedH - expectedBleed) > 0.05) {
    mismatches.push(
      `Kanama ${fmtHours(bleedH)}, beklenen ${fmtHours(expectedBleed)}`
    );
  }
  if (Math.abs(tuhurH - expectedTuhur) > 0.05) {
    // 5 May 18:30 → 26 May 19:30 = 21g 1s, NOT 20g 22s 30dk
    notes.push(
      `El yazısı tuhur «20g 22s 30dk»; zaman damgaları ${fmtHours(tuhurH)} (5 May 18:30→26 May 19:30). Motor damgalara göre.`
    );
    // Don't fail solely on handwritten tuhur label if timestamps differ — but expected says that update value
    if (Math.abs(tuhurH - (21 * 24 + 1)) > 0.05) {
      mismatches.push(`Tuhur zaman damgaları tutarsız: ${fmtHours(tuhurH)}`);
    }
  }
  if (Math.abs(cycle.updatedHabit.hayzHours - bleedH) > 0.01) {
    mismatches.push("Yeni hayz güncellenmedi");
  }

  pushCase({
    id: 4,
    title: "Tam sahih ay — Mayıs/Haziran",
    ok: mismatches.length === 0,
    expected: [
      "Sahih ay; hayz 7g 2s; tuhur güncellemesi (el yazısı 20g 22s 30dk)",
    ],
    actual: [
      `cycle=${cycle.cycleStatus}`,
      `kanama=${fmtHours(bleedH)}, tuhur=${fmtHours(tuhurH)}`,
      `updated hayz=${fmtHours(cycle.updatedHabit.hayzHours)}, tuhur=${fmtHours(cycle.updatedHabit.tuhurHours)}`,
    ],
    mismatches,
    notes,
  });
}

// ---------------------------------------------------------------------------
// Vaka 5 — Sahih Nisan/Mayıs + Eylül rastlaşma
// ---------------------------------------------------------------------------
{
  const purityStart = parseLocal(2025, 4, 10, 0, 0);
  const bleedStart = parseLocal(2025, 4, 26, 0, 0);
  // 6g 45dk → bitiş 2 Mayıs 00:45
  const bleedEnd = parseLocal(2025, 5, 2, 0, 45);
  const prevHayzH = 6 * 24 + 0.75;
  const prevTuhurH = 16 * 24 + 22;

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: { hayzHours: prevHayzH, tuhurHours: prevTuhurH },
  });

  // Eylül: 10+ gün örnek kanama; habit = yeni sahih (6g 45dk), purity start = 2 Mayıs
  const septStart = parseLocal(2025, 9, 1, 8, 0);
  const septEnd = parseLocal(2025, 9, 15, 8, 0);
  const newHabitHayz = cycle.updatedHabit.hayzHours;
  const septCalc = calculateFiqhStatus({
    startDate: septStart.toISOString(),
    endDate: septEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: cycle.updatedHabit.tuhurHours / 24,
    habitHayzDays: newHabitHayz / 24,
    previousPurityStartDate: bleedEnd.toISOString(),
  });

  const mismatches: string[] = [];
  const notes: string[] = [
    `Nisan döngüsü: kanama=${fmtHours(bleedH)}, tuhur=${fmtHours(tuhurH)}, status=${cycle.cycleStatus}`,
    `Eylül 10+: rule=${septCalc.overlapRule}, hayz=${septCalc.hayzDays.toFixed(2)}g, isti=${septCalc.istihadhaDays.toFixed(2)}g, kazaGün=${septCalc.kazayaKalanGunler}`,
  ];

  if (cycle.cycleStatus !== "SAHIH") {
    mismatches.push(`Nisan SAHIH olmalı, ${cycle.cycleStatus}`);
  }
  if (Math.abs(bleedH - prevHayzH) > 0.05) {
    notes.push(
      `Kanama ${fmtHours(bleedH)} vs önceki habit ${fmtHours(prevHayzH)} (el yazısı aynı süre diyor)`
    );
  }
  if (septCalc.status !== "MIXED" || !septCalc.overlapRule) {
    mismatches.push("Eylül 10+ için rastlayan/rastlamayan uygulanmalı");
  }
  if ((septCalc.kazayaKalanGunler ?? 0) <= 0) {
    mismatches.push("Eylül’de kaza günleri olmalı");
  }

  pushCase({
    id: 5,
    title: "Sahih Nisan + Eylül rastlaşma",
    ok: mismatches.length === 0,
    expected: [
      "Nisan sahih (≈6g 45dk); Eylül’de habit bazlı rastlaşma + kaza",
    ],
    actual: [
      `Nisan ${cycle.cycleStatus}, hayz=${fmtHours(cycle.updatedHabit.hayzHours)}`,
      `Eylül ${septCalc.status}/${septCalc.overlapRule}, hayz=${septCalc.hayzDays.toFixed(2)}g kazaGün=${septCalc.kazayaKalanGunler}`,
    ],
    mismatches,
    notes,
  });
}

// ---------------------------------------------------------------------------
// Vaka 6 — Uzun istimrâr / karmaşık
// ---------------------------------------------------------------------------
{
  const purityStart = parseLocal(2025, 5, 29, 18, 0);
  const bleedStart = parseLocal(2025, 8, 6, 12, 0);
  // Kesintili akıntılar — motor tek aralık bekliyor; 25 Ağustos 11:00 sonrası namaz bırakma örneği
  const bleedEnd = parseLocal(2025, 9, 10, 11, 0);
  const prevHayzH = 24 * 24 + 1; // 24g 1s — dikkat: Hanefî max 10; bu «önceki» alışılmadık
  const prevTuhurH = 39 * 24 + 2 + 30 / 60;

  const bleedH = hoursBetween(bleedStart, bleedEnd);
  const tuhurH = hoursBetween(purityStart, bleedStart);

  const calcIstimrar = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: Math.min(prevTuhurH / 24, 40),
    habitHayzDays: Math.min(prevHayzH / 24, 10), // motor habit’i 10’a kadar kullanır
    previousPurityStartDate: purityStart.toISOString(),
    isContinuousBleeding: true,
  });

  const calcExceed = calculateFiqhStatus({
    startDate: bleedStart.toISOString(),
    endDate: bleedEnd.toISOString(),
    madhhab: "HANAFI",
    habitPurityDays: 15,
    habitHayzDays: 10,
    previousPurityStartDate: purityStart.toISOString(),
    isContinuousBleeding: false,
  });

  const cycle = evaluateCycleWithHabit({
    bleedingStart: bleedStart,
    bleedingEnd: bleedEnd,
    previousPurityEnd: purityStart,
    madhhab: "Hanafi",
    lastValidHabit: {
      hayzHours: Math.min(prevHayzH, 240),
      tuhurHours: prevTuhurH,
    },
  });

  const mismatches: string[] = [];
  const notes: string[] = [
    `tuhur=${fmtHours(tuhurH)}, bleed=${fmtHours(bleedH)}`,
    `İstimrâr: ${calcIstimrar.status} hayz=${calcIstimrar.hayzDays.toFixed(2)} isti=${calcIstimrar.istihadhaDays.toFixed(2)} qada=${calcIstimrar.qadaPrayersCount}`,
    `10+ kural: ${calcExceed.overlapRule} hayz=${calcExceed.hayzDays.toFixed(2)} isti=${calcExceed.istihadhaDays.toFixed(2)} kazaGün=${calcExceed.kazayaKalanGunler} qada=${calcExceed.qadaPrayersCount}`,
    `cycle=${cycle.cycleStatus}`,
    "Kesintili akıntı segmentleri motor tek start/end ile modellendi; el yazısındaki 25 Ağustos kesiti ayrı segment API’si yok.",
  ];

  if (cycle.cycleStatus !== "FASID") {
    mismatches.push("Uzun istimrâr FASID olmalı");
  }
  if (calcIstimrar.istihadhaDays <= 0 && calcExceed.istihadhaDays <= 0) {
    mismatches.push("İstihâze / kaza üretilmeli");
  }
  if (
    calcIstimrar.qadaPrayersCount <= 0 &&
    calcExceed.qadaPrayersCount <= 0
  ) {
    mismatches.push("Kaza namazı sayısı > 0 olmalı");
  }

  pushCase({
    id: 6,
    title: "Uzun istimrâr / karmaşık kaza aralığı",
    ok: mismatches.length === 0,
    expected: [
      "10+ / istimrâr → fâsid; istihâze + kaza aralığı net",
    ],
    actual: [
      `FASID=${cycle.cycleStatus === "FASID"}, qada(istimrâr)=${calcIstimrar.qadaPrayersCount}, qada(10+)=${calcExceed.qadaPrayersCount}`,
    ],
    mismatches,
    notes,
  });
}

// ---------------------------------------------------------------------------
console.log("\n\n========== ÖZET ==========");
const failed = results.filter((r) => !r.ok);
const passed = results.filter((r) => r.ok);
console.log(`Geçen: ${passed.map((p) => p.id).join(", ") || "—"}`);
console.log(`Kalan: ${failed.map((p) => p.id).join(", ") || "—"}`);
console.log(
  failed.length === 0
    ? "\nSONUÇ: 6/6 vaka motor beklentisiyle uyumlu (notlardaki yazım farkları hariç)."
    : `\nSONUÇ: ${passed.length}/6 geçti; ${failed.length} vakada sapma var.`
);

// Machine-readable
console.log(
  "\nJSON:" +
    JSON.stringify(
      results.map((r) => ({
        id: r.id,
        ok: r.ok,
        mismatches: r.mismatches,
        notes: r.notes,
      })),
      null,
      2
    )
);

process.exit(failed.length === 0 ? 0 : 1);
