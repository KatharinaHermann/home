"use client";
import { useMemo, useRef, useState } from "react";
import { ROOM_META, type Room } from "@/lib/rooms";
import { usePalette, useStudio } from "@/lib/store";
import { mix } from "@/lib/color";

/** Editable 2D floor plan. Rooms are draggable; snaps to 10 cm. */
export function FloorPlan({ selected, onSelect }: { selected?: string | null; onSelect?: (id: string) => void }) {
  const rooms = useStudio((s) => s.rooms); const updateRoom = useStudio((s) => s.updateRoom);
  const palette = usePalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);

  const bounds = useMemo(() => {
    const maxX = Math.max(8, ...rooms.map((r) => r.x + r.w)) + 0.5;
    const maxY = Math.max(6, ...rooms.map((r) => r.y + r.l)) + 0.5;
    return { maxX, maxY };
  }, [rooms]);
  const S = 60; // px per metre
  const Wpx = bounds.maxX * S + 40, Hpx = bounds.maxY * S + 40;

  const toM = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const sx = Wpx / r.width, sy = Hpx / r.height;
    return { x: ((e.clientX - r.left) * sx - 20) / S, y: ((e.clientY - r.top) * sy - 20) / S };
  };

  const shade = (r: Room, i: number) => mix(palette.colors[i % 5], palette.dark ? "#000" : "#fff", palette.dark ? 0.25 : 0.55);

  return (
    <div className="rounded-[var(--radius)] overflow-hidden" style={{ background: "color-mix(in oklab, var(--ink) 5%, transparent)" }}>
      <svg ref={svgRef} viewBox={`0 0 ${Wpx} ${Hpx}`} className="w-full h-auto select-none touch-none"
        onPointerMove={(e) => { if (!drag) return; const m = toM(e); updateRoom(drag.id, { x: Math.max(0, Math.round((m.x - drag.dx) * 10) / 10), y: Math.max(0, Math.round((m.y - drag.dy) * 10) / 10) }); }}
        onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        <defs><pattern id="grid" width={S / 2} height={S / 2} patternUnits="userSpaceOnUse"><path d={`M ${S / 2} 0 L 0 0 0 ${S / 2}`} fill="none" stroke="currentColor" strokeOpacity={0.08} /></pattern></defs>
        <rect width={Wpx} height={Hpx} fill="url(#grid)" />
        {rooms.map((r, i) => {
          const on = selected === r.id;
          return (
            <g key={r.id} transform={`translate(${20 + r.x * S},${20 + r.y * S})`} style={{ cursor: "grab" }}
              onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); const m = toM(e); setDrag({ id: r.id, dx: m.x - r.x, dy: m.y - r.y }); onSelect?.(r.id); }}>
              <rect width={r.w * S} height={r.l * S} rx={6} fill={shade(r, i)} stroke={on ? "var(--accent)" : "var(--ink)"} strokeOpacity={on ? 1 : 0.5} strokeWidth={on ? 4 : 2.5} />
              {/* door */}
              <path d={`M${r.w * S * 0.2},${r.l * S} a${S * 0.8},${S * 0.8} 0 0 1 ${S * 0.8},-${S * 0.8}`} fill="none" stroke="var(--ink)" strokeOpacity={0.5} strokeWidth={2} />
              <text x={12} y={26} fontSize={16} fill="var(--ink)" fontWeight={600}>{ROOM_META[r.type].glyph} {r.name}</text>
              <text x={12} y={46} fontSize={12} fill="var(--ink)" fillOpacity={0.7} className="mono">{r.w.toFixed(1)} × {r.l.toFixed(1)} m · {(r.w * r.l).toFixed(1)} m²</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
