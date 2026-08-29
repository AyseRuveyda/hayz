"use client";

import { Check, FastForward, Moon, Sunrise } from "lucide-react";
import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CycleRecord, QadaItem } from "@/types/cycle";

type Props = {
  items: QadaItem[];
  cycles: CycleRecord[];
  onDecrement: (id: string) => void;
  onAddFromCycle?: (cycle: CycleRecord) => void;
};

export function QadaTracker({ items, cycles, onDecrement, onAddFromCycle }: Props) {
  const { locale } = useI18n();

  const prayerTotal = useMemo(
    () => items.filter((i) => i.kind === "PRAYER").reduce((s, i) => s + i.remaining, 0),
    [items]
  );
  const fastTotal = useMemo(
    () => items.filter((i) => i.kind === "FAST").reduce((s, i) => s + i.remaining, 0),
    [items]
  );

  const latestMixed = cycles.find(
    (c) => c.istihadhaDays > 0 || c.qadaPrayersCount > 0
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon={Moon}
          label={locale === "tr" ? "Kaza namazı" : "Makeup prayers"}
          value={prayerTotal}
          accent="rose"
        />
        <SummaryCard
          icon={Sunrise}
          label={locale === "tr" ? "Kaza orucu" : "Makeup fasts"}
          value={fastTotal}
          accent="emerald"
        />
      </div>

      {latestMixed && onAddFromCycle && (
        <button
          type="button"
          className="btn-ghost w-full justify-between touch-target"
          onClick={() => onAddFromCycle(latestMixed)}
        >
          <span className="inline-flex items-center gap-2 text-left">
            <FastForward className="h-4 w-4 text-[#F42566]" />
            {locale === "tr"
              ? `Son döngüden kaza ekle (${latestMixed.qadaPrayersCount} vakit)`
              : `Add qada from last cycle (${latestMixed.qadaPrayersCount})`}
          </span>
        </button>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="card-surface p-6 text-center text-sm text-slate-500">
            {locale === "tr"
              ? "Henüz kaza kaydı yok. İstihâze içeren bir hesaplama kaydedildiğinde otomatik eklenebilir."
              : "No qada yet. Items can be added automatically from istihadha calculations."}
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="card-surface flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {item.kind === "PRAYER"
                    ? locale === "tr"
                      ? "Namaz"
                      : "Prayer"
                    : locale === "tr"
                      ? "Oruç"
                      : "Fast"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {locale === "tr" ? item.noteTR : item.noteEN} · {item.source}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {item.remaining} / {item.total}{" "}
                  {locale === "tr" ? "kalan" : "left"}
                </p>
              </div>
              <button
                type="button"
                disabled={item.remaining <= 0}
                onClick={() => onDecrement(item.id)}
                className={cn(
                  "touch-target inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
                )}
              >
                <Check className="h-4 w-4" />
                −1
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: "rose" | "emerald";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        accent === "rose"
          ? "border-rose-100 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/30"
          : "border-emerald-100 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/30"
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
