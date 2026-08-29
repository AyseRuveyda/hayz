import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CycleRecord, DailySpottingLog, QadaItem } from "@/types/cycle";

type ReportOptions = {
  months: 6 | 12;
  locale?: "tr" | "en";
  profileName?: string;
  madhhab?: string;
};

function withinMonths(iso: string, months: number): boolean {
  const d = new Date(iso);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d >= cutoff;
}

function fmt(iso: string, locale: "tr" | "en") {
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Özel Günler Defteri — müftülük / hoca danışmasına uygun PDF.
 */
export async function downloadCyclePdfReport(
  cycles: CycleRecord[],
  spotting: DailySpottingLog[],
  qada: QadaItem[],
  options: ReportOptions
) {
  const locale = options.locale ?? "tr";
  const months = options.months;
  const filteredCycles = cycles.filter((c) => withinMonths(c.startDate, months));
  const filteredSpotting = spotting.filter((s) => withinMonths(s.date, months));

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const title =
    locale === "tr"
      ? "Özel Günler Defteri — Fıkhi Döngü Raporu"
      : "Private Days Ledger — Fiqh Cycle Report";

  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    locale === "tr"
      ? `Dönem: Son ${months} ay | Kişi: ${options.profileName ?? "—"} | Mezhep: ${options.madhhab ?? "—"}`
      : `Period: Last ${months} months | Person: ${options.profileName ?? "—"} | Madhhab: ${options.madhhab ?? "—"}`,
    14,
    26
  );
  doc.text(
    locale === "tr"
      ? "Kaynak çerçeve: Seâdet-i Ebediyye, İslâm Ahlâkı, Dürr-i Yektâ, Mesâil-i Şerh-i Vikâye"
      : "Reference frame: classical Hanafi/Maliki manuals (educational summary)",
    14,
    32
  );

  autoTable(doc, {
    startY: 38,
    head: [
      locale === "tr"
        ? ["Başlangıç", "Bitiş", "Durum", "Hayız", "İstihâze", "Kaza", "Gusül"]
        : ["Start", "End", "Status", "Hayd", "Istihadha", "Qada", "Ghusl"],
    ],
    body: filteredCycles.map((c) => [
      fmt(c.startDate, locale),
      fmt(c.endDate, locale),
      c.status,
      c.hayzDays.toFixed(2),
      c.istihadhaDays.toFixed(2),
      String(c.qadaPrayersCount),
      c.requiresGhusl ? (locale === "tr" ? "Evet" : "Yes") : locale === "tr" ? "Hayır" : "No",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [244, 37, 102] },
  });

  const afterCycles =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 50;

  doc.setFontSize(12);
  doc.setTextColor(15);
  doc.text(
    locale === "tr" ? "Leke / Kürsüf Kayıtları" : "Spotting / Kursuf Logs",
    14,
    afterCycles + 10
  );

  autoTable(doc, {
    startY: afterCycles + 14,
    head: [
      locale === "tr"
        ? ["Tarih", "Akıntı", "Kürsüf", "Belirtiler", "Not"]
        : ["Date", "Discharge", "Kursuf", "Symptoms", "Note"],
    ],
    body: filteredSpotting.map((s) => [
      s.date,
      s.dischargeType,
      s.kursufState,
      s.symptoms.join(", ") || "—",
      s.notes ?? "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [133, 77, 14] },
  });

  const afterSpot =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? afterCycles + 40;

  doc.setFontSize(12);
  doc.text(
    locale === "tr" ? "Kaza Özeti" : "Qada Summary",
    14,
    afterSpot + 10
  );

  autoTable(doc, {
    startY: afterSpot + 14,
    head: [
      locale === "tr"
        ? ["Tür", "Kalan", "Toplam", "Kaynak"]
        : ["Kind", "Remaining", "Total", "Source"],
    ],
    body: qada.map((q) => [
      q.kind,
      String(q.remaining),
      String(q.total),
      q.source,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    locale === "tr"
      ? "Bu rapor bilgilendirme amaçlıdır; kesin hüküm için ehil bir âlime / müftülüğe danışınız."
      : "This report is informational only; consult a qualified scholar for definitive rulings.",
    14,
    pageH - 12
  );

  doc.save(
    locale === "tr"
      ? `ozel-gunler-defteri-${months}ay.pdf`
      : `private-days-ledger-${months}m.pdf`
  );
}
