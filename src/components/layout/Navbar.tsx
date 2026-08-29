"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Calculator,
  CalendarDays,
  History,
  ListChecks,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { href: "/takvim", key: "calendar" as const, icon: CalendarDays },
  { href: "/hesaplama", key: "calculator" as const, icon: Calculator },
  { href: "/kaza", key: "qada" as const, icon: ListChecks },
  { href: "/bilgiler", key: "knowledge" as const, icon: BookOpen },
];

const mobileLinks = [
  ...desktopLinks,
  { href: "/hesap", key: "account" as const, icon: UserRound },
  { href: "/hesaplama#gecmis", key: "history" as const, icon: History },
];

export function Navbar() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const label = (key: string) => {
    if (key === "calendar") return locale === "tr" ? "Takvim" : "Calendar";
    if (key === "qada") return locale === "tr" ? "Kaza" : "Qada";
    if (key === "account") return locale === "tr" ? "Hesabım" : "Account";
    if (key === "history") return t.nav.history;
    if (key === "calculator") return t.nav.calculator;
    return t.nav.knowledge;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/70 bg-white/90 backdrop-blur-md safe-top dark:border-[#2D222A] dark:bg-[#1C161B]/95">
      <div className="flex h-14 min-h-[3.5rem] items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="touch-target shrink-0 rounded-xl p-2 text-slate-600 hover:bg-rose-50 lg:hidden dark:text-slate-300 dark:hover:bg-[#241c23]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={locale === "tr" ? "Menü" : "Menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F42566] to-[#E11D48] text-white shadow-sm sm:h-9 sm:w-9">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-slate-50">
                {t.app.name}
              </span>
              <span className="hidden truncate text-xs text-slate-500 md:block dark:text-slate-400">
                {t.app.shortName}
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
          {desktopLinks.map(({ href, key, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium transition xl:gap-2 xl:px-3",
                  active
                    ? "bg-rose-50 text-[#E11D48] dark:bg-[#2a1a22] dark:text-rose-300"
                    : "text-slate-600 hover:bg-rose-50/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#241c23]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:inline">{label(key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="touch-target rounded-xl p-2 text-slate-500 hover:bg-rose-50 dark:text-slate-300 dark:hover:bg-[#241c23]"
            aria-label={t.nav.notifications}
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            href="/hesaplama"
            className="btn-primary hidden px-3 py-2 text-xs sm:inline-flex sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">{t.nav.startCta}</span>
            <span className="sm:hidden">{locale === "tr" ? "Başla" : "Start"}</span>
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-rose-100/70 px-3 py-3 lg:hidden dark:border-[#2D222A]">
          <div className="flex flex-col gap-1">
            {mobileLinks.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="touch-target inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-rose-50 dark:text-slate-200 dark:hover:bg-[#241c23]"
              >
                <Icon className="h-4 w-4" />
                {label(key)}
              </Link>
            ))}
            <Link
              href="/hesaplama"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 w-full justify-center"
            >
              {t.nav.startCta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
