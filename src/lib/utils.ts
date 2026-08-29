import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Tarih + saat (24 saat) gösterimi — öğleden önce/sonra yok. */
export function formatDateTime(value: string, locale: "tr" | "en") {
  return new Date(value).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateOnly(value: string, locale: "tr" | "en") {
  return new Date(value).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export type DateTimeParts = {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
};

export function splitDateTime(isoOrLocal: string): DateTimeParts {
  const d = new Date(isoOrLocal);
  if (!Number.isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }
  const [date = "", time = "08:00"] = isoOrLocal.split("T");
  return { date, time: time.slice(0, 5) };
}

export function combineDateTime(parts: DateTimeParts): string {
  const { date, time } = parts;
  if (!date) return "";
  const [h = "08", m = "00"] = (time || "08:00").split(":");
  const hh = String(Math.min(23, Math.max(0, parseInt(h, 10) || 0))).padStart(2, "0");
  const mm = String(Math.min(59, Math.max(0, parseInt(m, 10) || 0))).padStart(2, "0");
  return `${date}T${hh}:${mm}`;
}

export function dateTimePartsToIso(parts: DateTimeParts): string {
  const combined = combineDateTime(parts);
  if (!combined) throw new Error("Geçersiz tarih veya saat");
  const d = new Date(combined);
  if (Number.isNaN(d.getTime())) throw new Error("Geçersiz tarih veya saat");
  return d.toISOString();
}

/** Varsayılan başlangıç/bitiş için parçalar. */
export function defaultDateTimeParts(daysAgo = 0, hour = 8, minute = 0): DateTimeParts {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(hour)}:${pad(minute)}`,
  };
}

/** Saat metnini HH:mm biçimine normalize eder. */
export function normalizeTimeInput(raw: string): string {
  const cleaned = raw.replace(/[^\d:]/g, "");
  if (/^\d{1,2}:\d{0,2}$/.test(cleaned)) {
    const [h, m = ""] = cleaned.split(":");
    const hh = Math.min(23, Math.max(0, parseInt(h, 10) || 0));
    const mm = m === "" ? 0 : Math.min(59, Math.max(0, parseInt(m, 10) || 0));
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  if (/^\d{3,4}$/.test(cleaned)) {
    const padded = cleaned.padStart(4, "0");
    const hh = Math.min(23, parseInt(padded.slice(0, 2), 10));
    const mm = Math.min(59, parseInt(padded.slice(2), 10));
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return raw;
}
