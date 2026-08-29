"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, CalendarDays, ListChecks } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t, locale } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-rose-100/70 bg-white/80 p-8 shadow-sm dark:border-[#2D222A] dark:bg-[#1C161B]/80 sm:p-12">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#F42566]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />

      <p className="text-sm font-semibold uppercase tracking-wider text-[#E11D48]">
        {t.app.name}
      </p>
      <h1 className="mt-3 max-w-2xl text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
        {t.home.title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {t.home.subtitle}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/takvim" className="btn-primary touch-target">
          <CalendarDays className="h-4 w-4" />
          {locale === "tr" ? "Takvime git" : "Open calendar"}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/hesaplama" className="btn-ghost touch-target">
          <Calculator className="h-4 w-4" />
          {t.home.openCalculator}
        </Link>
        <Link href="/kaza" className="btn-ghost touch-target">
          <ListChecks className="h-4 w-4" />
          {locale === "tr" ? "Kaza defteri" : "Qada tracker"}
        </Link>
        <Link href="/bilgiler" className="btn-ghost touch-target">
          <BookOpen className="h-4 w-4" />
          {t.home.openKnowledge}
        </Link>
      </div>
    </section>
  );
}
