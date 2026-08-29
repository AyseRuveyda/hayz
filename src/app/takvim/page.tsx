"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDown, Bell } from "lucide-react";
import { CycleCalendar } from "@/components/calendar/CycleCalendar";
import type { DailyLogDraft } from "@/components/calendar/DailyLogModal";
import { loadCycles, loadSpotting, saveSpotting } from "@/lib/data-sync";
import { getGuestProfile, uid } from "@/lib/local-store";
import { useI18n } from "@/lib/i18n";
import { downloadCyclePdfReport } from "@/lib/pdf-report";
import { requestNotificationPermission } from "@/lib/notifications";
import { loadQada } from "@/lib/data-sync";
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
    </div>
  );
}
