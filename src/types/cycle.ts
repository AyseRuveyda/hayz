/** Fıkhi takvim renk standartları (PDF / UI ortak). */
export const FIQH_COLORS = {
  hayz: "#E11D48",
  tuhr: "#10B981",
  istihadha: "#F59E0B",
  spotting: "#854D0E",
  fasidTuhr: "#94A3B8",
  page: "#FFF7F6",
  primary: "#F42566",
} as const;

export type FiqhDayKind =
  | "HAYZ"
  | "TUHR"
  | "ISTIHADHA"
  | "SPOTTING"
  | "FASID_TUHR"
  | "EMPTY";

export type DischargeType =
  | "BLOOD_RED"
  | "BROWN_SPOT"
  | "YELLOW"
  | "WHITE_TUHR";

export type KursufState = "WET" | "DRY";

export type PhysicalSymptom =
  | "CRAMPS"
  | "HEADACHE"
  | "FATIGUE"
  | "NAUSEA"
  | "BACK_PAIN"
  | "OTHER";

export interface DailySpottingLog {
  id: string;
  userId?: string | null;
  date: string; // YYYY-MM-DD
  dischargeType: DischargeType;
  kursufState: KursufState;
  symptoms: PhysicalSymptom[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CycleRecord {
  id: string;
  userId?: string | null;
  startDate: string;
  endDate: string;
  madhhab: string;
  status: string;
  hayzDays: number;
  istihadhaDays: number;
  purityDays?: number;
  bleedingDays?: number;
  cycleStatus?: "SAHIH" | "FASID";
  isSahihMonth?: boolean;
  sahihMonthBadgeColor?: "green" | "amber" | "rose";
  sahihMonthExplanation?: string;
  requiresGhusl: boolean;
  qadaPrayersCount: number;
  nextEarliestHayzDate?: string;
  summaryTR?: string;
  summaryEN?: string;
  isContinuousBleeding?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QadaKind = "PRAYER" | "FAST";

export interface QadaItem {
  id: string;
  userId?: string | null;
  kind: QadaKind;
  /** Namaz için vakit sayısı; oruç için gün sayısı. */
  remaining: number;
  total: number;
  source: string;
  relatedCycleId?: string;
  relatedDate?: string;
  noteTR?: string;
  noteEN?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email?: string | null;
  displayName?: string | null;
  madhhab: string;
  habitHayzDays: number;
  habitPurityDays: number;
  malikiMaxDays?: number;
  locale: "tr" | "en";
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDayCell {
  date: string;
  kind: FiqhDayKind;
  hasSpotting: boolean;
  spottingColor?: string;
  labelTR?: string;
  labelEN?: string;
}

export interface CyclePrediction {
  estimatedNextHayzDate: string;
  daysUntilNextHayz: number;
  daysUntilMinTuhrComplete: number;
  averageHayzDays: number;
  averagePurityDays: number;
  messageTR: string;
  messageEN: string;
}
