"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 rounded-xl bg-rose-50/60 dark:bg-[#241c23]",
          compact ? "w-10" : "w-full"
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-rose-100/70 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 dark:border-[#2D222A] dark:bg-[#130F12] dark:text-slate-200 dark:hover:bg-[#241c23]",
        compact ? "justify-center px-2.5" : "w-full justify-between"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {!compact && (isDark ? t.common.dark : t.common.light)}
      </span>
      {!compact && (
        <span className="text-xs text-slate-400">{t.sidebar.appearance}</span>
      )}
    </button>
  );
}
