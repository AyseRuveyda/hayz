"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { FIQH_COLORS, type DischargeType, type KursufState, type PhysicalSymptom } from "@/types/cycle";
import { cn } from "@/lib/utils";

const DISCHARGES: {
  value: DischargeType;
  color: string;
  labelTR: string;
  labelEN: string;
}[] = [
  { value: "BLOOD_RED", color: FIQH_COLORS.hayz, labelTR: "Kan (kırmızı)", labelEN: "Blood (red)" },
  { value: "BROWN_SPOT", color: FIQH_COLORS.spotting, labelTR: "Kahverengi leke", labelEN: "Brown spot" },
  { value: "YELLOW", color: FIQH_COLORS.istihadha, labelTR: "Sarı akıntı", labelEN: "Yellow discharge" },
  { value: "WHITE_TUHR", color: FIQH_COLORS.tuhr, labelTR: "Beyaz (tuhur)", labelEN: "White (tuhr)" },
];

const SYMPTOMS: { value: PhysicalSymptom; labelTR: string; labelEN: string }[] = [
  { value: "CRAMPS", labelTR: "Sancı", labelEN: "Cramps" },
  { value: "HEADACHE", labelTR: "Baş ağrısı", labelEN: "Headache" },
  { value: "FATIGUE", labelTR: "Yorgunluk", labelEN: "Fatigue" },
  { value: "NAUSEA", labelTR: "Bulantı", labelEN: "Nausea" },
  { value: "BACK_PAIN", labelTR: "Bel ağrısı", labelEN: "Back pain" },
  { value: "OTHER", labelTR: "Diğer", labelEN: "Other" },
];

export type DailyLogDraft = {
  date: string;
  dischargeType: DischargeType;
  kursufState: KursufState;
  symptoms: PhysicalSymptom[];
  notes: string;
};

type Props = {
  open: boolean;
  date: string | null;
  initial?: Partial<DailyLogDraft>;
  onClose: () => void;
  onSave: (draft: DailyLogDraft) => void;
};

export function DailyLogModal({ open, date, initial, onClose, onSave }: Props) {
  const { locale } = useI18n();
  const [dischargeType, setDischargeType] = useState<DischargeType>("BLOOD_RED");
  const [kursufState, setKursufState] = useState<KursufState>("WET");
  const [symptoms, setSymptoms] = useState<PhysicalSymptom[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setDischargeType(initial?.dischargeType ?? "BLOOD_RED");
    setKursufState(initial?.kursufState ?? "WET");
    setSymptoms(initial?.symptoms ?? []);
    setNotes(initial?.notes ?? "");
  }, [open, initial]);

  if (!open || !date) return null;

  function toggleSymptom(s: PhysicalSymptom) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label={locale === "tr" ? "Kapat" : "Close"}
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-rose-100/70 bg-white p-5 shadow-2xl safe-bottom dark:border-[#2D222A] dark:bg-[#1C161B] sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {locale === "tr" ? "Hızlı günlük kayıt" : "Quick daily log"}
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {date}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-xl p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-[#241c23]"
            aria-label={locale === "tr" ? "Kapat" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="label-field">
          {locale === "tr" ? "Akıntı türü" : "Discharge type"}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {DISCHARGES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDischargeType(d.value)}
              className={cn(
                "touch-target flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition",
                dischargeType === d.value
                  ? "border-[#F42566] bg-rose-50 dark:bg-rose-950/30"
                  : "border-rose-100/70 dark:border-[#2D222A]"
              )}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {locale === "tr" ? d.labelTR : d.labelEN}
            </button>
          ))}
        </div>

        <p className="label-field">
          {locale === "tr" ? "Kürsüf durumu" : "Kursuf state"}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["WET", "DRY"] as KursufState[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKursufState(k)}
              className={cn(
                "touch-target rounded-xl border px-3 py-3 text-sm font-medium",
                kursufState === k
                  ? "border-[#F42566] bg-rose-50 dark:bg-rose-950/30"
                  : "border-rose-100/70 dark:border-[#2D222A]"
              )}
            >
              {k === "WET"
                ? locale === "tr"
                  ? "Islak"
                  : "Wet"
                : locale === "tr"
                  ? "Kuru"
                  : "Dry"}
            </button>
          ))}
        </div>

        <p className="label-field">
          {locale === "tr" ? "Fiziksel belirtiler" : "Physical symptoms"}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleSymptom(s.value)}
              className={cn(
                "touch-target rounded-full border px-3 py-2 text-xs font-medium",
                symptoms.includes(s.value)
                  ? "border-[#F42566] bg-[#F42566] text-white"
                  : "border-rose-100/70 dark:border-[#2D222A]"
              )}
            >
              {locale === "tr" ? s.labelTR : s.labelEN}
            </button>
          ))}
        </div>

        <label className="label-field" htmlFor="daily-notes">
          {locale === "tr" ? "Not" : "Notes"}
        </label>
        <textarea
          id="daily-notes"
          className="input-field mb-4 min-h-[80px] resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          type="button"
          className="btn-primary w-full touch-target"
          onClick={() =>
            onSave({
              date,
              dischargeType,
              kursufState,
              symptoms,
              notes,
            })
          }
        >
          {locale === "tr" ? "Kaydet" : "Save"}
        </button>
      </div>
    </div>
  );
}
