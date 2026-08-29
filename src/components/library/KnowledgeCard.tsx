"use client";

import { Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { KnowledgeItem } from "@/types/fiqh";

type Props = {
  item: KnowledgeItem;
};

export function KnowledgeCard({ item }: Props) {
  const { t, locale } = useI18n();
  const title = locale === "tr" ? item.titleTR : item.titleEN;
  const content = locale === "tr" ? item.contentTR : item.contentEN;
  const sources = locale === "tr" ? item.sourcesTR : item.sourcesEN;
  const category = locale === "tr" ? item.category : item.category;

  function handlePrint() {
    const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${title}</title>
      <style>
        body{font-family:Segoe UI,system-ui,sans-serif;padding:32px;color:#0f172a;line-height:1.6}
        h1{font-size:22px;margin:0 0 8px} .cat{color:#e11d48;font-size:12px;font-weight:700;text-transform:uppercase}
        .src{margin-top:24px;padding:16px;background:#f0fdf4;border-radius:12px}
      </style></head><body>
      <div class="cat">${category}</div>
      <h1>${title}</h1>
      <p>${content}</p>
      <div class="src"><strong>${t.knowledge.sources}</strong><br/>${sources}</div>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <article className="card-surface flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#E11D48] dark:bg-rose-950/40 dark:text-rose-300">
          {category}
        </span>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-[#E11D48] dark:hover:bg-[#241c23]"
          aria-label={t.knowledge.print}
          title={t.knowledge.print}
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {content}
      </p>

      <div
        className={cn(
          "mt-4 rounded-xl border border-emerald-100 bg-[#F0FDF4] p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30"
        )}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          {t.knowledge.sources}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
          {sources}
        </p>
      </div>
    </article>
  );
}
