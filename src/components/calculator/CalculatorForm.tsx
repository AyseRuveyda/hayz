"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, HelpCircle, Info, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ResultCard } from "@/components/calculator/ResultCard";
import { useChatDrawer } from "@/components/chat/ChatContext";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { saveCycle, saveQada } from "@/lib/data-sync";
import { calculateFiqhStatus } from "@/lib/fiqh-engine";
import { useI18n } from "@/lib/i18n";
import { uid } from "@/lib/local-store";
import {
  dateTimePartsToIso,
  defaultDateTimeParts,
  type DateTimeParts,
} from "@/lib/utils";
import type { CalculationResult, Madhhab } from "@/types/fiqh";

const MADHHABS: Madhhab[] = [
  "HANAFI",
  "MALIKI",
  "HANAFI_FOLLOWING_MALIKI",
  "HANBALI",
];

function defaultStart(): DateTimeParts {
  return defaultDateTimeParts(7, 8, 0);
}

function defaultEnd(): DateTimeParts {
  return defaultDateTimeParts(0, 8, 0);
}

export function CalculatorForm() {
  const { t, locale } = useI18n();
  const { openChat } = useChatDrawer();
  const searchParams = useSearchParams();

  const initialMadhhab = useMemo(() => {
    const q = searchParams.get("madhhab");
    if (
      q === "MALIKI" ||
      q === "HANAFI" ||
      q === "HANAFI_FOLLOWING_MALIKI" ||
      q === "HANBALI"
    ) {
      return q;
    }
    return "HANAFI" as Madhhab;
  }, [searchParams]);

  const [startParts, setStartParts] = useState<DateTimeParts>(defaultStart);
  const [endParts, setEndParts] = useState<DateTimeParts>(defaultEnd);
  const [madhhab, setMadhhab] = useState<Madhhab>(initialMadhhab);
  const [malikiMaxDays, setMalikiMaxDays] = useState(15);
  const [habitPurityDays, setHabitPurityDays] = useState(15);
  const [habitHayzDays, setHabitHayzDays] = useState(7);
  const [isContinuousBleeding, setIsContinuousBleeding] = useState(false);
  const [isFirstPeriod, setIsFirstPeriod] = useState(false);
  const [habitCycleStartDay, setHabitCycleStartDay] = useState<number | "">("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMadhhab(initialMadhhab);
  }, [initialMadhhab]);

  const malikiControlsEnabled =
    madhhab === "MALIKI" || madhhab === "HANAFI_FOLLOWING_MALIKI";

  function madhhabLabel(value: Madhhab) {
    if (value === "HANAFI") return locale === "tr" ? "Hanefi" : "Hanafi";
    if (value === "MALIKI") return "Maliki";
    if (value === "HANBALI") return locale === "tr" ? "Hanbelî" : "Hanbali";
    return locale === "tr"
      ? "Hanefi (Maliki taklidi)"
      : "Hanafi (following Maliki)";
  }

  function handleClear() {
    setStartParts(defaultStart());
    setEndParts(defaultEnd());
    setMadhhab("HANAFI");
    setMalikiMaxDays(15);
    setHabitPurityDays(15);
    setHabitHayzDays(7);
    setIsContinuousBleeding(false);
    setIsFirstPeriod(false);
    setHabitCycleStartDay("");
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const startIso = dateTimePartsToIso(startParts);
      const endIso = dateTimePartsToIso(endParts);
      const next = calculateFiqhStatus({
        startDate: startIso,
        endDate: endIso,
        madhhab,
        habitPurityDays,
        habitHayzDays,
        malikiMaxDays: malikiControlsEnabled ? malikiMaxDays : undefined,
        isContinuousBleeding,
        isFirstPeriod: isFirstPeriod || undefined,
        habitCycleStartDay:
          habitCycleStartDay !== "" ? Number(habitCycleStartDay) : undefined,
      });
      setResult(next);

      const now = new Date().toISOString();
      const cycleId = uid();
      await saveCycle({
        id: cycleId,
        startDate: startIso,
        endDate: endIso,
        madhhab,
        status: next.status,
        hayzDays: next.hayzDays,
        istihadhaDays: next.istihadhaDays,
        purityDays: habitPurityDays,
        requiresGhusl: next.requiresGhusl,
        qadaPrayersCount: next.qadaPrayersCount,
        nextEarliestHayzDate: next.nextEarliestHayzDate,
        summaryTR: next.summaryTR,
        summaryEN: next.summaryEN,
        isContinuousBleeding,
        createdAt: now,
        updatedAt: now,
      });

      if (next.qadaPrayersCount > 0) {
        await saveQada({
          id: uid(),
          kind: "PRAYER",
          remaining: next.qadaPrayersCount,
          total: next.qadaPrayersCount,
          source: "calculator_auto",
          relatedCycleId: cycleId,
          noteTR: `Hesaplamadan otomatik: ${next.istihadhaDays.toFixed(2)} istihâze günü`,
          noteEN: `Auto from calculator: ${next.istihadhaDays.toFixed(2)} istihadha days`,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Hesaplama hatası");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <form onSubmit={handleSubmit} className="card-surface space-y-5 p-5 sm:p-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">
              {t.calculator.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.calculator.subtitle}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DateTimeField
              idPrefix="start"
              label={t.calculator.startDate}
              value={startParts}
              onChange={setStartParts}
              timeHint={
                locale === "tr"
                  ? "24 saat biçimi (ör. 14:30)"
                  : "24-hour format (e.g. 14:30)"
              }
            />
            <DateTimeField
              idPrefix="end"
              label={t.calculator.endDate}
              value={endParts}
              onChange={setEndParts}
              timeHint={
                locale === "tr"
                  ? "24 saat biçimi (ör. 14:30)"
                  : "24-hour format (e.g. 14:30)"
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="madhhab">
                {t.calculator.madhhab}
              </label>
              <select
                id="madhhab"
                className="input-field"
                value={madhhab}
                onChange={(e) => setMadhhab(e.target.value as Madhhab)}
              >
                {MADHHABS.map((m) => (
                  <option key={m} value={m}>
                    {madhhabLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field" htmlFor="malikiMaxDays">
                {t.calculator.maxHayzDays}
              </label>
              <input
                id="malikiMaxDays"
                type="number"
                min={1}
                max={30}
                className="input-field"
                value={malikiMaxDays}
                disabled={!malikiControlsEnabled}
                onChange={(e) => setMalikiMaxDays(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-slate-400">
                {malikiControlsEnabled
                  ? t.calculator.maxHayzHint
                  : t.calculator.maxHayzDisabled}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100/70 bg-[#FDF8F7] p-4 dark:border-[#2D222A] dark:bg-[#130F12]">
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t.calculator.habitSection}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field" htmlFor="habitPurityDays">
                  {t.calculator.habitPurity}
                </label>
                <input
                  id="habitPurityDays"
                  type="number"
                  min={1}
                  className="input-field"
                  value={habitPurityDays}
                  onChange={(e) => setHabitPurityDays(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label-field" htmlFor="habitHayzDays">
                  {t.calculator.habitHayz}
                </label>
                <input
                  id="habitHayzDays"
                  type="number"
                  min={1}
                  className="input-field"
                  value={habitHayzDays}
                  onChange={(e) => setHabitHayzDays(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-100/70 bg-white px-3 py-2.5 text-sm dark:border-[#2D222A] dark:bg-[#130F12]">
              <input
                type="checkbox"
                checked={isContinuousBleeding}
                onChange={(e) => setIsContinuousBleeding(e.target.checked)}
                className="h-4 w-4 rounded border-rose-200 text-[#F42566] focus:ring-[#F42566]/30"
              />
              {t.calculator.istimrar}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-100/70 bg-white px-3 py-2.5 text-sm dark:border-[#2D222A] dark:bg-[#130F12]">
              <input
                type="checkbox"
                checked={isFirstPeriod}
                onChange={(e) => setIsFirstPeriod(e.target.checked)}
                className="h-4 w-4 rounded border-rose-200 text-[#F42566] focus:ring-[#F42566]/30"
              />
              {t.calculator.firstPeriod}
            </label>
          </div>

          <div>
            <label className="label-field" htmlFor="habitCycleStartDay">
              {t.calculator.habitCycleStartDay}
            </label>
            <input
              id="habitCycleStartDay"
              type="number"
              min={1}
              max={31}
              className="input-field"
              value={habitCycleStartDay}
              placeholder="—"
              onChange={(e) =>
                setHabitCycleStartDay(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
            <p className="mt-1 text-xs text-slate-400">
              {t.calculator.habitCycleStartDayHint}
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary min-w-[140px]">
              {t.calculator.submit}
            </button>
            <button type="button" className="btn-ghost" onClick={handleClear}>
              {t.calculator.clear}
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-[#F0FDF4] p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="mb-2 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Info className="h-4 w-4" />
              <h2 className="text-sm font-bold">{t.calculator.reminderTitle}</h2>
            </div>
            <p className="text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
              {t.calculator.reminderBody}
            </p>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="bg-gradient-to-br from-[#F0F9FF] to-white p-5 dark:from-sky-950/40 dark:to-[#1C161B]">
              <div className="mb-2 flex items-center gap-2 text-sky-800 dark:text-sky-200">
                <Lightbulb className="h-4 w-4" />
                <h2 className="text-sm font-bold">{t.calculator.guideTitle}</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t.calculator.guideBody}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-rose-100/70 p-3 dark:border-[#2D222A]">
              <Link href="/bilgiler" className="btn-ghost justify-center">
                <BookOpen className="h-4 w-4" />
                {t.calculator.quickIlmihal}
              </Link>
              <button
                type="button"
                className="btn-primary justify-center"
                onClick={openChat}
              >
                <HelpCircle className="h-4 w-4" />
                {t.calculator.quickAsk}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {result && (
        <div id="sonuc">
          <ResultCard result={result} />
        </div>
      )}

      <div id="gecmis" className="card-surface p-5 text-sm text-slate-500 dark:text-slate-400">
        {locale === "tr" ? (
          <>
            Geçmiş kayıtlarınız{" "}
            <Link href="/takvim" className="font-medium text-[#E11D48] underline">
              Takvim
            </Link>{" "}
            ve{" "}
            <Link href="/kaza" className="font-medium text-[#E11D48] underline">
              Kaza
            </Link>{" "}
            sayfalarında görüntülenir.
          </>
        ) : (
          <>
            Your history is available on the{" "}
            <Link href="/takvim" className="font-medium text-[#E11D48] underline">
              Calendar
            </Link>{" "}
            and{" "}
            <Link href="/kaza" className="font-medium text-[#E11D48] underline">
              Qada
            </Link>{" "}
            pages.
          </>
        )}
      </div>
    </div>
  );
}
