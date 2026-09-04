import type {
  CalculationInput,
  CalculationResult,
  CalculationStatus,
  CycleInput,
  DayScheduleEntry,
  FiqhEngineResult,
  Madhhab,
  MonthAnalysisResult,
  OverlapRule,
} from "@/types/fiqh";

/** Hanefî asgari hayz: 3 gün (72 saat). */
const HANAFI_MIN_HAYZ_HOURS = 72;
/** Hanefî azami hayz: 10 gün (240 saat). */
const HANAFI_MAX_HAYZ_HOURS = 240;
/** Hanefî asgari temizlik (tuhur): 15 gün. */
const HANAFI_MIN_TUHR_HOURS = 360;
/** Hanbelî azami hayz: 15 gün. */
const HANBALI_MAX_HAYZ_HOURS = 360;
/** Hanbelî asgari hayz: 1 gün. */
const HANBALI_MIN_HAYZ_HOURS = 24;
/** Hanbelî asgari temizlik: 13 gün. */
const HANBALI_MIN_TUHR_HOURS = 312;
/** Mâlikî varsayılan azami hayz: 15 gün. */
const MALIKI_DEFAULT_MAX_DAYS = 15;
/** İstimrârda ilk kez gören kız: 10 gün hayz. */
const ISTIMRAR_FIRST_HAYZ_DAYS = 10;
/** İstimrârda ilk kez gören kız: 20 gün temiz (istihâze). */
const ISTIMRAR_FIRST_PURITY_DAYS = 20;
/** Rastlayan kaidesi için asgari örtüşme günü. */
const OVERLAP_MIN_DAYS = 3;
/** Günde farz vakit namazı. */
const PRAYERS_PER_DAY = 5;
const MS_PER_HOUR = 1000 * 60 * 60;
const HOURS_PER_DAY = 24;

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Geçersiz tarih: ${value}`);
  }
  return date;
}

function hoursBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_HOUR);
}

function hoursToDays(hours: number): number {
  return hours / HOURS_PER_DAY;
}

function daysToHours(days: number): number {
  return days * HOURS_PER_DAY;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MS_PER_HOUR);
}

function estimateQadaPrayers(istihadhaDays: number): number {
  if (istihadhaDays <= 0) return 0;
  return Math.ceil(istihadhaDays) * PRAYERS_PER_DAY;
}

function getMalikiMaxHours(input: CalculationInput): number {
  return daysToHours(input.malikiMaxDays ?? MALIKI_DEFAULT_MAX_DAYS);
}

function getHabitHayzHours(input: CalculationInput): number {
  return Math.max(0, input.habitHayzDays) * HOURS_PER_DAY;
}

function getMinTuhrHours(madhhab: Madhhab): number {
  if (madhhab === "HANBALI") return HANBALI_MIN_TUHR_HOURS;
  return HANAFI_MIN_TUHR_HOURS;
}

function madhhabLabel(madhhab: Madhhab): { tr: string; en: string } {
  switch (madhhab) {
    case "HANAFI":
      return { tr: "Hanefî", en: "Hanafi" };
    case "MALIKI":
      return { tr: "Mâlikî", en: "Maliki" };
    case "HANAFI_FOLLOWING_MALIKI":
      return { tr: "Hanefî (Mâlikî taklidi)", en: "Hanafi (following Maliki)" };
    case "HANBALI":
      return { tr: "Hanbelî", en: "Hanbali" };
  }
}

/** Takvim günü (1–31) döngüsünde iki aralığın örtüşen gün sayısı. */
function countCalendarOverlapDays(
  currentStart: Date,
  totalDays: number,
  habitStartDay: number,
  habitHayzDays: number
): number {
  let overlap = 0;
  for (let i = 0; i < Math.ceil(totalDays); i++) {
    const d = new Date(currentStart);
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    for (let j = 0; j < habitHayzDays; j++) {
      const habitDay = ((habitStartDay - 1 + j) % 31) + 1;
      if (dayOfMonth === habitDay) {
        overlap++;
        break;
      }
    }
  }
  return overlap;
}

function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Kanama aralığındaki takvim günlerini (öğlen sabitiyle) listeler. */
function listBleedingCalendarDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(12, 0, 0, 0);
  const last = new Date(end);
  last.setHours(12, 0, 0, 0);
  // Bitiş saatı başlangıçtan sonra ama aynı günde ise yine o günü ekle
  if (end.getTime() > start.getTime() && last < cur) {
    days.push(new Date(cur));
    return days;
  }
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  // En az bir gün: çok kısa aralıklar
  if (days.length === 0 && end.getTime() >= start.getTime()) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12));
  }
  return days;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
}

/** [rangeStart, rangeEnd) ile takvim gününün kesişen saatleri. */
function hoursIntersectingDay(
  day: Date,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const a = Math.max(rangeStart.getTime(), startOfLocalDay(day).getTime());
  const b = Math.min(rangeEnd.getTime(), endOfLocalDay(day).getTime());
  return Math.max(0, (b - a) / MS_PER_HOUR);
}

function habitDayOfMonthSet(
  habitStartDay: number,
  habitHayzDays: number
): Set<number> {
  const set = new Set<number>();
  const days = Math.max(1, Math.ceil(habitHayzDays - 1e-9));
  for (let j = 0; j < days; j++) {
    set.add(((habitStartDay - 1 + j) % 31) + 1);
  }
  return set;
}

/**
 * previousPurityStart (= önceki hayz bitişi, saat korunur) ve habitHayzDays ile
 * önceki âdetin ay-içi gün kümesini üretir. Öğlene yuvarlama yapılmaz.
 */
function resolveHabitDom(
  input: CalculationInput,
  purityStart?: Date
): { habitStartDay: number; habitDom: Set<number>; habitHours: number } | null {
  const habitHours = getHabitHayzHours(input);
  if (habitHours < HANAFI_MIN_HAYZ_HOURS && input.habitHayzDays < 1) return null;

  if (input.habitCycleStartDay && input.habitCycleStartDay >= 1) {
    const days = Math.max(1, Math.ceil(input.habitHayzDays - 1e-9));
    return {
      habitStartDay: input.habitCycleStartDay,
      habitDom: habitDayOfMonthSet(input.habitCycleStartDay, days),
      habitHours: habitHours || daysToHours(days),
    };
  }

  if (purityStart) {
    // Önceki hayz: [purityStart - habitHours, purityStart] — gerçek saatler
    const prevEnd = new Date(purityStart);
    const prevStart = addHours(
      prevEnd,
      -(habitHours > 0
        ? habitHours
        : daysToHours(Math.max(1, input.habitHayzDays)))
    );
    const set = new Set<number>();
    const cur = startOfLocalDay(prevStart);
    const walkEnd =
      prevEnd.getTime() > startOfLocalDay(prevEnd).getTime()
        ? startOfLocalDay(prevEnd)
        : addHours(startOfLocalDay(prevEnd), -HOURS_PER_DAY);
    for (
      let t = cur.getTime();
      t <= walkEnd.getTime();
      t += HOURS_PER_DAY * MS_PER_HOUR
    ) {
      set.add(new Date(t).getDate());
    }
    if (set.size === 0) set.add(prevEnd.getDate());
    return {
      habitStartDay: prevStart.getDate(),
      habitDom: set,
      habitHours: habitHours || daysToHours(set.size),
    };
  }

  return null;
}

type HanafiSplitResult = {
  hayzHours: number;
  istihadhaHours: number;
  noteTR: string;
  noteEN: string;
  overlapRule: OverlapRule;
  daySchedule: DayScheduleEntry[];
  kazayaKalanGunler: number;
  /** Saat hassas çakışma (rastlaşma) süresi. */
  overlapHours: number;
  /** İstihâze / kaza başlangıç anı. */
  qadaStartAt: string | null;
};

/**
 * 10 günü aşan kanamada Hanefî rastlayan/rastlamayan kaidesi + gün gün çizelge.
 *
 * Rastleşme süresi: önceki sahih âdetin ay-günü kümesiyle çakışan kanama
 * saatlerinin toplamı (gün içi kısmi saatler dahil).
 *
 * Kural A (Rastlayan): çakışma ≥ 72 saat (3 gün) → çakışan saatler hayz (azami 10g),
 *   diğerleri istihâze.
 * Kural B (Rastlamayan): çakışma < 72 saat → başlangıçtan habit süresi kadar hayz,
 *   kalanı istihâze. Çakışma süresi yine raporlanır.
 */
function splitExceedingHanafi(
  input: CalculationInput,
  totalHours: number,
  startDate: Date,
  endDate: Date,
  maxHayzHours: number
): HanafiSplitResult {
  const habitHours = getHabitHayzHours(input);
  const purityStart = input.previousPurityStartDate
    ? parseDate(input.previousPurityStartDate)
    : undefined;
  const habitInfo = resolveHabitDom(input, purityStart);
  const bleedingDays = listBleedingCalendarDays(startDate, endDate);

  // Saat hassas çakışma: habit DOM’una düşen kanama saatleri
  let overlapHours = 0;
  const dayOverlapHours: number[] = [];
  if (habitInfo) {
    for (const d of bleedingDays) {
      const h = habitInfo.habitDom.has(d.getDate())
        ? hoursIntersectingDay(d, startDate, endDate)
        : 0;
      dayOverlapHours.push(h);
      overlapHours += h;
    }
  } else {
    for (let i = 0; i < bleedingDays.length; i++) dayOverlapHours.push(0);
  }

  const useRastlayan =
    overlapHours >= daysToHours(OVERLAP_MIN_DAYS) && Boolean(habitInfo);
  const maxHayzDays = Math.floor(hoursToDays(maxHayzHours));
  const schedule: DayScheduleEntry[] = [];
  const overlapFmt = formatDuration(overlapHours);

  if (useRastlayan && habitInfo) {
    let hayzHoursAssigned = 0;
    let qadaStartAt: string | null = null;
    let lastHayzEnd: Date | null = null;

    for (let i = 0; i < bleedingDays.length; i++) {
      const d = bleedingDays[i];
      const dayH = dayOverlapHours[i];
      const room = maxHayzHours - hayzHoursAssigned;
      const take = dayH > 0 && room > 0 ? Math.min(dayH, room) : 0;
      const asHayz = take > 0;

      if (asHayz) {
        hayzHoursAssigned += take;
        // Bu gündeki hayz diliminin bitişi
        const dayStart = Math.max(startDate.getTime(), startOfLocalDay(d).getTime());
        lastHayzEnd = new Date(dayStart + take * MS_PER_HOUR);
      } else if (qadaStartAt == null) {
        const istiStart = new Date(
          Math.max(startDate.getTime(), startOfLocalDay(d).getTime())
        );
        qadaStartAt = istiStart.toISOString();
      }

      schedule.push({
        date: toDateKey(d),
        kind: asHayz ? "HAYZ" : "ISTIHADHA",
        labelTR: asHayz ? "Hayz (rastlayan)" : "İstihâze",
        labelEN: asHayz ? "Hayd (overlap)" : "Istihadha",
      });
    }

    // İlk satırlar hayz ise kaza, ilk istihâze anında başlar
    if (qadaStartAt == null && lastHayzEnd && lastHayzEnd < endDate) {
      qadaStartAt = lastHayzEnd.toISOString();
    }

    const hayzHours = Math.min(hayzHoursAssigned, totalHours, maxHayzHours);
    const istihadhaHours = Math.max(0, totalHours - hayzHours);
    const kazayaKalanGunler = schedule.filter((s) => s.kind === "ISTIHADHA").length;
    const hayzDaysAssigned = schedule.filter((s) => s.kind === "HAYZ").length;

    return {
      hayzHours,
      istihadhaHours,
      overlapRule: "RASTLAYAN",
      daySchedule: schedule,
      kazayaKalanGunler,
      overlapHours,
      qadaStartAt,
      noteTR: `Rastlayan kaidesi: önceki sahih âdet günleriyle ${overlapFmt} çakışma var (≥3 gün / 72 saat). Çakışan ${formatDuration(hayzHours)} (${hayzDaysAssigned} takvim günü) hayz; kalan ${kazayaKalanGunler} gün istihâze. İstihâze namazları kaza (tahmini ${kazayaKalanGunler * PRAYERS_PER_DAY} vakit)${qadaStartAt ? `; kaza başlangıcı: ${new Date(qadaStartAt).toLocaleString("tr-TR")}` : ""}.`,
      noteEN: `Overlap rule: ${overlapFmt} matched the previous habit (≥3 days / 72h). ${formatDuration(hayzHours)} hayd (${hayzDaysAssigned} calendar day(s)); ${kazayaKalanGunler} day(s) istihadha. Makeup approx. ${kazayaKalanGunler * PRAYERS_PER_DAY}${qadaStartAt ? `; qada starts: ${new Date(qadaStartAt).toLocaleString("en-GB")}` : ""}.`,
    };
  }

  // Kural B — Rastlamayan (çakışma < 72 saat; süre yine raporlanır)
  const effectiveHabitHours = Math.min(
    Math.max(habitHours > 0 ? habitHours : HANAFI_MIN_HAYZ_HOURS, HANAFI_MIN_HAYZ_HOURS),
    maxHayzHours,
    totalHours
  );
  const hayzCutoff = addHours(startDate, effectiveHabitHours);
  let hayzDayCount = 0;
  for (const d of bleedingDays) {
    const asHayz =
      d.getTime() < hayzCutoff.getTime() && hayzDayCount < maxHayzDays;
    if (asHayz) hayzDayCount++;
    schedule.push({
      date: toDateKey(d),
      kind: asHayz ? "HAYZ" : "ISTIHADHA",
      labelTR: asHayz ? "Hayz (rastlamayan)" : "İstihâze",
      labelEN: asHayz ? "Hayd (non-overlap)" : "Istihadha",
    });
  }

  const hayzHours = effectiveHabitHours;
  const istihadhaHours = Math.max(0, totalHours - hayzHours);
  const kazayaKalanGunler = schedule.filter((s) => s.kind === "ISTIHADHA").length;
  const habitDaysLabel = formatDuration(effectiveHabitHours);
  const qadaStartAt =
    istihadhaHours > 0 ? hayzCutoff.toISOString() : null;

  return {
    hayzHours,
    istihadhaHours,
    overlapRule: "RASTLAMAYAN",
    daySchedule: schedule,
    kazayaKalanGunler,
    overlapHours,
    qadaStartAt,
    noteTR: `Rastlamayan kaidesi: önceki âdetle çakışma ${overlapFmt} (< 3 gün / 72 saat). Kanama başlangıcından ${habitDaysLabel} hayz, kalan ${kazayaKalanGunler} gün istihâze. Kazaya kalan: ${kazayaKalanGunler} gün (≈${kazayaKalanGunler * PRAYERS_PER_DAY} vakit)${qadaStartAt ? `; kaza başlangıcı: ${new Date(qadaStartAt).toLocaleString("tr-TR")}` : ""}.`,
    noteEN: `Non-overlap rule: overlap ${overlapFmt} (< 3 days / 72h). First ${habitDaysLabel} are hayd; ${kazayaKalanGunler} day(s) istihadha. Makeup days: ${kazayaKalanGunler} (≈${kazayaKalanGunler * PRAYERS_PER_DAY})${qadaStartAt ? `; qada starts: ${new Date(qadaStartAt).toLocaleString("en-GB")}` : ""}.`,
  };
}

/**
 * İstimrâr (kesintisiz kan): döngüsel hayz/temizlik bölünmesi.
 * İlk kez gören kız: 10 hayz + 20 istihâze.
 * Âdeti belli: habitHayzDays hayz + habitPurityDays istihâze.
 */
function splitIstimrar(
  input: CalculationInput,
  totalHours: number
): { hayzHours: number; istihadhaHours: number } {
  const hayzCycleHours = input.isFirstPeriod
    ? daysToHours(ISTIMRAR_FIRST_HAYZ_DAYS)
    : getHabitHayzHours(input) || daysToHours(ISTIMRAR_FIRST_HAYZ_DAYS);

  const purityCycleHours = input.isFirstPeriod
    ? daysToHours(ISTIMRAR_FIRST_PURITY_DAYS)
    : daysToHours(Math.max(input.habitPurityDays, 15));

  let remaining = totalHours;
  let hayzHours = 0;
  let istihadhaHours = 0;
  let inHayzPhase = true;

  while (remaining > 0) {
    const cycleHours = inHayzPhase ? hayzCycleHours : purityCycleHours;
    const chunk = Math.min(remaining, cycleHours);
    if (inHayzPhase) hayzHours += chunk;
    else istihadhaHours += chunk;
    remaining -= chunk;
    inHayzPhase = !inHayzPhase;
  }

  return { hayzHours, istihadhaHours };
}

/** Mâlikî taklidi: Hanefî 10 gün sonrası kaza namazı. */
function qadaForFollowingMaliki(
  hayzHours: number,
  istihadhaHours: number,
  totalHours: number
): number {
  const hanafiHayzCap = Math.min(hayzHours, HANAFI_MAX_HAYZ_HOURS);
  const beyondHanafi = Math.max(0, totalHours - HANAFI_MAX_HAYZ_HOURS);
  const istiFromSplit = istihadhaHours;
  const extraQadaHours = Math.max(
    beyondHanafi,
    istiFromSplit > 0 ? istiFromSplit : 0
  );
  return estimateQadaPrayers(hoursToDays(extraQadaHours));
}

function buildCopy(params: {
  status: CalculationStatus;
  madhhab: Madhhab;
  totalHours: number;
  hayzDays: number;
  istihadhaDays: number;
  requiresGhusl: boolean;
  qadaPrayersCount: number;
  nextEarliestHayzDate: string;
  habitHayzDays: number;
  extraNotesTR?: string[];
  extraNotesEN?: string[];
}): Pick<
  CalculationResult,
  | "titleTR"
  | "titleEN"
  | "summaryTR"
  | "summaryEN"
  | "detailsTR"
  | "detailsEN"
> {
  const {
    status,
    madhhab,
    totalHours,
    hayzDays,
    istihadhaDays,
    requiresGhusl,
    qadaPrayersCount,
    nextEarliestHayzDate,
    habitHayzDays,
    extraNotesTR = [],
    extraNotesEN = [],
  } = params;

  const m = madhhabLabel(madhhab);
  const totalDays = hoursToDays(totalHours);
  const nextTR = new Date(nextEarliestHayzDate).toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const nextEN = new Date(nextEarliestHayzDate).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const baseDetailsTR: string[] = [];
  const baseDetailsEN: string[] = [];

  switch (status) {
    case "INVALID_SHORT":
      return {
        titleTR: "Kısa kanama — İstihâze",
        titleEN: "Short bleeding — Istihadha",
        summaryTR: `${m.tr} mezhebine göre ${totalDays.toFixed(2)} günlük kanama asgari hayz süresinin altındadır; tamamı istihâze sayılır. 72 saatten 5 dakika bile az süren kan hayz olmaz.`,
        summaryEN: `According to the ${m.en} school, this ${totalDays.toFixed(2)}-day bleeding is below minimum hayd; all of it is istihadha. Even 5 minutes under 72 hours is not hayd.`,
        detailsTR: [
          "Gusül farz değildir; yalnız abdest alınıp namaz kılınır.",
          `Kılınmayan vakit namazları kaza edilmelidir (tahmini ${qadaPrayersCount} vakit).`,
          `En erken sonraki hayz tarihi: ${nextTR}.`,
          ...extraNotesTR,
        ],
        detailsEN: [
          "Ghusl is not required; perform wudu and pray.",
          `Missed prayers must be made up (approx. ${qadaPrayersCount}).`,
          `Earliest next hayd date: ${nextEN}.`,
          ...extraNotesEN,
        ],
      };
    case "HAYZ":
      return {
        titleTR: "Hayz",
        titleEN: "Hayd",
        summaryTR: `${m.tr} mezhebine göre kanamanın tamamı (${hayzDays.toFixed(2)} gün) hayzdır.`,
        summaryEN: `According to the ${m.en} school, the entire bleeding (${hayzDays.toFixed(2)} days) is hayd.`,
        detailsTR: [
          requiresGhusl
            ? "Hayz bitiminde gusül farzdır."
            : "Gusül gerekmez.",
          "Hayz süresince namaz farz değildir; oruç tutulmaz, sonra kaza edilir.",
          "Mushafa el sürülmez; camiye girilmez; vaty haramdır.",
          `En erken sonraki hayz tarihi: ${nextTR}.`,
          ...extraNotesTR,
        ],
        detailsEN: [
          requiresGhusl
            ? "Ghusl is obligatory when hayd ends."
            : "Ghusl is not required.",
          "Prayer is not required during hayd; fasting is omitted and made up.",
          "Do not touch the mushaf; do not enter the mosque; intercourse is forbidden.",
          `Earliest next hayd date: ${nextEN}.`,
          ...extraNotesEN,
        ],
      };
    case "MIXED":
      return {
        titleTR: "Karma durum — Hayz + İstihâze",
        titleEN: "Mixed — Hayd + Istihadha",
        summaryTR: `${m.tr} mezhebine göre kanama azami sınırı aşmıştır. Hayz: ${hayzDays.toFixed(2)} gün; istihâze: ${istihadhaDays.toFixed(2)} gün.`,
        summaryEN: `According to the ${m.en} school, bleeding exceeded the maximum. Hayd: ${hayzDays.toFixed(2)} days; istihadha: ${istihadhaDays.toFixed(2)} days.`,
        detailsTR: [
          "Hayz kısmının bitiminde gusül farzdır.",
          `İstihâze günlerinde kılınmayan namazlar kaza edilmelidir (tahmini ${qadaPrayersCount} vakit).`,
          "İstihâze hâlinde abdest alınıp namaz kılınır; oruç tutulur; vaty câizdir.",
          `En erken sonraki hayz tarihi: ${nextTR}.`,
          ...extraNotesTR,
        ],
        detailsEN: [
          "Ghusl is obligatory after the hayd portion ends.",
          `Missed prayers during istihadha must be made up (approx. ${qadaPrayersCount}).`,
          "During istihadha: wudu, prayer and fasting continue; intercourse is permitted.",
          `Earliest next hayd date: ${nextEN}.`,
          ...extraNotesEN,
        ],
      };
    case "ISTIHADHA":
      return {
        titleTR: "İstihâze",
        titleEN: "Istihadha",
        summaryTR: `${m.tr} mezhebine göre bu süre (${istihadhaDays.toFixed(2)} gün) istihâze (özür kanı) hükmündedir.`,
        summaryEN: `According to the ${m.en} school, this period (${istihadhaDays.toFixed(2)} days) is istihadha.`,
        detailsTR: [
          requiresGhusl ? "Gusül farzdır." : "Gusül gerekmez.",
          `Kılınmayan vakit namazları kaza edilmelidir (tahmini ${qadaPrayersCount} vakit).`,
          `En erken sonraki hayz tarihi: ${nextTR}.`,
          ...extraNotesTR,
        ],
        detailsEN: [
          requiresGhusl ? "Ghusl is obligatory." : "Ghusl is not required.",
          `Missed prayers must be made up (approx. ${qadaPrayersCount}).`,
          `Earliest next hayd date: ${nextEN}.`,
          ...extraNotesEN,
        ],
      };
  }
}

function buildResult(params: {
  status: CalculationStatus;
  totalHours: number;
  hayzHours: number;
  istihadhaHours: number;
  requiresGhusl: boolean;
  endDate: Date;
  input: CalculationInput;
  qadaOverride?: number;
  extraNotesTR?: string[];
  extraNotesEN?: string[];
  daySchedule?: DayScheduleEntry[];
  overlapRule?: OverlapRule | null;
  kazayaKalanGunler?: number;
  overlapHours?: number;
  qadaStartAt?: string | null;
}): CalculationResult {
  const {
    status,
    totalHours,
    hayzHours,
    istihadhaHours,
    requiresGhusl,
    endDate,
    input,
    qadaOverride,
    extraNotesTR,
    extraNotesEN,
    daySchedule,
    overlapRule,
    kazayaKalanGunler,
    overlapHours,
    qadaStartAt,
  } = params;

  const hayzDays = hoursToDays(hayzHours);
  const istihadhaDays = hoursToDays(istihadhaHours);
  const qadaPrayersCount =
    qadaOverride ?? estimateQadaPrayers(istihadhaDays);
  const nextEarliestHayzDate = addHours(
    endDate,
    getMinTuhrHours(input.madhhab)
  ).toISOString();

  const copy = buildCopy({
    status,
    madhhab: input.madhhab,
    totalHours,
    hayzDays,
    istihadhaDays,
    requiresGhusl,
    qadaPrayersCount,
    nextEarliestHayzDate,
    habitHayzDays: input.habitHayzDays,
    extraNotesTR,
    extraNotesEN,
  });

  return {
    status,
    totalHours,
    hayzDays,
    istihadhaDays,
    requiresGhusl,
    qadaPrayersCount,
    nextEarliestHayzDate,
    daySchedule,
    overlapRule: overlapRule ?? null,
    kazayaKalanGunler,
    overlapHours,
    qadaStartAt: qadaStartAt ?? null,
    ...copy,
  };
}

function calculateHanafi(
  input: CalculationInput,
  totalHours: number,
  startDate: Date,
  endDate: Date,
  maxHayzHours: number
): CalculationResult {
  if (input.isContinuousBleeding) {
    const { hayzHours, istihadhaHours } = splitIstimrar(input, totalHours);
    const noteTR = input.isFirstPeriod
      ? "İstimrâr: ilk kez kan gören kız — 10 gün hayz, 20 gün istihâze döngüsü."
      : "İstimrâr: âdeti belli kadın — sahih hayz ve temizlik günleri döngüsü.";
    const noteEN = input.isFirstPeriod
      ? "Istimrar: first period — 10-day hayd / 20-day istihadha cycle."
      : "Istimrar: established habit cycle applied.";
    return buildResult({
      status: istihadhaHours > 0 ? "MIXED" : "HAYZ",
      totalHours,
      hayzHours,
      istihadhaHours,
      requiresGhusl: hayzHours > 0,
      endDate,
      input,
      extraNotesTR: [noteTR],
      extraNotesEN: [noteEN],
    });
  }

  if (totalHours < HANAFI_MIN_HAYZ_HOURS) {
    return buildResult({
      status: "INVALID_SHORT",
      totalHours,
      hayzHours: 0,
      istihadhaHours: totalHours,
      requiresGhusl: false,
      endDate,
      input,
    });
  }

  if (totalHours <= maxHayzHours) {
    return buildResult({
      status: "HAYZ",
      totalHours,
      hayzHours: totalHours,
      istihadhaHours: 0,
      requiresGhusl: true,
      endDate,
      input,
    });
  }

  const split = splitExceedingHanafi(
    input,
    totalHours,
    startDate,
    endDate,
    maxHayzHours
  );

  const qadaOverride =
    input.madhhab === "HANAFI_FOLLOWING_MALIKI"
      ? qadaForFollowingMaliki(
          split.hayzHours,
          split.istihadhaHours,
          totalHours
        )
      : estimateQadaPrayers(hoursToDays(split.istihadhaHours));

  const extraTR = [split.noteTR];
  const extraEN = [split.noteEN];
  if (input.madhhab === "HANAFI_FOLLOWING_MALIKI") {
    extraTR.push(
      "Mâlikî taklidi: 10 günü aşan sürede namaz kılınmaz; temizlenince 10. günden sonraki namazlar Hanefî’ye göre kaza edilir."
    );
    extraEN.push(
      "Following Maliki: no prayer beyond 10 days; after purity, prayers after day 10 are made up per Hanafi."
    );
  }

  return buildResult({
    status: "MIXED",
    totalHours,
    hayzHours: split.hayzHours,
    istihadhaHours: split.istihadhaHours,
    requiresGhusl: true,
    endDate,
    input,
    qadaOverride,
    extraNotesTR: extraTR,
    extraNotesEN: extraEN,
    daySchedule: split.daySchedule,
    overlapRule: split.overlapRule,
    kazayaKalanGunler: split.kazayaKalanGunler,
    overlapHours: split.overlapHours,
    qadaStartAt: split.qadaStartAt,
  });
}

function calculateMaliki(
  input: CalculationInput,
  totalHours: number,
  endDate: Date
): CalculationResult {
  const maxHours = getMalikiMaxHours(input);

  if (input.isContinuousBleeding) {
    const hayzCycle = input.isFirstPeriod
      ? daysToHours(15)
      : getHabitHayzHours(input) || daysToHours(15);
    const purityCycle = daysToHours(15);
    let remaining = totalHours;
    let hayzHours = 0;
    let istihadhaHours = 0;
    let inHayz = true;
    while (remaining > 0) {
      const cycle = inHayz ? hayzCycle : purityCycle;
      const chunk = Math.min(remaining, cycle);
      if (inHayz) hayzHours += chunk;
      else istihadhaHours += chunk;
      remaining -= chunk;
      inHayz = !inHayz;
    }
    return buildResult({
      status: istihadhaHours > 0 ? "MIXED" : "HAYZ",
      totalHours,
      hayzHours,
      istihadhaHours,
      requiresGhusl: hayzHours > 0,
      endDate,
      input,
      extraNotesTR: ["Mâlikî istimrâr döngüsü uygulandı."],
      extraNotesEN: ["Maliki istimrar cycle applied."],
    });
  }

  if (totalHours <= 0) {
    return buildResult({
      status: "ISTIHADHA",
      totalHours: 0,
      hayzHours: 0,
      istihadhaHours: 0,
      requiresGhusl: false,
      endDate,
      input,
    });
  }

  if (totalHours <= maxHours) {
    return buildResult({
      status: "HAYZ",
      totalHours,
      hayzHours: totalHours,
      istihadhaHours: 0,
      requiresGhusl: true,
      endDate,
      input,
      extraNotesTR: ["Mâlikî’de asgari sınır yoktur; bu süre hayz kabul edilir."],
      extraNotesEN: ["Maliki has no minimum; this duration is hayd."],
    });
  }

  const habitHours = getHabitHayzHours(input);
  const hayzHours = habitHours > 0 ? Math.min(habitHours, maxHours) : maxHours;
  const istihadhaHours = Math.max(0, totalHours - hayzHours);

  return buildResult({
    status: "MIXED",
    totalHours,
    hayzHours,
    istihadhaHours,
    requiresGhusl: hayzHours > 0,
    endDate,
    input,
  });
}

function calculateHanbali(
  input: CalculationInput,
  totalHours: number,
  endDate: Date
): CalculationResult {
  if (input.isContinuousBleeding) {
    const { hayzHours, istihadhaHours } = splitIstimrar(input, totalHours);
    return buildResult({
      status: istihadhaHours > 0 ? "MIXED" : "HAYZ",
      totalHours,
      hayzHours,
      istihadhaHours,
      requiresGhusl: hayzHours > 0,
      endDate,
      input,
      extraNotesTR: ["Hanbelî istimrâr hesabı uygulandı."],
      extraNotesEN: ["Hanbali istimrar calculation applied."],
    });
  }

  if (totalHours < HANBALI_MIN_HAYZ_HOURS) {
    return buildResult({
      status: "INVALID_SHORT",
      totalHours,
      hayzHours: 0,
      istihadhaHours: totalHours,
      requiresGhusl: false,
      endDate,
      input,
      extraNotesTR: ["Hanbelî’de asgari hayz 1 gündür; daha kısa süre istihâzedir."],
      extraNotesEN: ["Hanbali minimum hayd is 1 day; shorter bleeding is istihadha."],
    });
  }

  if (totalHours <= HANBALI_MAX_HAYZ_HOURS) {
    return buildResult({
      status: "HAYZ",
      totalHours,
      hayzHours: totalHours,
      istihadhaHours: 0,
      requiresGhusl: true,
      endDate,
      input,
    });
  }

  const habitHours = getHabitHayzHours(input);
  const hayzHours = Math.min(
    habitHours > 0 ? habitHours : HANBALI_MAX_HAYZ_HOURS,
    HANBALI_MAX_HAYZ_HOURS
  );
  const istihadhaHours = Math.max(0, totalHours - hayzHours);

  return buildResult({
    status: "MIXED",
    totalHours,
    hayzHours,
    istihadhaHours,
    requiresGhusl: true,
    endDate,
    input,
    extraNotesTR: ["Hanbelî’de azami hayz 15 gündür; fazlası istihâzedir."],
    extraNotesEN: ["Hanbali maximum hayd is 15 days; the rest is istihadha."],
  });
}

/**
 * Kanama başlangıç/bitiş tarihlerine göre fıkhi durumu hesaplar.
 * Seâdet-i Ebediyye ve ilgili kaynaklardaki süre sınırları saat bazlı uygulanır.
 */
export function calculateFiqhStatus(
  input: CalculationInput
): CalculationResult {
  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);

  if (end.getTime() < start.getTime()) {
    throw new Error("Bitiş tarihi başlangıç tarihinden önce olamaz.");
  }

  const totalHours = hoursBetween(start, end);

  switch (input.madhhab) {
    case "HANAFI":
      return calculateHanafi(
        input,
        totalHours,
        start,
        end,
        HANAFI_MAX_HAYZ_HOURS
      );
    case "HANAFI_FOLLOWING_MALIKI":
      return calculateHanafi(
        input,
        totalHours,
        start,
        end,
        getMalikiMaxHours(input)
      );
    case "MALIKI":
      return calculateMaliki(input, totalHours, end);
    case "HANBALI":
      return calculateHanbali(input, totalHours, end);
    default: {
      const _exhaustive: never = input.madhhab;
      throw new Error(`Desteklenmeyen mezhep: ${_exhaustive}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Yardımcı: gün + saat biçiminde süre metni üretir
// ---------------------------------------------------------------------------

function formatDuration(hours: number): string {
  const wholeDays = Math.floor(hours / HOURS_PER_DAY);
  const remainHours = Math.round(hours % HOURS_PER_DAY);
  if (wholeDays === 0) return `${remainHours} saat`;
  if (remainHours === 0) return `${wholeDays} gün`;
  return `${wholeDays} gün ${remainHours} saat`;
}

// ---------------------------------------------------------------------------
// Sahih Ay / Fâsid Ay analizi — gün bazlı girdi (CalculatorForm uyumlu)
// ---------------------------------------------------------------------------

/**
 * Bir döngünün "Sahih Ay" sayılıp sayılmayacağını belirler.
 *
 * Hanefî : kanama 72–240 saat (3–10 gün) VE temizlik >= 360 saat (15 gün) → SAHIH
 * Mâlikî : kanama > 0 saat ve <= 360 saat (15 gün) VE temizlik >= 360 saat → SAHIH
 * Diğer  : yukarıdaki şartlardan biri sağlanmıyorsa → FASID
 *
 * Açıklama metni gün + saat cinsinden detaylandırılır.
 */
export function analyzeSahihAy(params: {
  madhhab: Madhhab;
  /** Kanama toplam süresi — gün (float). */
  bleedingDays: number;
  /** Önceki temizlik süresi — gün (float veya integer). */
  purityDays: number;
  habitHayzDays?: number;
}): MonthAnalysisResult {
  const { madhhab, bleedingDays, purityDays, habitHayzDays } = params;

  const isHanafi =
    madhhab === "HANAFI" || madhhab === "HANAFI_FOLLOWING_MALIKI";
  const monthMadhhab: MonthAnalysisResult["madhhab"] = isHanafi
    ? "Hanafi"
    : "Maliki";

  const bleedingHours = bleedingDays * HOURS_PER_DAY;
  const purityHours = purityDays * HOURS_PER_DAY;

  // Temizlik şartı: >= 360 saat (15 gün) — her iki mezhep için aynı
  const purityOk = purityHours >= HANAFI_MIN_TUHR_HOURS;

  // Kanama şartları
  const hanafiMinOk = bleedingHours >= HANAFI_MIN_HAYZ_HOURS; // >= 72 saat
  const hanafiMaxOk = bleedingHours <= HANAFI_MAX_HAYZ_HOURS; // <= 240 saat
  const malikiMinOk = bleedingHours > 0;                       // > 0 (bir damla yeterli)
  const malikiMaxOk = bleedingHours <= HANAFI_MIN_TUHR_HOURS;  // <= 360 saat (15 gün)

  const isSahih =
    purityOk &&
    (isHanafi
      ? hanafiMinOk && hanafiMaxOk
      : malikiMinOk && malikiMaxOk);

  const badgeColor: MonthAnalysisResult["badgeColor"] = isSahih
    ? "green"
    : !purityOk
      ? "amber"
      : "rose";

  // Gün + saat cinsinden formatlanmış süreler
  const bleedingFmt = formatDuration(bleedingHours);
  const purityFmt = formatDuration(purityHours);

  let explanation: string;
  if (isSahih) {
    explanation = isHanafi
      ? `Hanefî sahih ay ✓ — Kanamanız ${bleedingFmt} sürmüş (3–10 gün arası) ve temizliğiniz ${purityFmt} olmuştur (≥15 gün). Bu döngü sahih âdet olarak kaydedildi.`
      : `Mâlikî sahih ay ✓ — Kanamanız ${bleedingFmt} sürmüş (≤15 gün) ve temizliğiniz ${purityFmt} olmuştur (≥15 gün). Bu döngü sahih âdet olarak kaydedildi.`;
  } else if (!purityOk) {
    explanation = `Fâsid ay — Temizlik süresi ${purityFmt} olup asgari 15 günün (360 saat) altındadır. Bu döngü istihâze/fâsid sayılır; eski sahih âdetiniz geçerli kalmaya devam eder.`;
  } else if (isHanafi && !hanafiMinOk) {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} sürmüş olup Hanefî asgari sınırı olan 3 günün (72 saat) altındadır. Tüm kanama istihâze sayılır; eski âdetiniz korunur.`;
  } else if (isHanafi && !hanafiMaxOk) {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} sürmüş olup Hanefî azami sınırı olan 10 günü (240 saat) aşmıştır. Azami üstü kısım istihâzedir; eski âdetiniz korunur.`;
  } else if (!malikiMinOk) {
    explanation = `Fâsid ay — Hiç kanama kaydedilmemiş; bu döngü değerlendirilemez.`;
  } else {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} sürmüş olup Mâlikî azami sınırı olan 15 günü (360 saat) aşmıştır. Fazla kısım istihâzedir; eski âdetiniz korunur.`;
  }

  const newHabitHayzRounded =
    isSahih && typeof habitHayzDays === "number"
      ? Math.max(1, Math.round(bleedingDays))
      : undefined;
  const habitUpdated =
    typeof newHabitHayzRounded === "number" &&
    typeof habitHayzDays === "number" &&
    Math.round(habitHayzDays) !== newHabitHayzRounded;

  return {
    madhhab: monthMadhhab,
    bleedingDays,
    purityDays,
    cycleStatus: isSahih ? "SAHIH" : "FASID",
    isSahihMonth: isSahih,
    habitUpdated,
    newHabitHayz: habitUpdated ? newHabitHayzRounded : undefined,
    explanation,
    badgeColor,
  };
}

// ---------------------------------------------------------------------------
// Hassas motor: CycleInput (Date) → FiqhEngineResult
// Sahih ise habit güncellenir; fâsid ise son geçerli habit korunur.
// ---------------------------------------------------------------------------

/**
 * Tam tarihlerle saat+dakika hassasiyetinde döngü sıhhati hesaplar.
 *
 * - Sahih ay  → updatedHabit = bu döngünün süreleri
 * - Fâsid ay  → updatedHabit = lastValidHabit (değişmez); yoksa mevcut süreler saklanır
 */
export function evaluateCycleWithHabit(
  input: CycleInput
): FiqhEngineResult {
  const { bleedingStart, bleedingEnd, previousPurityEnd, madhhab, lastValidHabit } =
    input;

  // Saat bazlı süreler
  const bleedingDurationHours = Math.max(
    0,
    (bleedingEnd.getTime() - bleedingStart.getTime()) / MS_PER_HOUR
  );
  const purityDurationHours = Math.max(
    0,
    (bleedingStart.getTime() - previousPurityEnd.getTime()) / MS_PER_HOUR
  );

  const isHanafi = madhhab === "Hanafi";

  // Temizlik şartı: >= 360 saat (15 gün)
  const purityOk = purityDurationHours >= HANAFI_MIN_TUHR_HOURS;

  // Kanama şartları
  const hanafiMinOk = bleedingDurationHours >= HANAFI_MIN_HAYZ_HOURS;
  const hanafiMaxOk = bleedingDurationHours <= HANAFI_MAX_HAYZ_HOURS;
  const malikiMinOk = bleedingDurationHours > 0;
  const malikiMaxOk = bleedingDurationHours <= HANAFI_MIN_TUHR_HOURS; // 360 saat = 15 gün

  const isSahih =
    purityOk &&
    (isHanafi
      ? hanafiMinOk && hanafiMaxOk
      : malikiMinOk && malikiMaxOk);

  // Habit güncellemesi
  const updatedHabit: FiqhEngineResult["updatedHabit"] =
    isSahih
      ? { hayzHours: bleedingDurationHours, tuhurHours: purityDurationHours }
      : lastValidHabit ?? { hayzHours: bleedingDurationHours, tuhurHours: purityDurationHours };

  const badgeColor: FiqhEngineResult["badgeColor"] = isSahih ? "green" : "amber";

  const bleedingFmt = formatDuration(bleedingDurationHours);
  const purityFmt = formatDuration(purityDurationHours);

  let explanation: string;
  if (isSahih) {
    explanation = isHanafi
      ? `Hanefî sahih ay ✓ — Kanamanız ${bleedingFmt} sürmüş (3–10 gün arası) ve temizliğiniz ${purityFmt} olmuştur (≥15 gün). Âdetiniz bu döngünün süreleriyle güncellendi.`
      : `Mâlikî sahih ay ✓ — Kanamanız ${bleedingFmt} sürmüş (≤15 gün) ve temizliğiniz ${purityFmt} olmuştur (≥15 gün). Âdetiniz bu döngünün süreleriyle güncellendi.`;
  } else if (!purityOk) {
    explanation = `Fâsid ay — Temizlik süresi ${purityFmt} olup asgari 15 günün altındadır. Önceki sahih âdetiniz (${lastValidHabit ? formatDuration(lastValidHabit.hayzHours) : "—"} hayz) geçerli kalmaya devam eder.`;
  } else if (isHanafi && !hanafiMinOk) {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} ile Hanefî asgari 3 günün (72 saat) altındadır; tamamı istihâze sayılır. Önceki âdetiniz korunur.`;
  } else if (isHanafi && !hanafiMaxOk) {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} ile Hanefî azami 10 günü (240 saat) aşmıştır; fazlası istihâzedir. Önceki âdetiniz korunur.`;
  } else if (!malikiMinOk) {
    explanation = `Fâsid ay — Hiç kanama kaydedilmemiş.`;
  } else {
    explanation = `Fâsid ay — Kanamanız ${bleedingFmt} ile Mâlikî azami 15 günü (360 saat) aşmıştır; fazlası istihâzedir. Önceki âdetiniz korunur.`;
  }

  return {
    cycleStatus: isSahih ? "SAHIH" : "FASID",
    bleedingDurationHours,
    purityDurationHours,
    updatedHabit,
    badgeColor,
    explanation,
  };
}
