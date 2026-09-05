"use client";

import { CircleHelp } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type FieldHintProps = {
  text: string;
  className?: string;
  /** Accessible name for the info button */
  label?: string;
};

/**
 * Small info icon next to a field label.
 * Hover (desktop) or click/tap opens a short explanation of what to enter.
 * Click pins the tip open until outside click / Escape (mobile-friendly).
 */
export function FieldHint({
  text,
  className,
  label = "Bilgi",
}: FieldHintProps) {
  const [open, setOpen] = useState(false);
  const pinnedRef = useRef(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        pinnedRef.current = false;
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        pinnedRef.current = false;
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex shrink-0 align-middle", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinnedRef.current) setOpen(false);
      }}
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-[#F42566] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F42566]/40 dark:hover:bg-[#2A1F28] dark:hover:text-rose-300"
        aria-label={label}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          pinnedRef.current = !pinnedRef.current;
          setOpen(pinnedRef.current);
        }}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden />
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 top-[calc(100%+0.35rem)] z-50 w-56 -translate-x-1/2 rounded-xl border border-rose-100/90 bg-white px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-slate-600 shadow-lg dark:border-[#3A2D36] dark:bg-[#1A1419] dark:text-slate-200 sm:w-64"
        >
          {text}
        </span>
      )}
    </span>
  );
}

type FieldLabelProps = {
  children: ReactNode;
  hint: string;
  htmlFor?: string;
  as?: "label" | "span" | "p";
  className?: string;
  hintLabel?: string;
};

/** Label row with an adjacent info tip. */
export function FieldLabel({
  children,
  hint,
  htmlFor,
  as = "label",
  className,
  hintLabel,
}: FieldLabelProps) {
  const Comp = as;
  const content = (
    <>
      <span>{children}</span>
      <FieldHint text={hint} label={hintLabel} />
    </>
  );

  if (Comp === "label") {
    return (
      <label
        htmlFor={htmlFor}
        className={cn(
          "label-field inline-flex items-center gap-1.5",
          className
        )}
      >
        {content}
      </label>
    );
  }

  return (
    <Comp
      className={cn(
        "label-field inline-flex items-center gap-1.5",
        className
      )}
    >
      {content}
    </Comp>
  );
}
