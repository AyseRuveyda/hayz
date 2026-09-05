"use client";

import {
  combineDateTime,
  type DateTimeParts,
  normalizeTimeInput,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/FieldHint";

type Props = {
  idPrefix: string;
  label: string;
  value: DateTimeParts;
  onChange: (value: DateTimeParts) => void;
  className?: string;
  timeHint?: string;
  /** Explanation shown next to the field label via info icon */
  info?: string;
  infoLabel?: string;
  dateLabel?: string;
  timeLabel?: string;
};

export function DateTimeField({
  idPrefix,
  label,
  value,
  onChange,
  className,
  timeHint = "24 saat (ör. 14:30)",
  info,
  infoLabel,
  dateLabel = "Tarih",
  timeLabel = "Saat",
}: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      {info ? (
        <FieldLabel as="span" hint={info} hintLabel={infoLabel} className="mb-0">
          {label}
        </FieldLabel>
      ) : (
        <span className="label-field">{label}</span>
      )}
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        <div>
          <label className="sr-only" htmlFor={`${idPrefix}-date`}>
            {dateLabel}
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            className="input-field"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="sr-only" htmlFor={`${idPrefix}-time`}>
            {timeLabel}
          </label>
          <input
            id={`${idPrefix}-time`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="08:00"
            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
            title={timeHint}
            className="input-field font-mono tabular-nums"
            value={value.time}
            onChange={(e) =>
              onChange({ ...value, time: e.target.value })
            }
            onBlur={(e) =>
              onChange({
                ...value,
                time: normalizeTimeInput(e.target.value) || "08:00",
              })
            }
            required
          />
          <p className="mt-1 text-[11px] text-slate-400">{timeHint}</p>
        </div>
      </div>
      <input
        type="hidden"
        value={combineDateTime(value)}
        readOnly
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
