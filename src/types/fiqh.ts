/** Desteklenen mezhep / taklit seçenekleri. */
export type Madhhab =
  | "HANAFI"
  | "MALIKI"
  | "HANAFI_FOLLOWING_MALIKI"
  | "HANBALI";

/** Sahih ay (döngü sıhhati) değerlendirmesinde kullanılan mezhep grubu. */
export type MonthMadhhab = "Hanafi" | "Maliki";

/** Döngünün sahih / fâsid ay durumu. */
export type CycleStatus = "SAHIH" | "FASID";

export interface MonthAnalysisResult {
  madhhab: MonthMadhhab;
  bleedingDays: number;
  purityDays: number;
  cycleStatus: CycleStatus;
  isSahihMonth: boolean;
  habitUpdated: boolean;
  newHabitHayz?: number;
  newHabitTuhur?: number;
  explanation: string;
  badgeColor: "green" | "amber" | "rose";
}

/** Hesaplama sonucu durumu. */
export type CalculationStatus =
  | "HAYZ"
  | "ISTIHADHA"
  | "MIXED"
  | "INVALID_SHORT";

/** Bilgi kartı kategori anahtarı. */
export type KnowledgeCategoryKey =
  | "all"
  | "glossary"
  | "fasting"
  | "prayer"
  | "rules"
  | "hajj"
  | "istihadha"
  | "maliki";

/** Hesaplama motoruna giden girdiler. */
export interface CalculationInput {
  /** ISO datetime */
  startDate: string;
  /** ISO datetime */
  endDate: string;
  madhhab: Madhhab;
  /** Önceki sahih temizlik (tuhur) günü; asgari 15. */
  habitPurityDays: number;
  /** Önceki sahih hayz günü; 3–10 arası. */
  habitHayzDays: number;
  /** Maliki / taklit için azami hayz günü (varsayılan 15). */
  malikiMaxDays?: number;
  /** Kan kesilmeden sürekli akıyor mu (istimrâr)? */
  isContinuousBleeding?: boolean;
  /** Hayatında ilk defa kan gören bâliğa kız mı? */
  isFirstPeriod?: boolean;
  /**
   * Rastlayan/rastlamayan hesabı için önceki âdetin başladığı ay günü (1–31).
   * Verilmezse `previousPurityStartDate` + habitHayzDays ile türetilir.
   */
  habitCycleStartDay?: number;
  /**
   * Önceki temizlik başlangıcı (= önceki hayz bitişi) ISO datetime.
   * Hanefî 10 günü aşan kanamada rastlama çizelgesi için kullanılır.
   */
  previousPurityStartDate?: string;
}

/** Gün gün hayz / istihâze çizelge satırı. */
export type DayScheduleKind = "HAYZ" | "ISTIHADHA";

export interface DayScheduleEntry {
  /** YYYY-MM-DD */
  date: string;
  kind: DayScheduleKind;
  labelTR: string;
  labelEN: string;
}

export type OverlapRule = "RASTLAYAN" | "RASTLAMAYAN";

/** Hesaplama motorunun çıktısı. */
export interface CalculationResult {
  status: CalculationStatus;
  totalHours: number;
  hayzDays: number;
  istihadhaDays: number;
  requiresGhusl: boolean;
  qadaPrayersCount: number;
  nextEarliestHayzDate: string;
  titleTR: string;
  titleEN: string;
  summaryTR: string;
  summaryEN: string;
  detailsTR: string[];
  detailsEN: string[];
  /** Hanefî 10+ gün: gün gün hayz/istihâze listesi. */
  daySchedule?: DayScheduleEntry[];
  /** Uygulanan rastlama kuralı. */
  overlapRule?: OverlapRule | null;
  /** Kaza gereken istihâze gün sayısı. */
  kazayaKalanGunler?: number;
  /**
   * Önceki sahih âdet günleriyle çakışan kanama süresi (saat).
   * Takvim günü değil; gün içi saat kesişimi toplanır.
   */
  overlapHours?: number;
  /**
   * İstihâze / kaza yükümlülüğünün başladığı an (ISO).
   * Rastlamayanda: kanama başlangıcı + hayz süresi.
   * Rastlayanda: ilk istihâze diliminin başı.
   */
  qadaStartAt?: string | null;
}

// ---------------------------------------------------------------------------
// Yeni hassas motor arayüzleri (CycleInput / FiqhEngineResult)
// ---------------------------------------------------------------------------

/** Yeni motor girdisi — Date nesneleri ile dakika hassasiyetinde. */
export interface CycleInput {
  bleedingStart: Date;
  bleedingEnd: Date;
  /** Bir önceki hayzın bitişi (tuhur süresini hesaplamak için). */
  previousPurityEnd: Date;
  madhhab: "Hanafi" | "Maliki";
  /** Kullanıcının hafızasındaki en son sahih âdet (saat cinsinden). */
  lastValidHabit?: { hayzHours: number; tuhurHours: number };
}

/** Yeni motor çıktısı. */
export interface FiqhEngineResult {
  cycleStatus: "SAHIH" | "FASID";
  bleedingDurationHours: number;
  purityDurationHours: number;
  /**
   * Sahih ise → bu döngünün süreleriyle güncellendi.
   * Fâsid ise → lastValidHabit olduğu gibi korundu.
   */
  updatedHabit: { hayzHours: number; tuhurHours: number };
  /** Sahih: "green" · Fâsid-temizlik: "amber" · Fâsid-azami: "amber" */
  badgeColor: "green" | "amber";
  /** Gün + saat cinsinden detaylı Türkçe açıklama. */
  explanation: string;
}

/** Bilgi kütüphanesindeki tek bir madde. */
export interface KnowledgeItem {
  id: string;
  category: string;
  categoryKey: KnowledgeCategoryKey;
  titleTR: string;
  titleEN: string;
  contentTR: string;
  contentEN: string;
  sourcesTR: string;
  sourcesEN: string;
}
