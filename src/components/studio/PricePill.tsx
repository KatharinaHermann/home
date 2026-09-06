"use client";
import { useEffect, useRef, useState } from "react";
import { Glass } from "@/components/glass/Glass";
import { planTotal, useStudio } from "@/lib/store";
import { fmt } from "@/lib/pricing";

function useAnimatedNumber(value: number, ms = 600) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(); const f = from.current; let raf = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - start) / ms); const e = 1 - Math.pow(1 - p, 3); setV(f + (value - f) * e); if (p < 1) raf = requestAnimationFrame(tick); else from.current = value; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

export function PricePill() {
  const plan = useStudio((s) => s.plan);
  const budget = useStudio((s) => s.budget.total);
  const total = useAnimatedNumber(planTotal(plan));
  if (!plan) return null;
  const pct = Math.min(1, total / Math.max(1, budget));
  const over = total > budget;
  return (
    <Glass strong pill className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40 px-4 py-2.5 flex items-center gap-3 fade-in">
      <div className="relative w-9 h-9 shrink-0">
        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="color-mix(in oklab, var(--ink) 12%, transparent)" strokeWidth="4" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={over ? "#d9534f" : "var(--accent)"} strokeWidth="4" strokeDasharray={`${pct * 94.2} 94.2`} strokeLinecap="round" style={{ transition: "stroke-dasharray 500ms" }} />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="mono text-[10px] uppercase tracking-widest muted">Running total</div>
        <div className="display text-xl tabular-nums" style={{ color: over ? "#d9534f" : "var(--ink)" }}>{fmt(Math.round(total))}<span className="text-sm muted"> / {fmt(budget)}</span></div>
      </div>
    </Glass>
  );
}
