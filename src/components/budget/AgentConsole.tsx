"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Glass, Button, Eyebrow } from "@/components/glass/Glass";
import { planTotal, useStudio } from "@/lib/store";
import { readEvents } from "@/lib/stream";
import type { AgentEvent, Plan } from "@/lib/types";
import { fmt } from "@/lib/pricing";

export function AgentConsole() {
  const { rooms, design, budget, connectors, plan, setPlan } = useStudio();
  const [log, setLog] = useState<Extract<AgentEvent, { type: "log" }>[]>([]);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const run = async () => {
    setBusy(true); setLog([]); setSources({});
    try {
      const res = await fetch("/api/agents/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rooms, design, budget, connectors }) });
      await readEvents(res, (e) => {
        if (e.type === "log") { setLog((l) => [...l, e]); setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0); }
        if (e.type === "source") setSources((s) => ({ ...s, [e.source]: e.found }));
        if (e.type === "plan") setPlan(e.plan as Plan);
      });
    } finally { setBusy(false); }
  };
  const total = planTotal(plan);
  return (
    <Glass strong className="p-5 xl:sticky xl:top-6 self-start">
      <div className="flex items-center gap-2 mb-1"><Bot size={18} /><span className="display text-xl">Budget → product agent</span></div>
      <p className="muted text-xs mb-4">Fans out to every enabled source, scores each product on style, colour and source fit, then optimises the mix to your budget.</p>
      <Button variant="accent" className="w-full" onClick={run} disabled={busy || rooms.length === 0}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {busy ? "Working…" : plan ? "Run again" : "Find my products"}</Button>
      {(log.length > 0 || busy) && (
        <div className="mt-4 rounded-[calc(var(--radius)*.6)] p-3 max-h-64 overflow-y-auto mono text-[11px] leading-relaxed" style={{ background: "color-mix(in oklab, var(--ink) 88%, transparent)", color: "#e8e6e0" }}>
          {log.map((l, i) => <div key={i} style={{ color: l.level === "ok" ? "#9be3a6" : l.level === "warn" ? "#f3c980" : undefined }}>› {l.text}</div>)}
          {busy && <div className="opacity-60">› …</div>}
          <div ref={bottom} />
        </div>
      )}
      {Object.keys(sources).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">{Object.entries(sources).map(([s, n]) => <span key={s} className="chip">{s} · {n}</span>)}</div>
      )}
      {plan && !busy && (
        <div className="mt-4 fade-in">
          <Eyebrow className="mb-1">Proposed plan</Eyebrow>
          <div className="display text-2xl tabular-nums">{fmt(total)} <span className="muted text-sm">of {fmt(plan.budget)}</span></div>
          <div className="muted text-xs">{plan.items.filter((i) => i.productId).length} products across {rooms.length} rooms · {Math.round((1 - total / plan.budget) * 100)}% headroom</div>
          <Link href="/studio/products" className="btn btn-accent w-full mt-3">Open tagged room tour <ArrowRight size={14} /></Link>
        </div>
      )}
    </Glass>
  );
}
