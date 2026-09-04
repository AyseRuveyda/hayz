"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, HelpCircle, Info, Lightbulb, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ComparisonRuler } from "@/components/calculator/ComparisonRuler";
import { ResultCard } from "@/components/calculator/ResultCard";
import { useChatDrawer } from "@/components/chat/ChatContext";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { buildComparisonChart } from "@/lib/comparison-chart";
import { saveCycle, saveQada } from "@/lib/data-sync";
import { analyzeSahihAy, calculateFiqhStatus, evaluateCycleWithHabit } from "@/lib/fiqh-engine";
import { evaluateHabitChange } from "@/lib/habit-change";
import { useI18n } from "@/lib/i18n";
import { getGuestProfile, saveGuestProfile, uid } from "@/lib/local-store";
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
];

function normalizeSelectableMadhhab(value: string | null | undefined): Madhhab {
  if (value === "MALIKI" || value === "HANAFI_FOLLOWING_MALIKI") return value;
  return "HANAFI";
}

function defaultPurityStart(): DateTimeParts {
  return defaultDateTimeParts(22, 8, 0); // ~22 gün önce (15+ gün temizlik)
}

function defaultStart(): DateTimeParts {
  return defaultDateTimeParts(7, 8, 0);
}

function defaultEnd(): DateTimeParts {
  return defaultDateTimeParts(0, 8, 0);
}

function defaultPrevHayzStart(): DateTimeParts {
  return defaultDateTimeParts(29, 8, 0); // ~7 gün hayz + temizlik başlangıcından önce
}

function hoursBetweenParts(a: DateTimeParts, b: DateTimeParts): number {
  try {
    const start = new Date(dateTimePartsToIso(a)).getTime();
    const end = new Date(dateTimePartsToIso(b)).getTime();
    return Math.max(0, (end - start) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
}

function formatDurationHint(hours: number, locale: "tr" | "en"): string {
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  if (locale === "tr") {
    if (days === 0) return `${rem} saat`;
    if (rem === 0) return `${days} gün`;
    return `${days} gün ${rem} saat`;
  }
  if (days === 0) return `${rem}h`;
  if (rem === 0) return `${days}d`;
  return `${days}d ${rem}h`;
}

export function CalculatorForm() {
  const { t, locale } = useI18n();
  const { openChat } = useChatDrawer();
  const searchParams = useSearchParams();

  const initialMadhhab = useMemo(() => {
    const q = searchParams.get("madhhab");
    if (q === "MALIKI" || q === "HANAFI" || q === "HANAFI_FOLLOWING_MALIKI") {
      return q as Madhhab;
    }
    // Profil tercihi (Hanbelî kayıtlıysa Hanefi’ye düş)
    return normalizeSelectableMadhhab(getGuestProfile().madhhab);
  }, [searchParams]);

  // Form state
  const [purityStartParts, setPurityStartParts] = useState<DateTimeParts>(defaultPurityStart);
  const [startParts, setStartParts] = useState<DateTimeParts>(defaultStart);
  const [endParts, setEndParts] = useState<DateTimeParts>(defaultEnd);
  const [madhhab, setMadhhab] = useState<Madhhab>(initialMadhhab);
  const [malikiMaxDays, setMalikiMaxDays] = useState(() => {
    const p = getGuestProfile();
    return Math.max(1, p.malikiMaxDays ?? 15);
  });
  const [isContinuousBleeding, setIsContinuousBleeding] = useState(false);
  const [isFirstPeriod, setIsFirstPeriod] = useState(false);

  // Son sahih ay — DateTime (saat/dakika hassas)
  const [prevHayzStartParts, setPrevHayzStartParts] =
    useState<DateTimeParts>(defaultPrevHayzStart);
  const [prevHayzEndParts, setPrevHayzEndParts] =
    useState<DateTimeParts>(defaultPurityStart);
  /** Son sahih ay temizlik başlangıcı (bitiş değil — bitiş = kanama başlangıcı). */
  const [prevTuhurStartParts, setPrevTuhurStartParts] =
    useState<DateTimeParts>(defaultPurityStart);

  // Eski âdet günleri (DateTime'dan türetilir; motor hâlâ gün/saat kullanır)
  const [habitPurityDays, setHabitPurityDays] = useState(15);
  const [habitHayzDays, setHabitHayzDays] = useState(7);

  // Sonuç state
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isSahih, setIsSahih] = useState<boolean | null>(null);
  const [cycleExplanation, setCycleExplanation] = useState<string>("");
  const [habitNotice, setHabitNotice] = useState<string | null>(null);
  const [showHabitAccordion, setShowHabitAccordion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMadhhab(initialMadhhab);
  }, [initialMadhhab]);

  // Mâlikî için max kontrolü sadece Maliki/taklidinde aktif
  const malikiControlsEnabled =
    madhhab === "MALIKI" || madhhab === "HANAFI_FOLLOWING_MALIKI";

  /** Hanefî + kanama > 10 gün (240 saat) → rastlama / fâsid modu */
  const hanafiExceedsTenDays = useMemo(() => {
    if (madhhab !== "HANAFI" && madhhab !== "HANAFI_FOLLOWING_MALIKI") {
      return false;
    }
    try {
      const startIso = dateTimePartsToIso(startParts);
      const endIso = dateTimePartsToIso(endParts);
      const hours =
        (new Date(endIso).getTime() - new Date(startIso).getTime()) /
        (1000 * 60 * 60);
      // Saf Hanefî: 240 saat. Taklitte de 10 günü aşınca âdet verisi gerekir.
      return hours > 240;
    } catch {
      return false;
    }
  }, [madhhab, startParts, endParts]);

  useEffect(() => {
    if (hanafiExceedsTenDays) {
      setShowHabitAccordion(true);
    }
  }, [hanafiExceedsTenDays]);

  // Son sahih DateTime → habit günleri (saat hassasiyeti)
  useEffect(() => {
    if (!(hanafiExceedsTenDays || showHabitAccordion)) return;
    const hayzH = hoursBetweenParts(prevHayzStartParts, prevHayzEndParts);
    // Sahih temizlik: temizlik başlangıcı → kanama başlangıcı (bitiş ayrıca sorulmaz)
    const tuhurH = hoursBetweenParts(prevTuhurStartParts, startParts);
    if (hayzH > 0) {
      setHabitHayzDays(Math.max(1, Math.round((hayzH / 24) * 100) / 100));
    }
    if (tuhurH > 0) {
      setHabitPurityDays(Math.max(1, Math.round((tuhurH / 24) * 100) / 100));
    }
  }, [
    hanafiExceedsTenDays,
    showHabitAccordion,
    prevHayzStartParts,
    prevHayzEndParts,
    prevTuhurStartParts,
    startParts,
  ]);

  // Ana temizlik başlangıcı ↔ son sahih hayz bitişi / temizlik başlangıcı
  useEffect(() => {
    setPrevHayzEndParts(purityStartParts);
    setPrevTuhurStartParts(purityStartParts);
  }, [purityStartParts]);

  const computedHayzHours = hoursBetweenParts(prevHayzStartParts, prevHayzEndParts);
  const computedTuhurHours = hoursBetweenParts(prevTuhurStartParts, startParts);
  const currentTuhurHours = hoursBetweenParts(purityStartParts, startParts);
  const bleedingHoursLive = hoursBetweenParts(startParts, endParts);

  function madhhabLabel(value: Madhhab) {
    if (value === "HANAFI") return locale === "tr" ? "Hanefi" : "Hanafi";
    if (value === "MALIKI") return "Maliki";
    if (value === "HANAFI_FOLLOWING_MALIKI") {
      return locale === "tr"
        ? "Hanefi (Maliki taklidi)"
        : "Hanafi (following Maliki)";
    }
    // Hanbelî UI’da seçilemez; güvenlik için Hanefi göster
    return locale === "tr" ? "Hanefi" : "Hanafi";
  }

  function handleClear() {
    setPurityStartParts(defaultPurityStart());
    setStartParts(defaultStart());
    setEndParts(defaultEnd());
    setMadhhab("HANAFI");
    setMalikiMaxDays(15);
    setIsContinuousBleeding(false);
    setIsFirstPeriod(false);
    setPrevHayzStartParts(defaultPrevHayzStart());
    setPrevHayzEndParts(defaultPurityStart());
    setPrevTuhurStartParts(defaultPurityStart());
    setHabitPurityDays(15);
    setHabitHayzDays(7);
    setResult(null);
    setIsSahih(null);
    setCycleExplanation("");
    setHabitNotice(null);
    setShowHabitAccordion(false);
    setError(null);
  }

  async function runCalculate() {
    setError(null);
    setHabitNotice(null);

    try {
      const purityStartIso = dateTimePartsToIso(purityStartParts);
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
        previousPurityStartDate: purityStartIso,
      });
      setResult(next);

      // Temizlik süresi: temizlik başlangıcından kanama başlangıcına kadar
      const purityStartDate = new Date(purityStartIso);
      const bleedingStartDate = new Date(startIso);
      const bleedingEndDate = new Date(endIso);
      const purityHours = Math.max(
        0,
        (bleedingStartDate.getTime() - purityStartDate.getTime()) / (1000 * 60 * 60)
      );
      const purityDaysExact = purityHours / 24;

      // evaluateCycleWithHabit — hassas Date bazlı analiz
      const cycleMadhhab: "Hanafi" | "Maliki" = madhhab === "MALIKI" ? "Maliki" : "Hanafi";
      const profile = getGuestProfile();
      const lastValidHabit =
        profile.habitHayzDays > 0 && profile.habitPurityDays > 0
          ? { hayzHours: profile.habitHayzDays * 24, tuhurHours: profile.habitPurityDays * 24 }
          : undefined;

      const cycleEval = evaluateCycleWithHabit({
        bleedingStart: bleedingStartDate,
        bleedingEnd: bleedingEndDate,
        previousPurityEnd: purityStartDate,
        madhhab: cycleMadhhab,
        lastValidHabit,
      });

      const bleedingDays = next.totalHours / 24;
      const monthAnalysis = analyzeSahihAy({
        madhhab,
        bleedingDays,
        purityDays: purityDaysExact,
        habitHayzDays,
      });

      const sahih = monthAnalysis.isSahihMonth;
      setIsSahih(sahih);
      setCycleExplanation(cycleEval.explanation || monthAnalysis.explanation);

      const prevHayzForChange = habitHayzDays;
      const prevTuhurForChange = habitPurityDays;
      const habitChange = evaluateHabitChange({
        madhhab,
        previousHabitHayzDays: prevHayzForChange,
        previousHabitTuhurDays: prevTuhurForChange,
        bleedingDays,
        purityDays: purityDaysExact,
        isSahihMonth: sahih,
        assignedHayzDays: next.hayzDays,
        malikiMaxDays: malikiMaxDays,
        isContinuousBleeding,
        isFirstPeriod,
      });

      if (sahih || habitChange.changed) {
        const newHayzDays = habitChange.newHayzDays;
        const newTuhurDays = Math.max(
          15,
          habitChange.newTuhurDays ??
            Math.round(cycleEval.updatedHabit.tuhurHours / 24)
        );
        if (sahih || madhhab !== "HANAFI") {
          saveGuestProfile({
            ...profile,
            habitHayzDays: newHayzDays,
            habitPurityDays: newTuhurDays,
            malikiMaxDays: Math.max(
              malikiMaxDays,
              newHayzDays,
              profile.malikiMaxDays ?? 0
            ),
            updatedAt: new Date().toISOString(),
          });
          setHabitHayzDays(newHayzDays);
          setHabitPurityDays(newTuhurDays);
          if (madhhab === "MALIKI" || madhhab === "HANAFI_FOLLOWING_MALIKI") {
            setMalikiMaxDays(Math.max(malikiMaxDays, newHayzDays));
          }
        }
        if (sahih) setShowHabitAccordion(false);
      }

      setHabitNotice(
        locale === "tr" ? habitChange.messageTR : habitChange.messageEN
      );

      if (!sahih) {
        setShowHabitAccordion(true);
      }

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
        purityDays: Math.round(purityDaysExact),
        bleedingDays,
        cycleStatus: cycleEval.cycleStatus,
        isSahihMonth: sahih,
        sahihMonthBadgeColor: sahih ? "green" : "amber",
        sahihMonthExplanation: cycleEval.explanation,
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

      // Cetveli görünür kıl: paint sonrası kaydır (sticky header + scroll-margin)
      const scrollToCetvel = () => {
        const el =
          document.getElementById("cetvel") ||
          document.getElementById("sonuc");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      window.requestAnimationFrame(() => {
        window.setTimeout(scrollToCetvel, 80);
        window.setTimeout(scrollToCetvel, 320);
      });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Hesaplama hatası");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await runCalculate();
  }

  const timeHint =
    locale === "tr" ? "24 saat biçimi (ör. 14:30)" : "24-hour format (e.g. 14:30)";

  const comparisonChart = useMemo(() => {
    if (!result) return null;

    const habitHayzH =
      computedHayzHours > 0 ? computedHayzHours : habitHayzDays * 24;
    const habitTuhurH =
      computedTuhurHours > 0 ? computedTuhurHours : habitPurityDays * 24;

    // Yerleştirme takvim gününe göre değil; temizlik/hayz süre (saat) → kutucuk sayısı
    return buildComparisonChart({
      habitHayzHours: habitHayzH,
      habitTuhurHours: habitTuhurH,
      currentTuhurHours: currentTuhurHours,
      bleedingHours: result.totalHours,
      daySchedule: result.daySchedule,
      overlapRule: result.overlapRule ?? null,
      kazayaKalanGunler:
        result.kazayaKalanGunler ??
        Math.ceil(result.istihadhaDays),
      overlapHours: result.overlapHours,
    });
  }, [
    result,
    computedHayzHours,
    computedTuhurHours,
    currentTuhurHours,
    habitHayzDays,
    habitPurityDays,
  ]);

  async function handleChartQada() {
    if (!result || !comparisonChart) return;
    const prayers = Math.max(
      result.qadaPrayersCount,
      comparisonChart.kazayaKalanGunler * 5
    );
    if (prayers <= 0) return;
    const now = new Date().toISOString();
    await saveQada({
      id: uid(),
      kind: "PRAYER",
      remaining: prayers,
      total: prayers,
      source: "comparison_ruler",
      noteTR: `Karşılaştırmalı cetvel: ${comparisonChart.kazayaKalanGunler} istihâze günü`,
      noteEN: `Comparison ruler: ${comparisonChart.kazayaKalanGunler} istihadha days`,
      createdAt: now,
      updatedAt: now,
    });
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

          {/* ── Tarih alanları: Temizlik Başlangıcı + Kanama Başlangıcı + Kanama Bitişi ── */}
          <div className="grid gap-4 lg:grid-cols-3">
            <DateTimeField
              idPrefix="purity-start"
              label={locale === "tr" ? "Temizlik Başlangıcı" : "Purity Start"}
              value={purityStartParts}
              onChange={setPurityStartParts}
              timeHint={timeHint}
            />
            <DateTimeField
              idPrefix="start"
              label={t.calculator.startDate}
              value={startParts}
              onChange={setStartParts}
              timeHint={timeHint}
            />
            <DateTimeField
              idPrefix="end"
              label={t.calculator.endDate}
              value={endParts}
              onChange={setEndParts}
              timeHint={timeHint}
            />
          </div>

          {/* ── Mezhep + Mâlikî max (sadece Maliki seçiliyse) ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="madhhab">
                {t.calculator.madhhab}
              </label>
              <select
                id="madhhab"
                className="input-field"
                value={normalizeSelectableMadhhab(madhhab)}
                onChange={(e) => {
                  const next = e.target.value as Madhhab;
                  setMadhhab(next);
                  saveGuestProfile({
                    ...getGuestProfile(),
                    madhhab: next,
                    updatedAt: new Date().toISOString(),
                  });
                }}
              >
                {MADHHABS.map((m) => (
                  <option key={m} value={m}>
                    {madhhabLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            {malikiControlsEnabled && (
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
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setMalikiMaxDays(next);
                    saveGuestProfile({
                      ...getGuestProfile(),
                      malikiMaxDays: next,
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                />
                <p className="mt-1 text-xs text-slate-400">{t.calculator.maxHayzHint}</p>
              </div>
            )}
          </div>

          {/* ── İstimrâr / İlk period checkbox ── */}
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

          {/* ── Son Sahih Ay: Hanefî 10+ gün veya fâsid — DateTime ── */}
          {(hanafiExceedsTenDays || showHabitAccordion) && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {hanafiExceedsTenDays
                      ? locale === "tr"
                        ? "Kanama 10 günü aşıyor — Son Sahih Ay Verileri"
                        : "Bleeding exceeds 10 days — Last Valid Month"
                      : locale === "tr"
                        ? "Döngü Fâsiddir — Son Sahih Ay Verileri"
                        : "Irregular cycle — Last Valid Month"}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                    {locale === "tr"
                      ? "Son sahih hayz ile temizlik başlangıcını girin. Temizlik süresi, temizlik başlangıcından kanama başlangıcına kadar hesaplanır (ayrı bitiş sorulmaz)."
                      : "Enter last valid hayd and purity start. Purity length runs from purity start to bleeding start (no separate end field)."}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <DateTimeField
                  idPrefix="prev-hayz-start"
                  label={
                    locale === "tr"
                      ? "Son Sahih Hayz Başlangıcı"
                      : "Last Valid Hayd Start"
                  }
                  value={prevHayzStartParts}
                  onChange={setPrevHayzStartParts}
                  timeHint={timeHint}
                />
                <DateTimeField
                  idPrefix="prev-hayz-end"
                  label={
                    locale === "tr"
                      ? "Son Sahih Hayz Bitişi"
                      : "Last Valid Hayd End"
                  }
                  value={prevHayzEndParts}
                  onChange={(v) => {
                    setPrevHayzEndParts(v);
                    setPrevTuhurStartParts(v);
                    setPurityStartParts(v);
                  }}
                  timeHint={timeHint}
                />
                <DateTimeField
                  idPrefix="prev-tuhur-start"
                  label={
                    locale === "tr"
                      ? "Son Sahih Temizlik Başlangıcı"
                      : "Last Valid Purity Start"
                  }
                  value={prevTuhurStartParts}
                  onChange={(v) => {
                    setPrevTuhurStartParts(v);
                    setPurityStartParts(v);
                    setPrevHayzEndParts(v);
                  }}
                  timeHint={timeHint}
                />
                <div className="rounded-xl border border-amber-200/80 bg-white/70 p-3 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-[#130F12] dark:text-amber-100">
                  <p className="font-semibold">
                    {locale === "tr" ? "Hesaplanan süreler" : "Computed durations"}
                  </p>
                  <p className="mt-1">
                    {locale === "tr" ? "Sahih hayz" : "Valid hayd"}:{" "}
                    {formatDurationHint(computedHayzHours, locale)}
                  </p>
                  <p>
                    {locale === "tr" ? "Sahih temizlik" : "Valid purity"}:{" "}
                    {formatDurationHint(computedTuhurHours, locale)}
                    <span className="text-amber-700/80 dark:text-amber-200/70">
                      {locale === "tr"
                        ? " (başlangıç → kanama başlangıcı)"
                        : " (start → bleeding start)"}
                    </span>
                  </p>
                  <p>
                    {locale === "tr" ? "Mevcut temizlik" : "Current purity"}:{" "}
                    {formatDurationHint(currentTuhurHours, locale)}
                  </p>
                  <p>
                    {locale === "tr" ? "Yeni kanama" : "New bleeding"}:{" "}
                    {formatDurationHint(bleedingHoursLive, locale)}
                  </p>
                </div>
              </div>
            </div>
          )}

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
          <p className="text-xs text-stone-500">
            {locale === "tr"
              ? "Hesapla’ya bastıktan sonra sonuçların en üstünde «Hayz ve İstihâze Karşılaştırmalı Cetveli» görünür."
              : "After Calculate, the Hayd & Istihadha Comparison Ruler appears at the top of the results."}
          </p>
          {result && comparisonChart && (
            <a
              href="#cetvel"
              className="inline-flex text-sm font-semibold text-[#F42566] underline-offset-2 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("cetvel")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {locale === "tr"
                ? "↓ Karşılaştırmalı cetvele git"
                : "↓ Go to comparison ruler"}
            </a>
          )}
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
        <div id="sonuc" className="space-y-3">
          {isSahih && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/30">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  {locale === "tr" ? "Döngünüz Sahihtir" : "Your cycle is valid"}
                </p>
                {cycleExplanation && (
                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                    {cycleExplanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {habitNotice && (
            <div className="rounded-2xl border border-[#F42566]/25 bg-[#FFF7F6] p-4 dark:border-[#F42566]/30 dark:bg-[#2A151c]/40">
              <p className="text-sm font-semibold text-[#E11D48]">
                {locale === "tr" ? "Âdet / hayz süresi sonucu" : "Habit / hayd length result"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {habitNotice}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                {locale === "tr"
                  ? "Kaynak: hayzdosya.pdf — Hayzın Değişmesi / Mâlikî kaideleri. Ayrıntı için Hayz Bilgileri → Genel Kurallar / Mâlikî."
                  : "Source: hayzdosya.pdf habit-change / Maliki rules. See Knowledge → Rules / Maliki."}
              </p>
            </div>
          )}

          {comparisonChart && (
            <ComparisonRuler
              chart={comparisonChart}
              locale={locale}
              onAddQada={() => void handleChartQada()}
            />
          )}

          <ResultCard result={result} />

          {showHabitAccordion && isSahih === false && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {locale === "tr"
                      ? "Son sahih âdet ile yeniden hesaplayın"
                      : "Recalculate with last valid habit"}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                    {locale === "tr"
                      ? "Yukarıdaki Son Sahih Hayz / Temizlik alanlarını düzenleyip tekrar hesaplayın. Gün gün çizelge sonuç kartındadır."
                      : "Adjust the Last Valid Hayd / Purity fields above and recalculate. The day schedule is in the result card."}
                  </p>
                  {cycleExplanation && (
                    <p className="mt-1 text-xs italic text-amber-600 dark:text-amber-400">
                      {cycleExplanation}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void runCalculate();
                }}
              >
                {locale === "tr"
                  ? "Eski âdetle yeniden hesapla"
                  : "Recalculate with last habit"}
              </button>
            </div>
          )}
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
            Your history is on the{" "}
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
