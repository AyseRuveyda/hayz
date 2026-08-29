"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Baby,
  BookOpenText,
  Calculator,
  CalendarDays,
  Droplets,
  Languages,
  ListChecks,
  Mail,
  Scale,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Madhhab } from "@/types/fiqh";

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SideLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-[#F42566]/10 text-[#E11D48] dark:bg-[#F42566]/15 dark:text-rose-300"
          : "text-slate-600 hover:bg-rose-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#241c23]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="leading-snug">{children}</span>
    </Link>
  );
}

export function Sidebar() {
  const { t, locale, toggleLocale } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const madhhab = (searchParams.get("madhhab") as Madhhab | null) ?? null;

  const madhhabHref = (value: Madhhab) =>
    `/hesaplama?madhhab=${encodeURIComponent(value)}`;

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-rose-100/70 bg-white/90 dark:border-[#2D222A] dark:bg-[#1C161B]/95">
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <NavSection title={t.sidebar.madhhabs}>
          <SideLink
            href={madhhabHref("MALIKI")}
            active={pathname.startsWith("/hesaplama") && madhhab === "MALIKI"}
            icon={Scale}
          >
            {t.sidebar.maliki}
          </SideLink>
          <SideLink
            href={madhhabHref("HANAFI")}
            active={
              pathname.startsWith("/hesaplama") &&
              (madhhab === "HANAFI" || madhhab === null)
            }
            icon={Scale}
          >
            {t.sidebar.hanafi}
          </SideLink>
          <SideLink
            href={madhhabHref("HANAFI_FOLLOWING_MALIKI")}
            active={
              pathname.startsWith("/hesaplama") &&
              madhhab === "HANAFI_FOLLOWING_MALIKI"
            }
            icon={Scale}
          >
            {t.sidebar.hanafiFollowing}
          </SideLink>
        </NavSection>

        <NavSection title={t.sidebar.special}>
          <SideLink href="/bilgiler?cat=istihadha" icon={Droplets}>
            {t.sidebar.istimrar}
          </SideLink>
          <SideLink href="/bilgiler?cat=rules" icon={Baby}>
            {t.sidebar.nifas}
          </SideLink>
        </NavSection>

        <NavSection title={t.sidebar.tools}>
          <SideLink
            href="/takvim"
            active={pathname.startsWith("/takvim")}
            icon={CalendarDays}
          >
            {locale === "tr" ? "Takvim" : "Calendar"}
          </SideLink>
          <SideLink
            href="/kaza"
            active={pathname.startsWith("/kaza")}
            icon={ListChecks}
          >
            {locale === "tr" ? "Kaza Defteri" : "Qada Tracker"}
          </SideLink>
          <SideLink
            href="/bilgiler"
            active={pathname.startsWith("/bilgiler")}
            icon={BookOpenText}
          >
            {t.sidebar.hayzInfo}
          </SideLink>
          <SideLink
            href="/hesaplama"
            active={pathname.startsWith("/hesaplama")}
            icon={Calculator}
          >
            {t.sidebar.calculation}
          </SideLink>
          <SideLink
            href="/hesap"
            active={pathname.startsWith("/hesap")}
            icon={UserRound}
          >
            {locale === "tr" ? "Hesabım" : "Account"}
          </SideLink>
          <SideLink href="mailto:destek@hayztakvimi.app" icon={Mail}>
            {t.sidebar.contact}
          </SideLink>
        </NavSection>
      </div>

      <div className="space-y-2 border-t border-rose-100/70 p-3 dark:border-[#2D222A]">
        <ThemeToggle />
        <button
          type="button"
          onClick={toggleLocale}
          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-rose-100/70 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 dark:border-[#2D222A] dark:bg-[#130F12] dark:text-slate-200 dark:hover:bg-[#241c23]"
        >
          <span className="inline-flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {locale === "tr" ? "Türkçe" : "English"}
          </span>
          <span className="text-xs text-slate-400">{t.sidebar.language}</span>
        </button>
      </div>
    </aside>
  );
}
