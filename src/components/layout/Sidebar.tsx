"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  Calculator,
  CalendarDays,
  Languages,
  ListChecks,
  Mail,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function Divider() {
  return <hr className="my-1 border-rose-100/70 dark:border-[#2D222A]" />;
}

function SideLink({
  href,
  active,
  icon: Icon,
  indent = false,
  onNavigate,
  children,
}: {
  href: string;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  indent?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-xl py-2 text-sm font-medium transition",
        indent ? "pl-7 pr-3" : "px-3",
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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const { locale, toggleLocale } = useI18n();
  const pathname = usePathname();

  const is = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-rose-100/70 bg-white/95 dark:border-[#2D222A] dark:bg-[#1C161B]/95">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 overflow-visible border-b border-rose-100/70 px-4 py-3 dark:border-[#2D222A]"
        aria-label={locale === "tr" ? "Ana sayfa" : "Home"}
      >
        <BrandLogo size="lg" priority />
        <span className="text-base font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-100">
          Hayz
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <SideLink
          href="/hesaplama"
          active={is("/hesaplama")}
          icon={Calculator}
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "Hayz Hesaplama" : "Hayd Calculator"}
        </SideLink>

        <Divider />

        <GroupLabel>
          {locale === "tr" ? "Geçmiş Kayıtlarım" : "My History"}
        </GroupLabel>
        <SideLink
          href="/takvim"
          active={is("/takvim")}
          icon={CalendarDays}
          indent
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "Takvim" : "Calendar"}
        </SideLink>
        <SideLink
          href="/kaza"
          active={is("/kaza")}
          icon={ListChecks}
          indent
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "Kaza Defteri" : "Qada Tracker"}
        </SideLink>

        <Divider />

        <SideLink
          href="/bilgiler"
          active={is("/bilgiler")}
          icon={BookOpenText}
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "Hayz Bilgileri" : "Hayd Knowledge"}
        </SideLink>

        <Divider />

        <GroupLabel>{locale === "tr" ? "Ayarlar" : "Settings"}</GroupLabel>
        <SideLink
          href="/hesap"
          active={is("/hesap")}
          icon={UserRound}
          indent
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "Hesabım" : "My Account"}
        </SideLink>

        <Divider />

        <SideLink
          href="/iletisim"
          active={is("/iletisim")}
          icon={Mail}
          onNavigate={onNavigate}
        >
          {locale === "tr" ? "İletişim" : "Contact"}
        </SideLink>
      </nav>

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
          <span className="text-xs text-slate-400">
            {locale === "tr" ? "Dil" : "Language"}
          </span>
        </button>
      </div>
    </aside>
  );
}
