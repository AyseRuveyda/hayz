"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDown, Bell, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { CycleCalendar } from "@/components/calendar/CycleCalendar";
import type { DailyLogDraft } from "@/components/calendar/DailyLogModal";
import { loadCycles, loadSpotting, saveSpotting } from "@/lib/data-sync";
import { getGuestProfile, uid } from "@/lib/local-store";
import { useI18n } from "@/lib/i18n";
import { downloadCyclePdfReport } from "@/lib/pdf-report";
import { requestNotificationPermission } from "@/lib/notifications";
import { loadQada } from "@/lib/data-sync";
import { cn } from "@/lib/utils";
import type { CycleRecord, DailySpottingLog } from "@/types/cycle";

export default function TakvimPage() {
  const { locale } = useI18n();
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [spotting, setSpotting] = useState<DailySpottingLog[]>([]);
  const profile = getGuestProfile();

  const refresh = useCallback(async () => {
    setCycles(await loadCycles());
    setSpotting(await loadSpotting());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSaveLog(draft: DailyLogDraft) {
    const existing = spotting.find((s) => s.date === draft.date);
    const now = new Date().toISOString();
    await saveSpotting({
      id: existing?.id ?? uid(),
      date: draft.date,
      dischargeType: draft.dischargeType,
      kursufState: draft.kursufState,
      symptoms: draft.symptoms,
      notes: draft.notes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await refresh();
  }

  async function handlePdf(months: 6 | 12) {
    const qada = await loadQada();
    await downloadCyclePdfReport(cycles, spotting, qada, {
      months,
      locale,
      profileName: profile.displayName ?? "Misafir",
      madhhab: profile.madhhab,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {locale === "tr" ? "Akıllı Döngü Takvimi" : "Smart Cycle Calendar"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "tr"
              ? "Renk kodlu hayız, temizlik, istihâze ve leke takibi."
              : "Color-coded hayd, purity, istihadha and spotting."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
          <button
            type="button"
            className="btn-ghost touch-target flex-1 sm:flex-none"
            onClick={() => void requestNotificationPermission()}
          >
            <Bell className="h-4 w-4" />
            <span className="truncate">{locale === "tr" ? "Bildirimler" : "Notify"}</span>
          </button>
          <button
            type="button"
            className="btn-ghost touch-target flex-1 sm:flex-none"
            onClick={() => void handlePdf(6)}
          >
            <FileDown className="h-4 w-4" />
            PDF 6{locale === "tr" ? " ay" : "m"}
          </button>
          <button
            type="button"
            className="btn-primary touch-target flex-1 sm:flex-none"
            onClick={() => void handlePdf(12)}
          >
            <FileDown className="h-4 w-4" />
            PDF 12{locale === "tr" ? " ay" : "m"}
          </button>
        </div>
      </div>

      <CycleCalendar
        cycles={cycles}
        spotting={spotting}
        habitHayzDays={profile.habitHayzDays}
        habitPurityDays={profile.habitPurityDays}
        onSaveLog={(d) => void handleSaveLog(d)}
      />

      <CycleHistoryPanel cycles={cycles} locale={locale} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Döngü geçmişi + Sahih/Fâsid ay paneli
// ---------------------------------------------------------------------------

function badgeClasses(color: "green" | "amber" | "rose" | undefined) {
  if (color === "green")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40";
  if (color === "amber")
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40";
  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40";
}

function CycleHistoryPanel({
  cycles,
  locale,
}: {
  cycles: CycleRecord[];
  locale: "tr" | "en";
}) {
  const [open, setOpen] = useState(true);

  const sorted = [...cycles].sort((a, b) =>
    b.startDate.localeCompare(a.startDate)
  );

  if (sorted.length === 0) return null;

  const sahihCount = sorted.filter((c) => c.isSahihMonth === true).length;
  const fasidCount = sorted.filter((c) => c.isSahihMonth === false).length;

  return (
    <section className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {locale === "tr" ? "Döngü Sıhhati Geçmişi" : "Cycle Validity History"}
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {locale === "tr" ? `${sahihCount} sahih` : `${sahihCount} valid`}
          </span>
          {fasidCount > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              {locale === "tr" ? `${fasidCount} fâsid` : `${fasidCount} irregular`}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-rose-100/70 dark:divide-[#2D222A]">
          {sorted.map((cycle) => (
            <CycleRow key={cycle.id} cycle={cycle} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

function CycleRow({
  cycle,
  locale,
}: {
  cycle: CycleRecord;
  locale: "tr" | "en";
}) {
  const [expanded, setExpanded] = useState(false);

  const isSahih = cycle.isSahihMonth;
  const badgeColor = cycle.sahihMonthBadgeColor ?? (isSahih ? "green" : isSahih === false ? "rose" : undefined);
  const hasStatus = cycle.cycleStatus != null;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const statusLabel = hasStatus
    ? cycle.cycleStatus === "SAHIH"
      ? locale === "tr"
        ? "Sahih Ay"
        : "Valid Month"
      : locale === "tr"
        ? "Fâsid Ay"
        : "Irregular Month"
    : locale === "tr"
      ? "Belirsiz"
      : "Unknown";

  const Icon = !hasStatus
    ? AlertCircle
    : isSahih
      ? CheckCircle2
      : XCircle;

  return (
    <div className="px-4 py-3 sm:px-5">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              !hasStatus
                ? "text-slate-400"
                : isSahih
                  ? "text-emerald-500"
                  : "text-rose-500"
            )}
          />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {fmtDate(cycle.startDate)}
            {" – "}
            {fmtDate(cycle.endDate)}
          </span>
          {hasStatus && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                badgeClasses(badgeColor)
              )}
            >
              {statusLabel}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
          <span>
            {locale === "tr"
              ? `${cycle.hayzDays.toFixed(1)} gün hayız`
              : `${cycle.hayzDays.toFixed(1)}d hayd`}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 rounded-xl border border-rose-100/60 bg-[#FDF8F7] p-3 text-xs text-slate-600 dark:border-[#2D222A] dark:bg-[#130F12] dark:text-slate-300">
          <Row
            label={locale === "tr" ? "Kanama" : "Bleeding"}
            value={`${(cycle.bleedingDays ?? cycle.hayzDays + cycle.istihadhaDays).toFixed(2)} ${locale === "tr" ? "gün" : "days"}`}
          />
          <Row
            label={locale === "tr" ? "Hayız" : "Hayd"}
            value={`${cycle.hayzDays.toFixed(2)} ${locale === "tr" ? "gün" : "days"}`}
          />
          {cycle.istihadhaDays > 0 && (
            <Row
              label={locale === "tr" ? "İstihâze" : "Istihadha"}
              value={`${cycle.istihadhaDays.toFixed(2)} ${locale === "tr" ? "gün" : "days"}`}
            />
          )}
          {cycle.purityDays != null && (
            <Row
              label={locale === "tr" ? "Önceki temizlik" : "Prev. purity"}
              value={`${cycle.purityDays} ${locale === "tr" ? "gün" : "days"}`}
            />
          )}
          <Row
            label={locale === "tr" ? "Mezhep" : "Madhhab"}
            value={cycle.madhhab}
          />
          {cycle.sahihMonthExplanation && (
            <p className="mt-1 rounded-lg border border-rose-100/60 bg-white px-3 py-2 italic dark:border-[#2D222A] dark:bg-[#1C161B]">
              {cycle.sahihMonthExplanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}
