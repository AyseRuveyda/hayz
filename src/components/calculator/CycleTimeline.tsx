"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CalculationResult } from "@/types/fiqh";

type Props = {
  result: CalculationResult;
  className?: string;
};

export function CycleTimeline({ result, className }: Props) {
  const { t, locale } = useI18n();
  const hayz = Math.max(0, result.hayzDays);
  const isti = Math.max(0, result.istihadhaDays);
  const total = hayz + isti || 1;
  const hayzPct = (hayz / total) * 100;
  const istiPct = (isti / total) * 100;
  const schedule = result.daySchedule ?? [];

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {t.result.timeline}
      </p>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-[#2D222A]">
        {hayz > 0 && (
          <div
            className="bg-[#F42566] transition-all"
            style={{ width: `${hayzPct}%` }}
            title={`${t.result.hayz}: ${hayz.toFixed(2)}`}
          />
        )}
        {isti > 0 && (
          <div
            className="bg-[#F9A8D4] transition-all"
            style={{ width: `${istiPct}%` }}
            title={`${t.result.istihadha}: ${isti.toFixed(2)}`}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F42566]" />
          {t.result.hayz}: {hayz.toFixed(2)} {t.result.days}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F9A8D4]" />
          {t.result.istihadha}: {isti.toFixed(2)} {t.result.days}
        </span>
        <span>
          {t.result.total}: {result.totalHours.toFixed(1)} {t.result.hours}
        </span>
        {result.overlapRule && (
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {result.overlapRule === "RASTLAYAN"
              ? locale === "tr"
                ? "Kural: Rastlayan"
                : "Rule: Overlap"
              : locale === "tr"
                ? "Kural: Rastlamayan"
                : "Rule: Non-overlap"}
          </span>
        )}
        {typeof result.kazayaKalanGunler === "number" &&
          result.kazayaKalanGunler > 0 && (
            <span className="font-medium text-amber-700 dark:text-amber-300">
              {locale === "tr"
                ? `Kaza günü: ${result.kazayaKalanGunler}`
                : `Makeup days: ${result.kazayaKalanGunler}`}
            </span>
          )}
      </div>

      {schedule.length > 0 && (
        <div className="rounded-2xl border border-rose-100/70 bg-white p-3 dark:border-[#2D222A] dark:bg-[#130F12]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {locale === "tr" ? "Gün gün çizelge" : "Day-by-day schedule"}
          </p>
          <ul className="grid max-h-56 gap-1 overflow-y-auto sm:grid-cols-2">
            {schedule.map((row) => (
              <li
                key={row.date}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs"
                style={{
                  backgroundColor:
                    row.kind === "HAYZ" ? "#F4256614" : "#F9A8D433",
                }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {row.date}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    row.kind === "HAYZ"
                      ? "bg-[#F42566] text-white"
                      : "bg-[#F9A8D4] text-[#9D174D]"
                  )}
                >
                  {locale === "tr" ? row.labelTR : row.labelEN}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
