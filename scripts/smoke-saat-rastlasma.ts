/**
 * Saat-hassas rastleşme / kaza başlangıcı duman testi.
 * npx --yes tsx scripts/smoke-saat-rastlasma.ts
 */
import { calculateFiqhStatus } from "../src/lib/fiqh-engine";

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

// Vaka 6 tarzı: 22 Tem → 5 Ağu, önceki bitiş 2 Tem — RASTLAYAN + overlapHours + qada
const v6 = calculateFiqhStatus({
  startDate: "2025-07-22T11:00:00.000Z",
  endDate: "2025-08-05T19:00:00.000Z",
  madhhab: "HANAFI",
  habitHayzDays: 10,
  habitPurityDays: 20,
  previousPurityStartDate: "2025-07-02T11:00:00.000Z",
});

console.log("V6", {
  status: v6.status,
  overlapRule: v6.overlapRule,
  overlapHours: v6.overlapHours,
  overlapFmt: v6.overlapHours != null ? fmtHours(v6.overlapHours) : null,
  qadaStartAt: v6.qadaStartAt,
  hayzDays: v6.hayzDays,
  istihadhaDays: v6.istihadhaDays,
  kazayaKalanGunler: v6.kazayaKalanGunler,
});

// Kısa çakışma yolu — overlap raporu + muhtemel RASTLAMAYAN + qada = start+habit
const short = calculateFiqhStatus({
  startDate: "2025-05-19T10:00:00.000Z",
  endDate: "2025-06-01T12:30:00.000Z",
  madhhab: "HANAFI",
  habitHayzDays: 5,
  habitPurityDays: 20,
  previousPurityStartDate: "2025-04-10T12:00:00.000Z",
});

console.log("SHORT", {
  status: short.status,
  overlapRule: short.overlapRule,
  overlapHours: short.overlapHours,
  overlapFmt: short.overlapHours != null ? fmtHours(short.overlapHours) : null,
  qadaStartAt: short.qadaStartAt,
  hayzDays: short.hayzDays,
});

if (v6.overlapHours == null || v6.overlapHours <= 0) {
  console.error("FAIL: V6 overlapHours missing");
  process.exit(1);
}
if (!v6.qadaStartAt) {
  console.error("FAIL: V6 qadaStartAt missing");
  process.exit(1);
}
if (short.overlapHours == null) {
  console.error("FAIL: SHORT overlapHours missing (even if 0)");
  process.exit(1);
}
if (!short.qadaStartAt) {
  console.error("FAIL: SHORT qadaStartAt missing");
  process.exit(1);
}
console.log("OK");
