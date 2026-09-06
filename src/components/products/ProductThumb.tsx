"use client";
import type { Product } from "@/lib/catalog";
import { darken, lighten } from "@/lib/color";

/** Stylised product thumbnail (no external images needed). */
export function ProductThumb({ p, size = 96, fallback }: { p: Product | null; size?: number; fallback?: string }) {
  const c = p?.colors[0] ?? fallback ?? "#bbb";
  const d = darken(c, 0.2), l = lighten(c, 0.15);
  const v = p?.variant ?? "";
  const cat = p?.category ?? "";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-[calc(var(--radius)*.5)]" style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }}>
      {!p && <g><circle cx={50} cy={50} r={26} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} strokeDasharray="4 4" /><line x1={32} y1={32} x2={68} y2={68} stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} /></g>}
      {p && (cat === "paint" || cat === "tiles" || cat === "flooring" || cat === "backsplash" || cat === "countertop" || cat === "cabinets") && <g><rect x={16} y={16} width={68} height={68} rx={10} fill={c} /><rect x={16} y={16} width={68} height={34} rx={10} fill={l} opacity={0.5} /></g>}
      {p && cat === "sofa" && <g><rect x={12} y={40} width={76} height={32} rx={8} fill={c} /><rect x={8} y={48} width={12} height={28} rx={6} fill={d} /><rect x={80} y={48} width={12} height={28} rx={6} fill={d} /><rect x={18} y={56} width={64} height={14} rx={5} fill={l} /></g>}
      {(cat === "rug" || cat === "towels" || cat === "curtains") && <g><rect x={14} y={30} width={72} height={44} rx={4} fill={c} />{v === "striped" && [0, 1, 2].map((i) => <rect key={i} x={14} y={38 + i * 12} width={72} height={5} fill={d} />)}{v === "kilim" && <polygon points="50,38 62,52 50,66 38,52" fill={l} />}</g>}
      {(cat === "floor-lamp" || cat === "table-lamp" || cat === "pendant" || cat === "sconce") && <g><ellipse cx={50} cy={36} rx={26} ry={16} fill="#fff3d0" opacity={0.7} /><path d="M32,26 h36 l6,22 h-48 z" fill={c} /><rect x={48} y={48} width={4} height={34} fill={d} /><ellipse cx={50} cy={84} rx={14} ry={4} fill={d} /></g>}
      {cat === "art" && <g><rect x={20} y={20} width={60} height={60} fill="#fff" stroke={d} strokeWidth={4} /><rect x={30} y={30} width={40} height={40} fill={c} /><circle cx={58} cy={46} r={9} fill={l} /></g>}
      {cat === "plant" && <g><path d="M38,66 h24 l-3,22 h-18 z" fill="#b8926a" />{[-20, 0, 20].map((dx) => <ellipse key={dx} cx={50 + dx} cy={48 + Math.abs(dx) / 2} rx={16} ry={8} fill={dx ? d : l} transform={`rotate(${dx * 1.5} ${50 + dx} 48)`} />)}</g>}
      {(cat === "shelving" || cat === "wardrobe" || cat === "sideboard" || cat === "console" || cat === "nightstand" || cat === "vanity") && <g><rect x={20} y={18} width={60} height={64} rx={3} fill={c} />{[0, 1, 2].map((i) => <rect key={i} x={26} y={26 + i * 18} width={48} height={10} fill={l} />)}</g>}
      {(cat === "coffee-table" || cat === "dining-table" || cat === "desk") && <g>{v === "round" ? <ellipse cx={50} cy={40} rx={34} ry={12} fill={c} /> : <rect x={14} y={34} width={72} height={10} rx={3} fill={c} />}<rect x={22} y={44} width={5} height={36} fill={d} /><rect x={73} y={44} width={5} height={36} fill={d} /></g>}
      {(cat === "bar-stool" || cat === "dining-chair" || cat === "desk-chair") && <g><rect x={34} y={22} width={32} height={34} rx={10} fill={c} /><rect x={28} y={54} width={44} height={10} rx={4} fill={l} /><line x1={34} y1={64} x2={30} y2={86} stroke={d} strokeWidth={4} /><line x1={66} y1={64} x2={70} y2={86} stroke={d} strokeWidth={4} /></g>}
      {cat === "bed" && <g><rect x={14} y={30} width={72} height={40} rx={6} fill={c} /><rect x={22} y={40} width={56} height={22} rx={4} fill="#f5f1ea" /><rect x={26} y={36} width={20} height={10} rx={3} fill="#fff" /><rect x={54} y={36} width={20} height={10} rx={3} fill="#fff" /></g>}
      {cat === "mirror" && <g>{v === "round" ? <circle cx={50} cy={50} r={30} fill="#cfe3ec" stroke={c} strokeWidth={5} /> : <rect x={24} y={20} width={52} height={60} rx={v === "arch" ? 26 : 4} fill="#cfe3ec" stroke={c} strokeWidth={5} />}</g>}
      {cat === "coat-rack" && <g><line x1={50} y1={14} x2={50} y2={86} stroke={c} strokeWidth={5} /><path d="M50,24 q-16,4 -20,16 M50,24 q16,4 20,16" stroke={c} strokeWidth={4} fill="none" /></g>}
    </svg>
  );
}
