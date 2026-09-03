"use client";

import { useCallback, useEffect, useState } from "react";
import { QadaTracker } from "@/components/tracker/QadaTracker";
import { loadCycles, loadQada, saveQada } from "@/lib/data-sync";
import { useI18n } from "@/lib/i18n";
import { uid } from "@/lib/local-store";
import { countHayzOverlapWithRange } from "@/lib/calendar-map";
import type { CycleRecord, QadaItem } from "@/types/cycle";

export default function KazaPage() {
  const { locale } = useI18n();
  const [items, setItems] = useState<QadaItem[]>([]);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [ramadanStart, setRamadanStart] = useState("");
  const [ramadanEnd, setRamadanEnd] = useState("");

  const refresh = useCallback(async () => {
    setItems(await loadQada());
    setCycles(await loadCycles());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function decrement(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.remaining <= 0) return;
    await saveQada({
      ...item,
      remaining: item.remaining - 1,
      updatedAt: new Date().toISOString(),
    });
    await refresh();
  }

  async function addFromCycle(cycle: CycleRecord) {
    const count = cycle.qadaPrayersCount || Math.ceil(cycle.istihadhaDays) * 5;
    if (count <= 0) return;
    const now = new Date().toISOString();
    await saveQada({
      id: uid(),
      kind: "PRAYER",
      remaining: count,
      total: count,
      source: "istihadha_auto",
      relatedCycleId: cycle.id,
      noteTR: `İstihâze günlerinden otomatik kaza (${cycle.istihadhaDays.toFixed(2)} gün × 5)`,
      noteEN: `Auto qada from istihadha (${cycle.istihadhaDays.toFixed(2)} days × 5)`,
      createdAt: now,
      updatedAt: now,
    });
    await refresh();
  }

  async function addRamadanFasts() {
    if (!ramadanStart || !ramadanEnd) return;
    const days = countHayzOverlapWithRange(cycles, ramadanStart, ramadanEnd);
    if (days <= 0) return;
    const now = new Date().toISOString();
    await saveQada({
      id: uid(),
      kind: "FAST",
      remaining: days,
      total: days,
      source: "ramadan_hayz",
      noteTR: `Ramazan hayz örtüşmesi: ${days} gün oruç kazası`,
      noteEN: `Ramadan hayd overlap: ${days} makeup fasts`,
      createdAt: now,
      updatedAt: now,
    });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {locale === "tr" ? "Kaza İbadetleri Defteri" : "Qada Worship Tracker"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {locale === "tr"
            ? "İstihâze namazları ve Ramazan hayz oruçları için sayaç."
            : "Counters for istihadha prayers and Ramadan hayd fasts."}
        </p>
      </div>

      <div className="card-surface space-y-3 p-4">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {locale === "tr"
            ? "Ramazan hayz örtüşmesi (manuel tarih aralığı)"
            : "Ramadan hayd overlap (manual date range)"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="date"
            className="input-field"
            value={ramadanStart}
            onChange={(e) => setRamadanStart(e.target.value)}
          />
          <input
            type="date"
            className="input-field"
            value={ramadanEnd}
            onChange={(e) => setRamadanEnd(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-primary touch-target"
          onClick={() => void addRamadanFasts()}
        >
          {locale === "tr" ? "Kaza orucu ekle" : "Add makeup fasts"}
        </button>
      </div>

      <QadaTracker
        items={items}
        cycles={cycles}
        onDecrement={(id) => void decrement(id)}
        onAddFromCycle={(c) => void addFromCycle(c)}
      />
    </div>
  );
}
