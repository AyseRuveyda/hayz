"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enGB, tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DailyLogModal, type DailyLogDraft } from "@/components/calendar/DailyLogModal";
import { PredictionBanner } from "@/components/calendar/PredictionBanner";
import { buildCalendarMap, colorForKind } from "@/lib/calendar-map";
import { useI18n } from "@/lib/i18n";
import { buildPrediction } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import { FIQH_COLORS, type CycleRecord, type DailySpottingLog } from "@/types/cycle";

type Props = {
  cycles: CycleRecord[];
  spotting: DailySpottingLog[];
  habitHayzDays: number;
  habitPurityDays: number;
  onSaveLog: (draft: DailyLogDraft) => void;
};

type ViewMode = "month" | "year";

export function CycleCalendar({
  cycles,
  spotting,
  habitHayzDays,
  habitPurityDays,
  onSaveLog,
}: Props) {
  const { locale } = useI18n();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dfLocale = locale === "tr" ? tr : enGB;

  const map = useMemo(() => {
    const start =
      view === "month"
        ? startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
        : new Date(cursor.getFullYear(), 0, 1);
    const end =
      view === "month"
        ? endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
        : new Date(cursor.getFullYear(), 11, 31);
    return buildCalendarMap(cycles, spotting, start, end);
  }, [cycles, spotting, cursor, view]);

  const prediction = useMemo(
    () => buildPrediction(cycles, habitHayzDays, habitPurityDays, locale),
    [cycles, habitHayzDays, habitPurityDays, locale]
  );

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const existingLog = spotting.find((s) => s.date === selectedDate);

  return (
    <div className="space-y-4">
      <PredictionBanner prediction={prediction} />

      <div className="card-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="touch-target rounded-xl border border-rose-100/70 p-2 dark:border-[#2D222A]"
              onClick={() =>
                setCursor((c) =>
                  view === "month" ? subMonths(c, 1) : new Date(c.getFullYear() - 1, 0, 1)
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[140px] text-center text-base font-bold text-slate-900 dark:text-slate-50">
              {view === "month"
                ? format(cursor, "MMMM yyyy", { locale: dfLocale })
                : format(cursor, "yyyy")}
            </h2>
            <button
              type="button"
              className="touch-target rounded-xl border border-rose-100/70 p-2 dark:border-[#2D222A]"
              onClick={() =>
                setCursor((c) =>
                  view === "month" ? addMonths(c, 1) : new Date(c.getFullYear() + 1, 0, 1)
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex rounded-xl border border-rose-100/70 p-1 dark:border-[#2D222A]">
            {(["month", "year"] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setView(m)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  view === m
                    ? "bg-[#F42566] text-white"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                {m === "month"
                  ? locale === "tr"
                    ? "Aylık"
                    : "Month"
                  : locale === "tr"
                    ? "Yıllık"
                    : "Year"}
              </button>
            ))}
          </div>
        </div>

        <Legend locale={locale} />

        {view === "month" ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-slate-400">
              {(locale === "tr"
                ? ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"]
                : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
              ).map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const cell = map.get(key);
                const inMonth = isSameMonth(day, cursor);
                const bg =
                  cell && cell.kind !== "EMPTY"
                    ? colorForKind(cell.kind)
                    : "transparent";
                const fasid = cell?.kind === "FASID_TUHR";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={cn(
                      "touch-target relative flex min-h-[40px] flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition sm:min-h-[44px] sm:rounded-xl sm:text-xs",
                      inMonth
                        ? "border-rose-100/60 dark:border-[#2D222A]"
                        : "border-transparent opacity-40",
                      fasid && "bg-stripes"
                    )}
                    style={
                      !fasid && bg !== "transparent"
                        ? { backgroundColor: `${bg}22`, borderColor: `${bg}55` }
                        : undefined
                    }
                  >
                    <span className="text-slate-800 dark:text-slate-100">
                      {format(day, "d")}
                    </span>
                    {cell && cell.kind !== "EMPTY" && (
                      <span
                        className="mt-0.5 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: bg }}
                      />
                    )}
                    {cell?.hasSpotting && (
                      <span
                        className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            cell.spottingColor ?? FIQH_COLORS.spotting,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 12 }).map((_, monthIndex) => {
              const mStart = new Date(cursor.getFullYear(), monthIndex, 1);
              const mEnd = endOfMonth(mStart);
              const days = eachDayOfInterval({ start: mStart, end: mEnd });
              return (
                <button
                  key={monthIndex}
                  type="button"
                  className="rounded-2xl border border-rose-100/70 p-3 text-left transition hover:shadow-md dark:border-[#2D222A]"
                  onClick={() => {
                    setCursor(mStart);
                    setView("month");
                  }}
                >
                  <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                    {format(mStart, "MMM", { locale: dfLocale })}
                  </p>
                  <div className="grid grid-cols-7 gap-0.5">
                    {days.map((d) => {
                      const key = format(d, "yyyy-MM-dd");
                      const cell = map.get(key);
                      const bg =
                        cell && cell.kind !== "EMPTY"
                          ? colorForKind(cell.kind)
                          : "#e2e8f0";
                      return (
                        <span
                          key={key}
                          className="aspect-square rounded-[2px]"
                          style={{ backgroundColor: bg, opacity: cell?.kind === "EMPTY" ? 0.25 : 0.9 }}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DailyLogModal
        open={Boolean(selectedDate)}
        date={selectedDate}
        initial={
          existingLog
            ? {
                dischargeType: existingLog.dischargeType,
                kursufState: existingLog.kursufState,
                symptoms: existingLog.symptoms,
                notes: existingLog.notes ?? "",
              }
            : undefined
        }
        onClose={() => setSelectedDate(null)}
        onSave={(draft) => {
          onSaveLog(draft);
          setSelectedDate(null);
        }}
      />
    </div>
  );
}

function Legend({ locale }: { locale: "tr" | "en" }) {
  const items = [
    { color: FIQH_COLORS.hayz, tr: "Hayız", en: "Hayd" },
    { color: FIQH_COLORS.tuhr, tr: "Temizlik", en: "Purity" },
    { color: FIQH_COLORS.istihadha, tr: "İstihâze", en: "Istihadha" },
    { color: FIQH_COLORS.spotting, tr: "Leke", en: "Spotting" },
    { color: FIQH_COLORS.fasidTuhr, tr: "Fâsid temizlik", en: "Invalid purity", stripe: true },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((i) => (
        <span
          key={i.tr}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-rose-100/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-[#2D222A] dark:text-slate-300",
            i.stripe && "bg-stripes"
          )}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: i.color }}
          />
          {locale === "tr" ? i.tr : i.en}
        </span>
      ))}
    </div>
  );
}
