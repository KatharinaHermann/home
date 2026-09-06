"use client";
import { Glass, Eyebrow, Chip, Input } from "@/components/glass/Glass";
import { useStudio } from "@/lib/store";
import { fmt } from "@/lib/pricing";
import type { SourcePrefs } from "@/lib/types";

const SOURCES: { k: keyof Omit<SourcePrefs, "existing">; label: string; eg: string }[] = [
  { k: "luxury", label: "Design brands", eg: "Vitra, GUBI, Louis Poulsen, Farrow & Ball" },
  { k: "mid", label: "Mid-range", eg: "HAY, Muuto, West Elm, Westwing, Etsy" },
  { k: "budget", label: "Affordable", eg: "IKEA, H&M Home, Bauhaus, Amazon" },
  { k: "secondhand", label: "Second-hand", eg: "Facebook Marketplace, Kleinanzeigen" },
];

export function BudgetForm() {
  const budget = useStudio((s) => s.budget); const rooms = useStudio((s) => s.rooms); const setBudget = useStudio((s) => s.setBudget);
  return (
    <div className="space-y-4">
      <Glass className="p-5">
        <div className="flex items-end justify-between mb-2"><Eyebrow>Total budget</Eyebrow><span className="display text-3xl tabular-nums">{fmt(budget.total)}</span></div>
        <input type="range" className="range" min={500} max={60000} step={100} value={budget.total} onChange={(e) => setBudget({ total: +e.target.value })} />
        <div className="flex justify-between mono text-[10px] muted mt-1"><span>€500</span><span>€60k</span></div>
        <div className="flex gap-2 mt-3 flex-wrap">{[2000, 5000, 10000, 20000].map((v) => <Chip key={v} on={budget.total === v} onClick={() => setBudget({ total: v })}>{fmt(v)}</Chip>)}</div>
      </Glass>

      <Glass className="p-5 space-y-4">
        <div><Eyebrow>Where should we shop?</Eyebrow><p className="muted text-xs mt-0.5">Slide to say how much of each source you want. The agent mixes tiers to hit the budget with the best style fit.</p></div>
        {SOURCES.map((s) => (
          <div key={s.k}>
            <div className="flex items-center justify-between text-sm mb-1"><span className="font-medium">{s.label} <span className="muted text-xs">· {s.eg}</span></span><span className="mono text-xs muted">{Math.round(budget.prefs[s.k] * 100)}%</span></div>
            <input type="range" className="range" min={0} max={1} step={0.05} value={budget.prefs[s.k]} onChange={(e) => setBudget({ prefs: { ...budget.prefs, [s.k]: +e.target.value } })} />
          </div>
        ))}
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={budget.prefs.existing} onChange={(e) => setBudget({ prefs: { ...budget.prefs, existing: e.target.checked } })} className="w-4 h-4 accent-[var(--accent)]" />
          Reuse furniture I already own where it fits
        </label>
      </Glass>

      <Glass className="p-5 grid sm:grid-cols-2 gap-4">
        <div><Eyebrow className="mb-1.5">Pickup city</Eyebrow><Input value={budget.city} onChange={(e) => setBudget({ city: e.target.value })} /></div>
        <div><Eyebrow className="mb-1.5">Marketplace radius · {budget.radiusKm} km</Eyebrow><input type="range" className="range mt-3" min={5} max={100} step={5} value={budget.radiusKm} onChange={(e) => setBudget({ radiusKm: +e.target.value })} /></div>
        <div className="sm:col-span-2"><Eyebrow className="mb-1.5">Priority rooms · get a bigger share</Eyebrow>
          <div className="flex flex-wrap gap-1.5">{rooms.map((r) => <Chip key={r.id} on={budget.priorities.includes(r.id)} onClick={() => setBudget({ priorities: budget.priorities.includes(r.id) ? budget.priorities.filter((x) => x !== r.id) : [...budget.priorities, r.id] })}>{r.name}</Chip>)}</div>
        </div>
      </Glass>
    </div>
  );
}
