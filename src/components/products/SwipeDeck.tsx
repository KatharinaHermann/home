"use client";
import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Ban, ExternalLink, MapPin } from "lucide-react";
import { productById, SOURCE_META, type Product } from "@/lib/catalog";
import { itemPrice, fmt } from "@/lib/pricing";
import { type Room, type Slot } from "@/lib/rooms";
import { useStudio } from "@/lib/store";
import { Button, Eyebrow } from "@/components/glass/Glass";
import { ProductThumb } from "./ProductThumb";
import type { PlacedProduct } from "@/lib/types";

/**
 * Swipe through candidate products for one slot. Left = next, right =
 * previous, the last card is "no product". Buttons do the same for mouse
 * users. Confirm locks the current choice.
 */
export function SwipeDeck({ item, room, slot, candidates, onClose }: { item: PlacedProduct; room: Room; slot: Slot; candidates: string[]; onClose: () => void }) {
  const swap = useStudio((s) => s.swapProduct); const setStatus = useStudio((s) => s.setItemStatus);
  const deck: (Product | null)[] = [...candidates.map((id) => productById(id) ?? null).filter(Boolean), null];
  const startIdx = Math.max(0, deck.findIndex((p) => (p?.id ?? null) === item.productId));
  const [idx, setIdx] = useState(startIdx); const [dir, setDir] = useState(1);
  const x = useMotionValue(0); const rotate = useTransform(x, [-200, 200], [-10, 10]); const opacity = useTransform(x, [-220, 0, 220], [0.3, 1, 0.3]);

  const go = (d: number) => { const n = (idx + d + deck.length) % deck.length; setDir(d); setIdx(n); const p = deck[n]; swap(item.key, p?.id ?? null, itemPrice(p, room, slot)); };
  const p = deck[idx];
  const price = itemPrice(p, room, slot);
  const src = p ? SOURCE_META[p.source] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><Eyebrow>{room.name} · {slot.label}</Eyebrow><span className="mono text-[11px] muted">{idx + 1}/{deck.length} · swipe</span></div>
      <div className="relative h-[300px]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div key={idx} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7} style={{ x, rotate, opacity }}
            onDragEnd={(_, info) => { if (info.offset.x < -90) go(1); else if (info.offset.x > 90) go(-1); }}
            initial={{ x: dir * 240, opacity: 0, scale: 0.92 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -dir * 240, opacity: 0, scale: 0.92 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute inset-0 glass-strong p-4 cursor-grab active:cursor-grabbing select-none">
            <div className="flex gap-4 h-full">
              <ProductThumb p={p} size={120} fallback={undefined} />
              <div className="flex-1 min-w-0 flex flex-col">
                {p ? (
                  <>
                    <div className="mono text-[10px] uppercase tracking-widest muted">{src?.label} · {p.tier}{p.condition === "used" ? " · used" : p.condition === "owned" ? " · yours" : ""}</div>
                    <div className="display text-xl leading-tight mt-0.5">{p.name}</div>
                    <div className="display text-2xl tabular-nums mt-2">{fmt(price)}{p.perSqm && <span className="muted text-xs"> · {fmt(p.price)}/m²</span>}</div>
                    {p.meta?.seller && <div className="text-xs muted mt-1 flex items-center gap-1"><MapPin size={11} /> {p.meta.seller} · {p.meta.distanceKm} km · listed {p.meta.listedDaysAgo}d ago{p.meta.negotiable ? " · negotiable" : ""}</div>}
                    <div className="flex flex-wrap gap-1 mt-2">{p.styleTags.filter((t) => t !== "*").slice(0, 4).map((t) => <span key={t} className="chip" style={{ fontSize: 10 }}>{t}</span>)}{p.colors.slice(0, 3).map((c) => <span key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />)}</div>
                    <a href={p.url} target="_blank" rel="noreferrer" className="mt-auto text-xs underline inline-flex items-center gap-1 muted">View listing <ExternalLink size={11} /></a>
                  </>
                ) : (
                  <>
                    <div className="mono text-[10px] uppercase tracking-widest muted">No product</div>
                    <div className="display text-xl leading-tight mt-0.5">Leave this empty</div>
                    <p className="muted text-sm mt-2">Skip {slot.label.toLowerCase()} for now and keep the budget for something else. You can always come back.</p>
                    <div className="display text-2xl mt-auto">{fmt(0)}</div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => go(-1)}><ChevronLeft size={14} /></Button>
        <Button size="sm" onClick={() => go(1)}><ChevronRight size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => { setDir(1); setIdx(deck.length - 1); swap(item.key, null, 0); }}><Ban size={14} /> None</Button>
        <Button size="sm" variant="accent" className="ml-auto" onClick={() => { setStatus(item.key, p ? "confirmed" : "removed"); onClose(); }}><Check size={14} /> {p ? "Confirm" : "Confirm none"}</Button>
      </div>
      <div className="flex gap-1 justify-center">{deck.map((d, i) => <span key={i} className="h-1 rounded-full transition-all" style={{ width: i === idx ? 20 : 6, background: i === idx ? "var(--accent)" : "color-mix(in oklab, var(--ink) 20%, transparent)" }} />)}</div>
    </div>
  );
}
