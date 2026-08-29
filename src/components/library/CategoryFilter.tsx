"use client";

import { useI18n } from "@/lib/i18n";
import { knowledgeCategories } from "@/lib/knowledge-data";
import { cn } from "@/lib/utils";
import type { KnowledgeCategoryKey } from "@/types/fiqh";

type Props = {
  value: KnowledgeCategoryKey;
  onChange: (value: KnowledgeCategoryKey) => void;
};

export function CategoryFilter({ value, onChange }: Props) {
  const { locale } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      {knowledgeCategories.map((cat) => {
        const active = value === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              active
                ? "bg-[#F42566] text-white shadow-sm"
                : "border border-rose-100/70 bg-white text-slate-600 hover:bg-rose-50 dark:border-[#2D222A] dark:bg-[#1C161B] dark:text-slate-300 dark:hover:bg-[#241c23]"
            )}
          >
            {locale === "tr" ? cat.labelTR : cat.labelEN}
          </button>
        );
      })}
    </div>
  );
}
