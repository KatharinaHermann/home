"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, RotateCcw, Check, EyeOff, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/studio/PageHeader";
import { Glass, Button, Chip, Eyebrow } from "@/components/glass/Glass";
import { RoomScene } from "@/components/scenes/RoomScene";
import { MOODS, PALETTES } from "@/lib/moods";
import { ROOM_META, slotsFor } from "@/lib/rooms";
import { useMood, usePalette, useStudio } from "@/lib/store";

export function TourViewer() {
  const rooms = useStudio((s) => s.rooms); const palette = usePalette(); const mood = useMood();
  const design = useStudio((s) => s.design);
  const roomDesigns = useStudio((s) => s.roomDesigns);
  const { setMood, setPalette, setElement, resetRoomDesign, setTourConfirmed } = useStudio();
  const tourConfirmed = useStudio((s) => s.tourConfirmed);
  const [idx, setIdx] = useState(0); const [slot, setSlot] = useState<string | null>(null);
  const room = rooms[Math.min(idx, rooms.length - 1)];
  const slots = useMemo(() => (room ? slotsFor(room.type) : []), [room]);
  const cur = slots.find((s) => s.id === slot);
  const choice = room && slot ? roomDesigns[room.id]?.[slot] ?? {} : {};

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") setIdx((i) => (i + 1) % rooms.length); if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + rooms.length) % rooms.length); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [rooms.length]);

  if (!room) return (
    <div><PageHeader step="Step 3 · Room tour" title="No rooms yet." blurb="Build your apartment model first." /><Link href="/studio/rooms" className="btn btn-accent">Go to rooms <ArrowRight size={14} /></Link></div>
  );
  const allPalettes = [...design.customPalettes, ...PALETTES];

  return (
    <div>
      <PageHeader step={`Step 3 · Room tour · ${idx + 1}/${rooms.length}`} title={<>{ROOM_META[room.type].glyph} {room.name}<span className="display-italic accent"> in {mood.name}.</span></>} blurb="Click through your flat like a magazine spread. Try on styles and palettes, then click any element to swap its shape or colour. Confirm when it feels like home.">
        <Button size="sm" variant={tourConfirmed ? "glass" : "accent"} onClick={() => setTourConfirmed(true)}><Check size={14} /> {tourConfirmed ? "Tour confirmed" : "Confirm tour"}</Button>
        <Link href="/studio/budget" className={`btn btn-sm ${tourConfirmed ? "btn-accent" : ""}`}>Next: budget agent <ArrowRight size={14} /></Link>
      </PageHeader>

      <div className="grid xl:grid-cols-[1fr_320px] gap-4">
        <div className="min-w-0 space-y-3">
          <Glass strong className="p-2 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={room.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }} className="rounded-[calc(var(--radius)*.8)] overflow-hidden">
                <RoomScene room={room} palette={palette} design={roomDesigns[room.id]} selected={slot} onSelect={setSlot} />
              </motion.div>
            </AnimatePresence>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 btn !p-2.5" onClick={() => { setIdx((idx - 1 + rooms.length) % rooms.length); setSlot(null); }} aria-label="Previous room"><ChevronLeft size={18} /></button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 btn !p-2.5" onClick={() => { setIdx((idx + 1) % rooms.length); setSlot(null); }} aria-label="Next room"><ChevronRight size={18} /></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {rooms.map((r, i) => <button key={r.id} onClick={() => { setIdx(i); setSlot(null); }} className="h-1.5 rounded-full transition-all" style={{ width: i === idx ? 28 : 10, background: i === idx ? "var(--accent)" : "rgba(255,255,255,.7)" }} aria-label={r.name} />)}
            </div>
            <div className="absolute top-4 left-4 glass-strong glass-pill px-3 py-1.5 text-xs mono">{room.w} × {room.l} m · {(room.w * room.l).toFixed(0)} m²</div>
          </Glass>

          <Glass className="p-3">
            <div className="flex items-center justify-between mb-2"><Eyebrow>Try on a style</Eyebrow><span className="muted text-[11px]">applies to the whole apartment</span></div>
            <div className="flex gap-1.5 scroll-x pb-1">{MOODS.map((m) => <Chip key={m.id} on={m.id === mood.id} onClick={() => setMood(m.id)}>{m.glyph} {m.name}</Chip>)}</div>
            <div className="flex gap-2 scroll-x pt-2.5">
              {allPalettes.map((p) => (
                <button key={p.id} onClick={() => setPalette(p.id)} className="shrink-0 rounded-full overflow-hidden flex w-10 h-10 transition-transform hover:scale-110" title={p.name} style={{ outline: p.id === palette.id ? "2px solid var(--accent)" : "none", outlineOffset: 2 }}>
                  {p.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                </button>
              ))}
            </div>
          </Glass>
        </div>

        <Glass strong className="p-4 xl:sticky xl:top-6 self-start">
          <div className="flex items-center justify-between mb-3"><Eyebrow>Elements</Eyebrow><button className="btn btn-ghost btn-xs" onClick={() => resetRoomDesign(room.id)}><RotateCcw size={12} /> reset room</button></div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {slots.map((s) => <Chip key={s.id} on={slot === s.id} onClick={() => setSlot(s.id)} style={{ opacity: roomDesigns[room.id]?.[s.id]?.hidden ? 0.5 : 1 }}>{s.label}</Chip>)}
          </div>
          {cur ? (
            <div className="space-y-4 fade-in" key={cur.id}>
              <div className="display text-xl">{cur.label}</div>
              <div>
                <Eyebrow className="mb-1.5">Shape</Eyebrow>
                <div className="flex flex-wrap gap-1.5">{cur.variants.map((v) => <Chip key={v} on={(choice.variant ?? cur.variants[0]) === v} onClick={() => setElement(room.id, cur.id, { variant: v })}>{v}</Chip>)}</div>
              </div>
              <div>
                <Eyebrow className="mb-1.5">Colour</Eyebrow>
                <div className="flex items-center gap-2">
                  {palette.colors.map((c, i) => (
                    <button key={i} onClick={() => setElement(room.id, cur.id, { colorIndex: i, hex: undefined })} className="w-9 h-9 rounded-[40%] transition-transform hover:scale-110" style={{ background: c, outline: (choice.hex ? false : (choice.colorIndex ?? cur.colorIndex) === i) ? "2px solid var(--ink)" : "none", outlineOffset: 2 }} />
                  ))}
                  <label className="w-9 h-9 rounded-[40%] grid place-items-center cursor-pointer text-xs" style={{ background: choice.hex ?? "transparent", border: "1px dashed var(--ink-muted)" }} title="Custom colour">
                    <input type="color" className="opacity-0 absolute w-0 h-0" value={choice.hex ?? "#888888"} onChange={(e) => setElement(room.id, cur.id, { hex: e.target.value })} />{choice.hex ? "" : "+"}
                  </label>
                </div>
              </div>
              {cur.kind !== "surface" && (
                <Button size="sm" onClick={() => setElement(room.id, cur.id, { hidden: !choice.hidden })}>{choice.hidden ? <Eye size={14} /> : <EyeOff size={14} />} {choice.hidden ? "Show" : "Remove from room"}</Button>
              )}
              <p className="muted text-[11px]">Products chosen by the budget agent will follow this shape and colour as closely as the catalogue allows.</p>
            </div>
          ) : <p className="muted text-sm">Click any element in the scene, or pick one above.</p>}
        </Glass>
      </div>
    </div>
  );
}
