"use client";

import { Calculator, Droplets, Leaf, Sparkles } from "lucide-react";
import {
  CHART_COLORS,
  type ChartCell,
  type ChartCellKind,
  type ComparisonChartData,
} from "@/lib/comparison-chart";
import { cn } from "@/lib/utils";

type Props = {
  chart: ComparisonChartData;
  locale: "tr" | "en";
  onAddQada?: () => void;
  className?: string;
};

function kindBg(kind: ChartCellKind): string {
  switch (kind) {
    case "TUHR":
      return CHART_COLORS.tuhr;
    case "HAYZ":
      return CHART_COLORS.hayz;
    case "ISTIHADHA":
      return CHART_COLORS.istihadha;
    default:
      return CHART_COLORS.empty;
  }
}

function kindText(kind: ChartCellKind): string {
  return kind === "EMPTY" ? "#A8A29E" : "#fff";
}

function DayCell({
  cell,
  locale,
  size,
}: {
  cell: ChartCell;
  locale: "tr" | "en";
  size: number;
}) {
  return (
    <div
      className="relative flex shrink-0 flex-col items-center justify-center rounded-md border border-black/10 text-center shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: kindBg(cell.kind),
        color: kindText(cell.kind),
      }}
      title={locale === "tr" ? cell.labelTR : cell.labelEN}
    >
      <span className="text-[10px] font-bold leading-none sm:text-[11px]">
        {cell.col}
      </span>
      {cell.dayOfMonth != null && cell.kind !== "EMPTY" && (
        <span className="mt-0.5 text-[8px] font-medium opacity-90 sm:text-[9px]">
          {cell.dayOfMonth}
        </span>
      )}
    </div>
  );
}

function Row({
  label,
  cells,
  locale,
  cellSize,
}: {
  label: string;
  cells: ChartCell[];
  locale: "tr" | "en";
  cellSize: number;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="w-[72px] shrink-0 text-[10px] font-bold uppercase leading-tight tracking-wide sm:w-24 sm:text-[11px]"
        style={{ color: CHART_COLORS.fuchsia }}
      >
        {label}
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {cells.map((c, i) => (
          <DayCell key={`${label}-${i}`} cell={c} locale={locale} size={cellSize} />
        ))}
      </div>
    </div>
  );
}

export function ComparisonRuler({
  chart,
  locale,
  onAddQada,
  className,
}: Props) {
  const cellSize = 36;
  const gap = 6; // approx gap-1.5
  const labelW = 96;
  const rowPad = 8;

  return (
    <section
      id="cetvel"
      className={cn(
        "overflow-hidden rounded-3xl border border-[#F42566]/20 shadow-sm",
        className
      )}
      style={{ backgroundColor: CHART_COLORS.page }}
    >
      <div className="border-b border-[#F42566]/15 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: CHART_COLORS.fuchsia }} />
          <h2
            className="text-base font-bold sm:text-lg"
            style={{ color: CHART_COLORS.ink }}
          >
            {locale === "tr"
              ? "Hayz ve İstihâze Karşılaştırmalı Cetveli"
              : "Hayd & Istihadha Comparison Ruler"}
          </h2>
        </div>
        <p className="mt-1 text-xs text-stone-500 sm:text-sm">
          {locale === "tr"
            ? `Üst: Son Sahih Ay (${chart.topCycleDays} gün) · Alt: Yeni Ay (${chart.bottomCycleDays} gün) · Izgara: ${chart.columnCount} sütun`
            : `Top: Last valid month (${chart.topCycleDays}d) · Bottom: Current (${chart.bottomCycleDays}d) · Grid: ${chart.columnCount} cols`}
          {chart.overlapRule
            ? locale === "tr"
              ? ` · ${chart.overlapRule === "RASTLAYAN" ? "Rastlayan" : "Rastlamayan"} kaidesi`
              : ` · ${chart.overlapRule === "RASTLAYAN" ? "Overlap" : "Non-overlap"} rule`
            : ""}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-3 sm:px-6">
        {(
          [
            { kind: "TUHR" as const, tr: "Temizlik", en: "Purity" },
            { kind: "HAYZ" as const, tr: "Hayz", en: "Hayd" },
            { kind: "ISTIHADHA" as const, tr: "İstihâze", en: "Istihadha" },
          ] as const
        ).map((l) => (
          <span
            key={l.kind}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-700"
          >
            <span
              className="h-3 w-3 rounded-sm border border-black/10"
              style={{ backgroundColor: kindBg(l.kind) }}
            />
            {locale === "tr" ? l.tr : l.en}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-700">
          <span className="h-3 w-0 border-l-2 border-dashed border-black" />
          {locale === "tr" ? "Hizalama / Rastlama" : "Alignment / Overlap"}
        </span>
      </div>

      {/* Dual grid with dashed alignment lines */}
      <div className="px-2 pb-4 sm:px-4">
        <div
          className="overflow-x-auto rounded-2xl border border-[#F42566]/10 p-3 sm:p-4"
          style={{ backgroundColor: CHART_COLORS.card }}
        >
          <div className="relative min-w-max">
            {/* SVG dashed vertical lines */}
            <svg
              className="pointer-events-none absolute inset-0 z-10"
              width="100%"
              height="100%"
              aria-hidden
            >
              {chart.alignmentColumns.map((colIdx) => {
                const x =
                  labelW +
                  rowPad +
                  colIdx * (cellSize + gap) +
                  cellSize / 2;
                return (
                  <line
                    key={`align-${colIdx}`}
                    x1={x}
                    y1={2}
                    x2={x}
                    y2="98%"
                    stroke="#000000"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    opacity={1}
                  />
                );
              })}
            </svg>

            <div className="relative z-0 space-y-4 py-1">
              <Row
                label={locale === "tr" ? "Son Sahih Ay" : "Last Valid"}
                cells={chart.topCells}
                locale={locale}
                cellSize={cellSize}
              />
              <div className="ml-[72px] border-t border-dashed border-black/40 sm:ml-24" />
              <Row
                label={locale === "tr" ? "Yeni / Karışık Ay" : "New / Mixed"}
                cells={chart.bottomCells}
                locale={locale}
                cellSize={cellSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fıkhi Hükümler ve Amel Tablosu */}
      <div className="border-t border-[#F42566]/15 px-4 py-5 sm:px-6">
        <h3
          className="mb-3 text-sm font-bold sm:text-base"
          style={{ color: CHART_COLORS.ink }}
        >
          {locale === "tr"
            ? "Fıkhi Hükümler ve Amel Tablosu"
            : "Fiqh Rulings & Practice"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <RulingCard
            icon={Leaf}
            title={locale === "tr" ? "Temizlik" : "Purity"}
            value={`${chart.currentTuhurDays} ${locale === "tr" ? "gün" : "days"}`}
            hint={
              locale === "tr"
                ? `Önceki sahih temizlik: ${chart.habitTuhurDays} gün`
                : `Last valid purity: ${chart.habitTuhurDays} days`
            }
            bg={CHART_COLORS.tuhrSoft}
            accent={CHART_COLORS.tuhr}
          />
          <RulingCard
            icon={Droplets}
            title={locale === "tr" ? "Hayz" : "Hayd"}
            value={`${chart.hayzDays} ${locale === "tr" ? "gün" : "days"}`}
            hint={
              locale === "tr"
                ? `Önceki sahih hayz: ${chart.habitHayzDays} gün`
                : `Last valid hayd: ${chart.habitHayzDays} days`
            }
            bg={CHART_COLORS.hayzSoft}
            accent={CHART_COLORS.hayz}
          />
          <RulingCard
            icon={Calculator}
            title={locale === "tr" ? "İstihâze" : "Istihadha"}
            value={`${chart.istihadhaDays} ${locale === "tr" ? "gün" : "days"}`}
            hint={
              locale === "tr"
                ? `Kaza günü: ${chart.kazayaKalanGunler} (≈${chart.kazayaKalanGunler * 5} vakit)`
                : `Makeup days: ${chart.kazayaKalanGunler} (≈${chart.kazayaKalanGunler * 5} prayers)`
            }
            bg={CHART_COLORS.istihadhaSoft}
            accent={CHART_COLORS.istihadha}
          />
        </div>

        {onAddQada && chart.kazayaKalanGunler > 0 && (
          <button
            type="button"
            onClick={onAddQada}
            className="btn-primary mt-4 w-full sm:w-auto"
          >
            <Calculator className="h-4 w-4" />
            {locale === "tr"
              ? `Kaza Hesapla (${chart.kazayaKalanGunler * 5} vakit)`
              : `Add makeup (${chart.kazayaKalanGunler * 5} prayers)`}
          </button>
        )}
      </div>
    </section>
  );
}

function RulingCard({
  icon: Icon,
  title,
  value,
  hint,
  bg,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  value: string;
  hint: string;
  bg: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-black/5 p-4 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
          {title}
        </span>
      </div>
      <p className="text-lg font-bold text-stone-900">{value}</p>
      <p className="mt-1 text-[11px] text-stone-600">{hint}</p>
    </div>
  );
}
