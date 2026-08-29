"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CalculationResult } from "@/types/fiqh";

type Props = {
  result: CalculationResult;
  className?: string;
};

export function CycleTimeline({ result, className }: Props) {
  const { t } = useI18n();
  const hayz = Math.max(0, result.hayzDays);
  const isti = Math.max(0, result.istihadhaDays);
  const total = hayz + isti || 1;
  const hayzPct = (hayz / total) * 100;
  const istiPct = (isti / total) * 100;

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
            className="bg-sky-400 transition-all"
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
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          {t.result.istihadha}: {isti.toFixed(2)} {t.result.days}
        </span>
        <span>
          {t.result.total}: {result.totalHours.toFixed(1)} {t.result.hours}
        </span>
      </div>
    </div>
  );
}
