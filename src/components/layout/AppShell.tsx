"use client";

import { Menu, X } from "lucide-react";
import { Suspense, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FiqhChatDrawer } from "@/components/chat/FiqhChatDrawer";
import { NotificationBootstrap } from "@/components/providers/NotificationBootstrap";
import { useI18n } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale } = useI18n();

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Suspense fallback={<div className="w-[260px]" />}>
          <Sidebar />
        </Suspense>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label={locale === "tr" ? "Menüyü kapat" : "Close menu"}
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-[260px] shadow-xl">
            <Suspense fallback={<div className="h-full w-[260px] bg-white" />}>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-rose-100/70 bg-white/90 px-3 backdrop-blur-md safe-top dark:border-[#2D222A] dark:bg-[#1C161B]/95 lg:hidden">
          <button
            type="button"
            className="touch-target rounded-xl p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={locale === "tr" ? "Menü" : "Menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="flex items-center gap-2 text-base font-semibold leading-none text-slate-800 dark:text-slate-100">
            <BrandLogo size="md" priority />
            Hayz
          </span>
        </header>

        <main className="min-w-0 flex-1 px-3 py-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <BottomNav />
      <FiqhChatDrawer />
      <NotificationBootstrap />
    </div>
  );
}
