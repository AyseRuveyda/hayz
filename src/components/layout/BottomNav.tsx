"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calculator,
  CalendarDays,
  Home,
  ListChecks,
  UserRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", key: "home", icon: Home },
  { href: "/takvim", key: "calendar", icon: CalendarDays },
  { href: "/hesaplama", key: "calc", icon: Calculator },
  { href: "/kaza", key: "qada", icon: ListChecks },
  { href: "/bilgiler", key: "info", icon: BookOpen },
  { href: "/hesap", key: "account", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { locale } = useI18n();

  const labels: Record<(typeof items)[number]["key"], string> =
    locale === "tr"
      ? {
          home: "Ana",
          calendar: "Takvim",
          calc: "Hesap",
          qada: "Kaza",
          info: "Bilgi",
          account: "Hesap",
        }
      : {
          home: "Home",
          calendar: "Cal",
          calc: "Calc",
          qada: "Qada",
          info: "Info",
          account: "Me",
        };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100/70 bg-white/95 backdrop-blur-md safe-bottom dark:border-[#2D222A] dark:bg-[#1C161B]/95 lg:hidden">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between gap-0.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, key, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="min-w-[3.25rem] flex-1">
              <Link
                href={href}
                className={cn(
                  "touch-target flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[9px] font-semibold leading-tight sm:text-[10px]",
                  active
                    ? "text-[#E11D48]"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
                <span className="max-w-full truncate">{labels[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
