"use client";

import { Search } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { KnowledgeCard } from "@/components/library/KnowledgeCard";
import { glossaryTerms } from "@/lib/glossary-data";
import { knowledgeItems } from "@/lib/knowledge-data";
import { useI18n } from "@/lib/i18n";
import type { KnowledgeCategoryKey } from "@/types/fiqh";

const VALID_CATS: KnowledgeCategoryKey[] = [
  "all",
  "glossary",
  "fasting",
  "prayer",
  "rules",
  "maliki",
  "hajj",
  "istihadha",
];

function BilgilerContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategoryKey>("all");

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && (VALID_CATS as string[]).includes(cat)) {
      setCategory(cat as KnowledgeCategoryKey);
    }
  }, [searchParams]);

  const q = query.trim().toLocaleLowerCase("tr");

  const filteredKnowledge = useMemo(() => {
    if (category === "glossary") return [];
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
  }, [category, q]);

  const filteredGlossary = useMemo(() => {
    if (category !== "all" && category !== "glossary") return [];
    return glossaryTerms.filter((term) => {
      if (!q) return true;
      const haystack = [
        term.termTR,
        term.termEN,
        term.definitionTR,
        term.definitionEN,
      ]
        .join(" ")
        .toLocaleLowerCase("tr");
      return haystack.includes(q);
    });
  }, [category, q]);

  const showGlossary = category === "all" || category === "glossary";
  const showKnowledge = category !== "glossary";
  const empty =
    filteredKnowledge.length === 0 && filteredGlossary.length === 0;

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

      {empty ? (
        <p className="card-surface p-8 text-center text-sm text-slate-500">
          {t.knowledge.empty}
        </p>
      ) : (
        <div className="space-y-8">
          {showGlossary && filteredGlossary.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#E11D48]">
                {locale === "tr"
                  ? "Sözlük — Hayz ile ilgili kelimeler"
                  : "Glossary — Hayd terms"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGlossary.map((term) => (
                  <article
                    key={term.id}
                    className="rounded-2xl border border-rose-100/80 bg-white p-4 shadow-sm dark:border-[#2D222A] dark:bg-[#1C161B]"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                      {locale === "tr" ? term.termTR : term.termEN}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {locale === "tr" ? term.definitionTR : term.definitionEN}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {showKnowledge && filteredKnowledge.length > 0 && (
            <section className="space-y-3">
              {showGlossary && (
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {locale === "tr" ? "Konu kartları" : "Topic cards"}
                </h2>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {filteredKnowledge.map((item) => (
                  <KnowledgeCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
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
