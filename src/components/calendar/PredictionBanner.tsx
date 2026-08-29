"use client";

import { useI18n } from "@/lib/i18n";
import type { CyclePrediction } from "@/types/cycle";
import { CalendarClock, ShieldCheck } from "lucide-react";

export function PredictionBanner({
  prediction,
}: {
  prediction: CyclePrediction | null;
}) {
  const { locale } = useI18n();
  if (!prediction) return null;

  return (
    <div className="card-surface overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-4 dark:from-emerald-950/40 dark:to-sky-950/30 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {locale === "tr" ? "Tahmin & İstatistik" : "Prediction & Stats"}
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {locale === "tr" ? prediction.messageTR : prediction.messageEN}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 dark:bg-[#1C161B]/80">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {locale === "tr" ? "Ort. hayız" : "Avg hayd"}:{" "}
                {prediction.averageHayzDays}{" "}
                {locale === "tr" ? "gün" : "d"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 dark:bg-[#1C161B]/80">
                {locale === "tr" ? "Ort. temizlik" : "Avg purity"}:{" "}
                {prediction.averagePurityDays}{" "}
                {locale === "tr" ? "gün" : "d"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 dark:bg-[#1C161B]/80">
                {locale === "tr" ? "Yeni hayız" : "Next hayd"}:{" "}
                {prediction.daysUntilNextHayz}{" "}
                {locale === "tr" ? "gün sonra" : "days"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
