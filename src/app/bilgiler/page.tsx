"use client";

import { Search } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { KnowledgeCard } from "@/components/library/KnowledgeCard";
import { knowledgeItems } from "@/lib/knowledge-data";
import { useI18n } from "@/lib/i18n";
import type { KnowledgeCategoryKey } from "@/types/fiqh";

function BilgilerContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategoryKey>("all");

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (
      cat === "all" ||
      cat === "fasting" ||
      cat === "prayer" ||
      cat === "rules" ||
      cat === "hajj" ||
      cat === "istihadha"
    ) {
      setCategory(cat);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return knowledgeItems.filter((item) => {
      const catOk = category === "all" || item.categoryKey === category;
      if (!catOk) return false;
      if (!q) return true;
      const haystack = [
        item.titleTR,
        item.titleEN,
        item.contentTR,
        item.contentEN,
        item.category,
        item.sourcesTR,
        item.sourcesEN,
      ]
        .join(" ")
        .toLocaleLowerCase("tr");
      return haystack.includes(q);
    });
  }, [category, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {t.knowledge.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t.knowledge.subtitle}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.knowledge.search}
        />
      </div>

      <CategoryFilter value={category} onChange={setCategory} />

      {filtered.length === 0 ? (
        <p className="card-surface p-8 text-center text-sm text-slate-500">
          {t.knowledge.empty}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BilgilerPage() {
  return (
    <Suspense
      fallback={
        <div className="card-surface h-64 animate-pulse p-6 text-sm text-slate-400">
          …
        </div>
      }
    >
      <BilgilerContent />
    </Suspense>
  );
}
