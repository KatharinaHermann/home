"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Loader2, Handshake, ShoppingCart, PackageCheck, ShieldCheck, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/studio/PageHeader";
import { Glass, Button, Eyebrow, Chip } from "@/components/glass/Glass";
import { productById, SOURCE_META, type Product } from "@/lib/catalog";
import { planTotal, useStudio } from "@/lib/store";
import { fmt } from "@/lib/pricing";
import { readEvents } from "@/lib/stream";
import type { Order, PlacedProduct } from "@/lib/types";
import { ProductThumb } from "@/components/products/ProductThumb";

type Group = { kind: "negotiate" | "order" | "existing"; label: string; icon: React.ReactNode; items: { item: PlacedProduct; p: Product }[] };

export function OrderAgent() {
  const { plan, rooms, orders, connectors, upsertOrder, setOrders } = useStudio();
  const [busy, setBusy] = useState(false); const [tone, setTone] = useState<"friendly" | "direct">("friendly");
  const [discount, setDiscount] = useState(0.18); const [maxAuto, setMaxAuto] = useState(600);
  const [authOrders, setAuthOrders] = useState(false); const [authNeg, setAuthNeg] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const confirmed = useMemo(() => (plan?.items ?? []).filter((i) => i.status === "confirmed" && i.productId).map((item) => ({ item, p: productById(item.productId!)! })).filter((x) => x.p), [plan]);
  const groups: Group[] = [
    { kind: "negotiate", label: "Negotiate on marketplaces", icon: <Handshake size={16} />, items: confirmed.filter((x) => SOURCE_META[x.p.source].kind === "marketplace" && x.p.condition === "used") },
    { kind: "order", label: "Place orders", icon: <ShoppingCart size={16} />, items: confirmed.filter((x) => SOURCE_META[x.p.source].kind === "retailer" || (SOURCE_META[x.p.source].kind === "marketplace" && x.p.condition === "new")) },
    { kind: "existing", label: "Already yours", icon: <PackageCheck size={16} />, items: confirmed.filter((x) => x.p.source === "existing") },
  ];
  const total = planTotal(plan);
  const negotiable = groups[0].items.reduce((a, x) => a + x.item.price, 0);
  const savingsTarget = Math.round(negotiable * discount);

  const run = async () => {
    setBusy(true); setLog([]); setOrders([]);
    try {
      const res = await fetch("/api/agents/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: confirmed.map((x) => x.item), rooms, tone, discount, maxAuto, authOrders, authNeg, connectors }) });
      await readEvents(res, (e) => { if (e.type === "log") setLog((l) => [...l, e.text]); if (e.type === "order") upsertOrder(e.order as Order); });
    } finally { setBusy(false); }
  };

  if (!plan || confirmed.length === 0) return (
    <div><PageHeader step="Step 6 · Buy & negotiate" title="Nothing confirmed yet." blurb="Confirm products in the tagged tour first." /><Link href="/studio/products" className="btn btn-accent">Back to products <ArrowRight size={14} /></Link></div>
  );
  const agreed = orders.reduce((a, o) => a + (o.finalPrice ?? o.listPrice), 0);

  return (
    <div>
      <PageHeader step="Step 6 · Buy & negotiate" title={<>Let the agent <span className="display-italic accent">close the deals.</span></>} blurb="Confirmed products are listed by how they are bought. Marketplace items get a negotiation thread within your limits; retailer items are ordered with your explicit authorisation." />
      <div className="grid xl:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4 min-w-0">
          {groups.map((g) => g.items.length > 0 && (
            <Glass key={g.kind} className="p-4">
              <div className="flex items-center gap-2 mb-3"><span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)" }}>{g.icon}</span><span className="font-medium">{g.label}</span><span className="muted text-xs">· {g.items.length} items · {fmt(g.items.reduce((a, x) => a + x.item.price, 0))}</span></div>
              <div className="space-y-2">
                {g.items.map(({ item, p }) => {
                  const o = orders.find((x) => x.key === item.key);
                  return (
                    <div key={item.key} className="p-3 rounded-[calc(var(--radius)*.6)]" style={{ background: "color-mix(in oklab, var(--ink) 5%, transparent)" }}>
                      <div className="flex items-center gap-3">
                        <ProductThumb p={p} size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="muted text-[11px]">{SOURCE_META[p.source].label}{p.meta?.seller ? ` · ${p.meta.seller} · ${p.meta.distanceKm} km` : ""} · {rooms.find((r) => r.id === item.roomId)?.name}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="tabular-nums text-sm">{o?.finalPrice !== undefined && o.finalPrice !== item.price ? <><s className="muted mr-1">{fmt(item.price)}</s>{fmt(o.finalPrice)}</> : fmt(item.price)}</div>
                          <div className="mono text-[10px]" style={{ color: o?.status === "agreed" || o?.status === "ordered" ? "var(--accent)" : "var(--ink-muted)" }}>{o?.status ?? (g.kind === "negotiate" ? `target ${fmt(Math.round(item.price * (1 - discount)))}` : g.kind === "order" ? "ready" : "keep")}</div>
                        </div>
                      </div>
                      {o && o.thread.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {o.thread.map((m, i) => (
                            <div key={i} className={`text-[12px] flex gap-2 ${m.from === "seller" ? "" : ""}`}>
                              <span className="mono text-[10px] muted w-12 shrink-0 pt-0.5">{m.from}</span>
                              <span className="px-2.5 py-1.5 rounded-xl" style={{ background: m.from === "seller" ? "var(--glass-strong)" : m.from === "agent" ? "color-mix(in oklab, var(--accent) 22%, transparent)" : "transparent", fontStyle: m.from === "system" ? "italic" : undefined }}>{m.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Glass>
          ))}
        </div>

        <Glass strong className="p-5 xl:sticky xl:top-6 self-start space-y-4">
          <div className="flex items-center gap-2"><Bot size={18} /><span className="display text-xl">Checkout agent</span></div>
          <div>
            <div className="flex justify-between text-sm"><span>Confirmed total</span><span className="tabular-nums">{fmt(total)}</span></div>
            <div className="flex justify-between text-sm muted"><span>Negotiable ({groups[0].items.length})</span><span className="tabular-nums">{fmt(negotiable)}</span></div>
            <div className="flex justify-between text-sm" style={{ color: "var(--accent)" }}><span>Target savings</span><span className="tabular-nums">−{fmt(savingsTarget)}</span></div>
            {orders.length > 0 && <div className="flex justify-between display text-lg mt-1 pt-1 border-t hairline"><span>After agent</span><span className="tabular-nums">{fmt(agreed + confirmed.filter((x) => !orders.some((o) => o.key === x.item.key)).reduce((a, x) => a + x.item.price, 0))}</span></div>}
          </div>
          <div>
            <Eyebrow className="mb-1.5">Negotiation · open at {Math.round(discount * 100)}% below asking</Eyebrow>
            <input type="range" className="range" min={0} max={0.4} step={0.01} value={discount} onChange={(e) => setDiscount(+e.target.value)} />
            <div className="flex gap-1.5 mt-2"><Chip on={tone === "friendly"} onClick={() => setTone("friendly")}>friendly</Chip><Chip on={tone === "direct"} onClick={() => setTone("direct")}>direct</Chip></div>
          </div>
          <div>
            <Eyebrow className="mb-1.5">Auto-accept counter-offers up to {fmt(maxAuto)}</Eyebrow>
            <input type="range" className="range" min={0} max={2000} step={50} value={maxAuto} onChange={(e) => setMaxAuto(+e.target.value)} />
          </div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={authNeg} onChange={(e) => setAuthNeg(e.target.checked)} className="accent-[var(--accent)]" /><MessageSquare size={13} /> Agent may message sellers as me {connectors.facebook.connected ? "" : <span className="muted text-xs">(connect Facebook to send)</span>}</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={authOrders} onChange={(e) => setAuthOrders(e.target.checked)} className="accent-[var(--accent)]" /><ShieldCheck size={13} /> Agent may place retailer orders with my saved payment method</label>
          </div>
          <Button variant="accent" className="w-full" onClick={run} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />} {busy ? "Negotiating & ordering…" : orders.length ? "Run again" : "Start the agent"}</Button>
          {log.length > 0 && <div className="rounded-[calc(var(--radius)*.6)] p-3 max-h-56 overflow-y-auto mono text-[11px] leading-relaxed" style={{ background: "color-mix(in oklab, var(--ink) 88%, transparent)", color: "#e8e6e0" }}>{log.map((l, i) => <div key={i}>› {l}</div>)}</div>}
          <p className="muted text-[11px]">Every order is a distinct authorisation. Retailer orders go through the retailer&apos;s own checkout (Stripe Link / PayPal / retailer session), never stored card data on our side.</p>
        </Glass>
      </div>
    </div>
  );
}
