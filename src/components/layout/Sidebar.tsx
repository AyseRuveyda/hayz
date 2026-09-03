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
  Sparkles,
  UserRound,
} from "lucide-react";
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
  children,
}: {
  href: string;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  indent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
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

export function Sidebar() {
  const { locale, toggleLocale } = useI18n();
  const pathname = usePathname();

  const is = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-rose-100/70 bg-white/90 dark:border-[#2D222A] dark:bg-[#1C161B]/95">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 border-b border-rose-100/70 px-4 py-4 dark:border-[#2D222A]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F42566] to-[#E11D48] text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
          {locale === "tr" ? "Hayz Takvimi" : "Hayz Calendar"}
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {/* Ana hesaplama */}
        <SideLink href="/hesaplama" active={is("/hesaplama")} icon={Calculator}>
          {locale === "tr" ? "Hayz Hesaplama" : "Hayd Calculator"}
        </SideLink>

        <Divider />

        {/* Geçmiş */}
        <GroupLabel>{locale === "tr" ? "Geçmiş Kayıtlarım" : "My History"}</GroupLabel>
        <SideLink href="/takvim" active={is("/takvim")} icon={CalendarDays} indent>
          {locale === "tr" ? "Takvim" : "Calendar"}
        </SideLink>
        <SideLink href="/kaza" active={is("/kaza")} icon={ListChecks} indent>
          {locale === "tr" ? "Kaza Defteri" : "Qada Tracker"}
        </SideLink>

        <Divider />

        {/* Kütüphane */}
        <GroupLabel>{locale === "tr" ? "Kütüphane" : "Library"}</GroupLabel>
        <SideLink href="/bilgiler" active={is("/bilgiler")} icon={BookOpenText} indent>
          {locale === "tr" ? "İlmihal Bilgisi" : "Knowledge Base"}
        </SideLink>

        <Divider />

        {/* Ayarlar */}
        <GroupLabel>{locale === "tr" ? "Ayarlar" : "Settings"}</GroupLabel>
        <SideLink href="/hesap" active={is("/hesap")} icon={UserRound} indent>
          {locale === "tr" ? "Hesabım" : "My Account"}
        </SideLink>

        <Divider />

        <SideLink href="mailto:destek@hayztakvimi.app" icon={Mail}>
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
