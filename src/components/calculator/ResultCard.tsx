"use client";

import { Bath, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { CycleTimeline } from "@/components/calculator/CycleTimeline";
import { useI18n } from "@/lib/i18n";
import { cn, formatDateTime } from "@/lib/utils";
import type { CalculationResult } from "@/types/fiqh";

type Props = {
  result: CalculationResult;
};

export function ResultCard({ result }: Props) {
  const { t, locale } = useI18n();
  const title = locale === "tr" ? result.titleTR : result.titleEN;
  const summary = locale === "tr" ? result.summaryTR : result.summaryEN;
  const details = locale === "tr" ? result.detailsTR : result.detailsEN;
  const statusLabel = t.status[result.status];

  const statusTone =
    result.status === "HAYZ"
      ? "bg-rose-50 text-[#E11D48] dark:bg-rose-950/40 dark:text-rose-300"
      : result.status === "MIXED"
        ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        : "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200";

  return (
    <section className="card-surface animate-in fade-in space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.result.title}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {summary}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusTone
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Clock3}
          label={t.result.hayz}
          value={`${result.hayzDays.toFixed(2)} ${t.result.days}`}
        />
        <Stat
          icon={Clock3}
          label={t.result.istihadha}
          value={`${result.istihadhaDays.toFixed(2)} ${t.result.days}`}
        />
        <Stat
          icon={Bath}
          label={t.result.ghusl}
          value={result.requiresGhusl ? t.result.yes : t.result.no}
        />
        <Stat
          icon={CheckCircle2}
          label={t.result.qada}
          value={String(result.qadaPrayersCount)}
        />
      </div>

      <div className="rounded-2xl border border-rose-100/70 bg-[#FDF8F7] p-4 dark:border-[#2D222A] dark:bg-[#130F12]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <CalendarClock className="h-4 w-4 text-[#F42566]" />
          {t.result.nextHayz}
        </div>
        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {formatDateTime(result.nextEarliestHayzDate, locale)}
        </p>
      </div>

      <CycleTimeline result={result} />

      <ul className="space-y-2 border-t border-rose-100/70 pt-4 dark:border-[#2D222A]">
        {details.map((line) => (
          <li
            key={line}
            className="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F42566]" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-rose-100/70 bg-white p-3 dark:border-[#2D222A] dark:bg-[#130F12]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}
