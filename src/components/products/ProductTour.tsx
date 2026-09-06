"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCheck, Tag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/studio/PageHeader";
import { Glass, Button, Eyebrow } from "@/components/glass/Glass";
import { RoomScene } from "@/components/scenes/RoomScene";
import { productById, SOURCE_META } from "@/lib/catalog";
import { ROOM_META, slotsFor } from "@/lib/rooms";
import { planTotal, usePalette, useStudio } from "@/lib/store";
import { fmt } from "@/lib/pricing";
import { SwipeDeck } from "./SwipeDeck";
import { ProductThumb } from "./ProductThumb";

export function ProductTour() {
  const rooms = useStudio((s) => s.rooms); const palette = usePalette();
  const plan = useStudio((s) => s.plan); const roomDesigns = useStudio((s) => s.roomDesigns);
  const { setItemPos, setItemStatus, confirmAll } = useStudio();
  const [idx, setIdx] = useState(0); const [open, setOpen] = useState<string | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const room = rooms[Math.min(idx, rooms.length - 1)];
  const items = useMemo(() => (plan && room ? plan.items.filter((i) => i.roomId === room.id) : []), [plan, room]);
  const slots = room ? slotsFor(room.type) : [];

  if (!plan || !room) return (
    <div><PageHeader step="Step 5 · Products" title="No plan yet." blurb="Run the budget agent first." /><Link href="/studio/budget" className="btn btn-accent">Go to budget agent <ArrowRight size={14} /></Link></div>
  );

  const roomTotal = items.filter((i) => i.status !== "removed").reduce((a, i) => a + i.price, 0);
  const confirmed = plan.items.filter((i) => i.status === "confirmed").length;
  const active = items.filter((i) => i.productId || i.status === "proposed");
  const onMove = (e: React.PointerEvent) => {
    if (!drag || !sceneRef.current) return;
    const r = sceneRef.current.getBoundingClientRect();
    setItemPos(drag, { x: Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(2, Math.min(98, ((e.clientY - r.top) / r.height) * 100)) });
  };
  const openItem = open ? plan.items.find((i) => i.key === open) : null;
  const openRoom = openItem ? rooms.find((r) => r.id === openItem.roomId) : null;
  const openSlot = openItem && openRoom ? slotsFor(openRoom.type).find((s) => s.id === openItem.slotId) : null;

  return (
    <div>
      <PageHeader step={`Step 5 · Tagged tour · ${idx + 1}/${rooms.length}`} title={<>{ROOM_META[room.type].glyph} {room.name}, <span className="display-italic accent">priced.</span></>} blurb="Every element is now a real product. Tap a tag to swipe through alternatives or pick none; drag tags to move things. The total updates as you go.">
        <Button size="sm" onClick={confirmAll}><CheckCheck size={14} /> Confirm all proposed</Button>
        <Link href="/studio/checkout" className={`btn btn-sm ${confirmed ? "btn-accent" : ""}`}>Next: buy & negotiate <ArrowRight size={14} /></Link>
      </PageHeader>

      <div className="grid xl:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-3 min-w-0">
          <Glass strong className="p-2 relative">
            <div ref={sceneRef} className="relative rounded-[calc(var(--radius)*.8)] overflow-hidden touch-none" onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
              <RoomScene room={room} palette={palette} design={roomDesigns[room.id]} items={items} onSelect={(slotId) => { const it = items.find((i) => i.slotId === slotId); if (it) setOpen(it.key); }} />
              {active.map((it) => {
                const p = it.productId ? productById(it.productId) ?? null : null;
                const slot = slots.find((s) => s.id === it.slotId)!;
                const pos = it.pos ?? slot.tag;
                return (
                  <div key={it.key} className="tag" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onPointerDown={(e) => { e.preventDefault(); (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setDrag(it.key); }}
                    onClick={() => { if (!drag) setOpen(it.key); }}>
                    <div className="flex items-center gap-2">
                      <span className="tag-dot" />
                      <span className="glass-strong glass-pill px-2.5 py-1 text-[11px] leading-tight whitespace-nowrap flex items-center gap-1.5" style={{ opacity: it.status === "removed" ? 0.5 : 1 }}>
                        {it.status === "confirmed" && <CheckCheck size={11} style={{ color: "var(--accent)" }} />}
                        <span className="font-medium">{p ? p.name.split(" ").slice(0, 3).join(" ") : `No ${slot.label.toLowerCase()}`}</span>
                        <span className="mono muted">{fmt(it.price)}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 btn !p-2.5" onClick={() => setIdx((idx - 1 + rooms.length) % rooms.length)}><ChevronLeft size={18} /></button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 btn !p-2.5" onClick={() => setIdx((idx + 1) % rooms.length)}><ChevronRight size={18} /></button>
            <div className="absolute top-4 right-4 glass-strong glass-pill px-3 py-1.5 text-xs mono flex items-center gap-1.5"><Tag size={12} /> {room.name} · {fmt(roomTotal)}</div>
          </Glass>

          <div className="flex gap-1.5 scroll-x">
            {rooms.map((r, i) => { const t = plan.items.filter((x) => x.roomId === r.id && x.status !== "removed").reduce((a, x) => a + x.price, 0); return <button key={r.id} className={`chip shrink-0 ${i === idx ? "chip-on" : ""}`} onClick={() => setIdx(i)}>{ROOM_META[r.type].glyph} {r.name} · {fmt(t)}</button>; })}
          </div>
        </div>

        <div className="space-y-3 xl:sticky xl:top-6 self-start">
          <AnimatePresence mode="wait">
            {openItem && openRoom && openSlot ? (
              <motion.div key={openItem.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Glass strong className="p-4"><SwipeDeck item={openItem} room={openRoom} slot={openSlot} candidates={plan.candidates[openItem.key] ?? []} onClose={() => setOpen(null)} /></Glass>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Glass strong className="p-4">
                  <div className="flex items-center justify-between mb-3"><Eyebrow>{room.name} · items</Eyebrow><span className="display text-lg tabular-nums">{fmt(roomTotal)}</span></div>
                  <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                    {items.map((it) => {
                      const p = it.productId ? productById(it.productId) ?? null : null; const slot = slots.find((s) => s.id === it.slotId)!;
                      return (
                        <button key={it.key} onClick={() => setOpen(it.key)} className="w-full flex items-center gap-3 p-2 rounded-[calc(var(--radius)*.5)] text-left transition hover:bg-[var(--glass)]" style={{ opacity: it.status === "removed" ? 0.5 : 1 }}>
                          <ProductThumb p={p} size={44} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] mono uppercase muted">{slot.label}{p ? ` · ${SOURCE_META[p.source].label}` : ""}</div>
                            <div className="text-sm truncate">{p ? p.name : "None"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm tabular-nums">{fmt(it.price)}</div>
                            <div className="text-[10px] mono" style={{ color: it.status === "confirmed" ? "var(--accent)" : "var(--ink-muted)" }}>{it.status}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t hairline flex items-center justify-between">
                    <div><div className="mono text-[10px] uppercase muted">Apartment total</div><div className="display text-xl tabular-nums">{fmt(planTotal(plan))}</div></div>
                    <Button size="sm" onClick={() => items.forEach((i) => i.productId && i.status === "proposed" && setItemStatus(i.key, "confirmed"))}>Confirm room</Button>
                  </div>
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
