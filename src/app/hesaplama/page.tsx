import { Suspense } from "react";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";

export default function HesaplamaPage() {
  return (
    <Suspense
      fallback={
        <div className="card-surface h-64 animate-pulse p-6 text-sm text-slate-400">
          …
        </div>
      }
    >
      <CalculatorForm />
    </Suspense>
  );
}
