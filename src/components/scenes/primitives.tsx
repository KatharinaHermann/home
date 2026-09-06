"use client";
import { darken, lighten, mix, alpha } from "@/lib/color";

export type El = { variant: string; color: string; hidden?: boolean };
export type Els = Record<string, El>;

export const W = 1000, H = 620;
export const FLOOR_Y = 430;

/** shared group wrapper so every element is clickable + highlightable */
export function Slot({ id, els, selected, onSelect, children }: { id: string; els: Els; selected?: string | null; onSelect?: (id: string) => void; children: React.ReactNode }) {
  const el = els[id];
  if (!el || el.hidden) return null;
  const sel = selected === id;
  return (
    <g data-slot={id} onClick={(e) => { e.stopPropagation(); onSelect?.(id); }}
      style={{ cursor: onSelect ? "pointer" : "default", transition: "filter 200ms", filter: sel ? "drop-shadow(0 0 10px rgba(255,255,255,.9)) brightness(1.06)" : undefined }}>
      {children}
    </g>
  );
}

export function Shell({ wall, floor, wallVariant, floorVariant }: { wall: string; floor: string; wallVariant: string; floorVariant: string }) {
  const wallDark = darken(wall, 0.08), floorDark = darken(floor, 0.12);
  return (
    <g>
      {/* back wall */}
      <rect x={0} y={0} width={W} height={FLOOR_Y} fill={wall} style={{ transition: "fill 700ms" }} />
      {wallVariant === "halfwall" && <rect x={0} y={260} width={W} height={FLOOR_Y - 260} fill={darken(wall, 0.18)} style={{ transition: "fill 700ms" }} />}
      {wallVariant === "limewash" && (
        <>
          <rect x={0} y={0} width={W} height={FLOOR_Y} fill="url(#limewash)" opacity={0.5} />
        </>
      )}
      {/* side walls in perspective */}
      <polygon points={`0,0 90,60 90,${FLOOR_Y + 40} 0,${FLOOR_Y + 110}`} fill={wallDark} style={{ transition: "fill 700ms" }} />
      <polygon points={`${W},0 ${W - 90},60 ${W - 90},${FLOOR_Y + 40} ${W},${FLOOR_Y + 110}`} fill={wallDark} style={{ transition: "fill 700ms" }} />
      {/* skirting */}
      <rect x={90} y={FLOOR_Y - 14} width={W - 180} height={14} fill={lighten(wall, 0.12)} opacity={0.8} />
      {/* floor */}
      <polygon points={`0,${H} ${W},${H} ${W},${FLOOR_Y + 110} ${W - 90},${FLOOR_Y + 40} 90,${FLOOR_Y + 40} 0,${FLOOR_Y + 110}`} fill={floor} style={{ transition: "fill 700ms" }} />
      <rect x={90} y={FLOOR_Y} width={W - 180} height={40} fill={floor} style={{ transition: "fill 700ms" }} />
      {floorVariant === "planks" && Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={90 + i * 102} y1={FLOOR_Y} x2={-40 + i * 135} y2={H} stroke={floorDark} strokeWidth={1.5} opacity={0.5} />
      ))}
      {floorVariant === "herringbone" && <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#herring)" opacity={0.35} />}
      {floorVariant === "tiles" && <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#tiles)" opacity={0.35} />}
      {floorVariant === "concrete" && <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#limewash)" opacity={0.4} />}
      {/* floor sheen */}
      <rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="url(#floorSheen)" />
      {/* ceiling light wash */}
      <rect x={0} y={0} width={W} height={FLOOR_Y} fill="url(#wallLight)" />
    </g>
  );
}

export function Defs({ wall, floor }: { wall: string; floor: string }) {
  return (
    <defs>
      <linearGradient id="floorSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.18} /><stop offset="1" stopColor="#000" stopOpacity={0.12} />
      </linearGradient>
      <radialGradient id="wallLight" cx="0.5" cy="0" r="0.9">
        <stop offset="0" stopColor="#fff" stopOpacity={0.25} /><stop offset="1" stopColor="#000" stopOpacity={0.08} />
      </radialGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.22} /><stop offset="1" stopColor="#000" stopOpacity={0.18} />
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6d8" stopOpacity={0.9} /><stop offset="1" stopColor="#fff6d8" stopOpacity={0} />
      </linearGradient>
      <pattern id="herring" width="60" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="28" height="14" x="0" y="0" fill={darken(floor, 0.15)} /><rect width="28" height="14" x="30" y="15" fill={darken(floor, 0.15)} />
      </pattern>
      <pattern id="tiles" width="70" height="70" patternUnits="userSpaceOnUse">
        <rect width="68" height="68" fill="none" stroke={darken(floor, 0.2)} strokeWidth="2" />
      </pattern>
      <pattern id="subway" width="60" height="26" patternUnits="userSpaceOnUse">
        <rect x="1" y="1" width="58" height="24" rx="2" fill="#fff" fillOpacity={0.12} stroke="#000" strokeOpacity={0.15} />
        <rect x="-29" y="14" width="58" height="24" rx="2" fill="none" stroke="#000" strokeOpacity={0.12} />
      </pattern>
      <pattern id="zellige" width="34" height="34" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" x="1" y="1" fill="#fff" fillOpacity={0.14} stroke="#000" strokeOpacity={0.12} />
        <rect width="14" height="14" x="9" y="9" fill="#fff" fillOpacity={0.12} />
      </pattern>
      <filter id="limewash" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <pattern id="limewash" width="1000" height="620" patternUnits="userSpaceOnUse">
        <rect width="1000" height="620" filter="url(#limewash)" opacity={0.5} fill={wall} />
      </pattern>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
  );
}

export function Window({ x = 120, y = 70, w = 220, h = 250, frame, curtain }: { x?: number; y?: number; w?: number; h?: number; frame: string; curtain?: El }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#d9e8f2" />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="url(#glow)" opacity={0.7} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={frame} strokeWidth={10} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={frame} strokeWidth={6} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={frame} strokeWidth={6} />
      {curtain && !curtain.hidden && <Curtains x={x} y={y} w={w} h={h} el={curtain} />}
    </g>
  );
}

export function Curtains({ x, y, w, h, el }: { x: number; y: number; w: number; h: number; el: El }) {
  const c = el.variant === "sheer" ? "#ffffff" : el.color;
  const op = el.variant === "sheer" ? 0.55 : el.variant === "velvet" ? 1 : 0.92;
  const pw = el.variant === "sheer" ? w * 0.42 : w * 0.34;
  const rod = darken(el.color, 0.3);
  return (
    <g>
      <rect x={x - 30} y={y - 22} width={w + 60} height={6} rx={3} fill={rod} />
      {[x - 22, x + w - pw + 22].map((px, i) => (
        <g key={i}>
          <path d={`M${px},${y - 14} h${pw} v${h + 90} q-${pw / 6},14 -${pw / 3},0 q-${pw / 6},-14 -${pw / 3},0 q-${pw / 6},14 -${pw / 3},0 z`} fill={c} opacity={op} />
          {Array.from({ length: 4 }).map((_, j) => <line key={j} x1={px + (j + 0.5) * (pw / 4)} y1={y - 10} x2={px + (j + 0.5) * (pw / 4)} y2={y + h + 80} stroke="#000" strokeOpacity={el.variant === "velvet" ? 0.16 : 0.07} strokeWidth={6} />)}
        </g>
      ))}
    </g>
  );
}

function Frame({ fx, fy, fw, fh, fill, wall }: { fx: number; fy: number; fw: number; fh: number; fill: string; wall: string }) {
  const frame = darken(wall, 0.45);
  return (
    <g>
      <rect x={fx + 4} y={fy + 6} width={fw} height={fh} fill="#000" opacity={0.12} />
      <rect x={fx} y={fy} width={fw} height={fh} fill={mix(wall, "#fff", 0.6)} stroke={frame} strokeWidth={4} />
      <rect x={fx + 12} y={fy + 12} width={fw - 24} height={fh - 24} fill={fill} />
      <circle cx={fx + fw * 0.6} cy={fy + fh * 0.45} r={Math.min(fw, fh) * 0.22} fill={lighten(fill, 0.25)} opacity={0.9} />
      <path d={`M${fx + 12},${fy + fh - 12} q${fw * 0.3},-${fh * 0.5} ${fw - 24},-${fh * 0.18} v${fh * 0.18} z`} fill={darken(fill, 0.2)} opacity={0.7} />
    </g>
  );
}

export function Art({ x, y, el, wall }: { x: number; y: number; el: El; wall: string }) {
  if (el.variant === "gallery") return (
    <g>
      <Frame wall={wall} fx={x - 130} fy={y - 60} fw={90} fh={110} fill={el.color} />
      <Frame wall={wall} fx={x - 30} fy={y - 90} fw={120} fh={80} fill={lighten(el.color, 0.15)} />
      <Frame wall={wall} fx={x - 30} fy={y} fw={60} fh={60} fill={darken(el.color, 0.15)} />
      <Frame wall={wall} fx={x + 40} fy={y} fw={80} fh={60} fill={el.color} />
      <Frame wall={wall} fx={x + 100} fy={y - 90} fw={70} fh={80} fill={mix(el.color, "#fff", 0.35)} />
    </g>
  );
  if (el.variant === "oversized") return <Frame wall={wall} fx={x - 180} fy={y - 110} fw={360} fh={220} fill={el.color} />;
  return <Frame wall={wall} fx={x - 80} fy={y - 70} fw={160} fh={140} fill={el.color} />;
}

export function Plant({ x, y, el, scale = 1 }: { x: number; y: number; el: El; scale?: number }) {
  const leaf = el.color, pot = "#b8926a";
  const leafD = darken(leaf, 0.15), leafL = lighten(leaf, 0.12);
  if (el.variant === "hanging") return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1={0} y1={-260} x2={0} y2={-80} stroke="#8a7a66" strokeWidth={3} />
      <ellipse cx={0} cy={-70} rx={38} ry={22} fill={pot} />
      {[-30, -10, 10, 30].map((dx, i) => <path key={i} d={`M${dx},-60 q${dx / 2},60 ${dx * 1.4},120`} stroke={i % 2 ? leafD : leafL} strokeWidth={9} fill="none" strokeLinecap="round" />)}
      {[-38, -18, 4, 24, 40].map((dx, i) => <ellipse key={i} cx={dx * 1.3} cy={-10 + Math.abs(dx)} rx={12} ry={7} fill={i % 2 ? leaf : leafL} transform={`rotate(${dx} ${dx * 1.3} ${-10 + Math.abs(dx)})`} />)}
    </g>
  );
  if (el.variant === "bushy") return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-42,0 h84 l-8,60 h-68 z" fill={pot} />
      {[[-40, -50, 34], [40, -60, 36], [0, -90, 42], [-20, -30, 30], [25, -25, 28], [0, -50, 34]].map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.72} fill={i % 3 === 0 ? leafD : i % 3 === 1 ? leaf : leafL} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-34,0 h68 l-6,70 h-56 z" fill={pot} />
      <path d="M0,0 v-190" stroke={darken(pot, 0.35)} strokeWidth={5} />
      {[[-60, -120, -30], [60, -140, 30], [-45, -190, -20], [50, -200, 25], [0, -240, 0], [-20, -70, -40], [25, -90, 40]].map(([dx, dy, rot], i) => (
        <ellipse key={i} cx={dx} cy={dy} rx={46} ry={20} fill={i % 2 ? leaf : leafL} transform={`rotate(${rot} ${dx} ${dy})`} />
      ))}
    </g>
  );
}

export function Rug({ x, y, w, h, el }: { x: number; y: number; w: number; h: number; el: El }) {
  const c = el.color;
  return (
    <g>
      <polygon points={`${x - w / 2 + 40},${y} ${x + w / 2 - 40},${y} ${x + w / 2},${y + h} ${x - w / 2},${y + h}`} fill={c} opacity={0.95} />
      {el.variant === "striped" && Array.from({ length: 6 }).map((_, i) => (
        <polygon key={i} points={`${x - w / 2 + 40 + (i * (w - 80)) / 6},${y} ${x - w / 2 + 40 + ((i + 0.5) * (w - 80)) / 6},${y} ${x - w / 2 + ((i + 0.5) * w) / 6},${y + h} ${x - w / 2 + (i * w) / 6},${y + h}`} fill={darken(c, 0.22)} opacity={0.8} />
      ))}
      {el.variant === "kilim" && (
        <>
          <polygon points={`${x - w / 2 + 60},${y + 14} ${x + w / 2 - 60},${y + 14} ${x + w / 2 - 30},${y + h - 14} ${x - w / 2 + 30},${y + h - 14}`} fill="none" stroke={darken(c, 0.35)} strokeWidth={5} strokeDasharray="14 8" />
          {Array.from({ length: 5 }).map((_, i) => <polygon key={i} points={`${x - 160 + i * 80},${y + h / 2} ${x - 140 + i * 80},${y + h / 2 - 22} ${x - 120 + i * 80},${y + h / 2} ${x - 140 + i * 80},${y + h / 2 + 22}`} fill={lighten(c, 0.3)} />)}
        </>
      )}
      <polygon points={`${x - w / 2 + 40},${y} ${x + w / 2 - 40},${y} ${x + w / 2},${y + h} ${x - w / 2},${y + h}`} fill="url(#shade)" opacity={0.5} />
    </g>
  );
}

export function FloorLamp({ x, y, el }: { x: number; y: number; el: El }) {
  const c = el.color, metal = darken(c, 0.25);
  const glow = <ellipse cx={x} cy={y - 250} rx={120} ry={90} fill="#fff3d0" opacity={0.35} filter="url(#soft)" />;
  if (el.variant === "arc") return (
    <g>{glow}
      <ellipse cx={x + 40} cy={y} rx={44} ry={12} fill={metal} />
      <path d={`M${x + 40},${y} v-140 q0,-190 -200,-190`} stroke={metal} strokeWidth={6} fill="none" />
      <path d={`M${x - 200},${y - 330} l-45,80 h90 z`} fill={c} />
    </g>
  );
  if (el.variant === "tripod") return (
    <g>{glow}
      <line x1={x} y1={y - 240} x2={x - 40} y2={y} stroke={metal} strokeWidth={5} /><line x1={x} y1={y - 240} x2={x + 40} y2={y} stroke={metal} strokeWidth={5} /><line x1={x} y1={y - 240} x2={x} y2={y - 20} stroke={metal} strokeWidth={5} />
      <path d={`M${x - 50},${y - 250} h100 l16,90 h-132 z`} fill={c} />
    </g>
  );
  if (el.variant === "paper") return (
    <g>{glow}
      <ellipse cx={x} cy={y} rx={40} ry={12} fill={metal} />
      <rect x={x - 48} y={y - 300} width={96} height={290} rx={40} fill="#fbf6ea" stroke={alpha(c, 0.6)} strokeWidth={2} />
      {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={x - 48} y1={y - 280 + i * 40} x2={x + 48} y2={y - 280 + i * 40} stroke="#000" strokeOpacity={0.08} />)}
    </g>
  );
  return (
    <g>{glow}
      <ellipse cx={x} cy={y} rx={34} ry={10} fill={metal} />
      <line x1={x} y1={y} x2={x} y2={y - 250} stroke={metal} strokeWidth={6} />
      <path d={`M${x - 42},${y - 320} h84 l10,70 h-104 z`} fill={c} />
    </g>
  );
}

export function TableLamp({ x, y, el, scale = 1 }: { x: number; y: number; el: El; scale?: number }) {
  const c = el.color;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={-60} rx={70} ry={50} fill="#fff3d0" opacity={0.4} filter="url(#soft)" />
      {el.variant === "mushroom" && (<><rect x={-8} y={-40} width={16} height={40} fill={darken(c, 0.2)} /><path d="M-48,-40 q48,-60 96,0 z" fill={c} /></>)}
      {el.variant === "dome" && (<><ellipse cx={0} cy={0} rx={22} ry={6} fill={darken(c, 0.3)} /><rect x={-3} y={-70} width={6} height={70} fill={darken(c, 0.3)} /><path d="M-40,-90 h80 l8,40 h-96 z" fill={c} /></>)}
      {el.variant === "globe" && (<><ellipse cx={0} cy={0} rx={22} ry={6} fill={darken(c, 0.3)} /><circle cx={0} cy={-40} r={34} fill="#fbf6ea" stroke={alpha(c, 0.7)} strokeWidth={3} /></>)}
    </g>
  );
}

export function Pendant({ x, y, el, scale = 1 }: { x: number; y: number; el: El; scale?: number }) {
  const c = el.color;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1={0} y1={-200} x2={0} y2={0} stroke={darken(c, 0.35)} strokeWidth={2} />
      <ellipse cx={0} cy={70} rx={110} ry={60} fill="#fff3d0" opacity={0.35} filter="url(#soft)" />
      {el.variant === "globe" && <circle cx={0} cy={30} r={44} fill="#fbf6ea" stroke={alpha(c, 0.8)} strokeWidth={4} />}
      {el.variant === "cone" && <path d="M-16,0 h32 l50,70 h-132 z" fill={c} />}
      {el.variant === "linear" && <rect x={-160} y={0} width={320} height={14} rx={7} fill={c} />}
    </g>
  );
}

export function Sconce({ x, y, el }: { x: number; y: number; el: El }) {
  const c = el.color;
  return (
    <g>
      <ellipse cx={x} cy={y + 30} rx={70} ry={60} fill="#fff3d0" opacity={0.35} filter="url(#soft)" />
      {el.variant === "globe" && (<><rect x={x - 10} y={y - 6} width={20} height={12} fill={darken(c, 0.3)} /><circle cx={x} cy={y - 26} r={22} fill="#fbf6ea" stroke={alpha(c, 0.8)} strokeWidth={3} /></>)}
      {el.variant === "tube" && <rect x={x - 6} y={y - 60} width={12} height={90} rx={6} fill="#fbf6ea" stroke={c} strokeWidth={3} />}
      {el.variant === "shade" && (<><path d={`M${x - 26},${y - 24} h52 l6,30 h-64 z`} fill={c} /><rect x={x - 3} y={y - 36} width={6} height={14} fill={darken(c, 0.3)} /></>)}
    </g>
  );
}

export function Shelving({ x, y, el, wall }: { x: number; y: number; el: El; wall: string }) {
  const c = el.color; const bookColors = [darken(wall, 0.4), lighten(c, 0.2), darken(c, 0.2), "#c9a25d", "#2f4a3a"];
  const rows = 4;
  if (el.variant === "ladder") return (
    <g>
      {[0, 1].map((i) => <line key={i} x1={x - 70 + i * 140} y1={y} x2={x - 40 + i * 80} y2={y - 330} stroke={c} strokeWidth={8} />)}
      {Array.from({ length: rows }).map((_, r) => { const w = 150 - r * 22; const yy = y - 40 - r * 78; return (
        <g key={r}><rect x={x - w / 2} y={yy} width={w} height={8} fill={c} />{Array.from({ length: 3 }).map((_, b) => <rect key={b} x={x - w / 2 + 12 + b * 40} y={yy - 40} width={16 + (b % 2) * 6} height={40} fill={bookColors[(r + b) % 5]} />)}</g>); })}
    </g>
  );
  const w = 200, h = 360;
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={el.variant === "closed" ? c : "none"} stroke={c} strokeWidth={10} />
      {Array.from({ length: rows }).map((_, r) => { const yy = y - h + 20 + r * (h / rows); return (
        <g key={r}><rect x={x - w / 2} y={yy + h / rows - 24} width={w} height={8} fill={c} />
          {el.variant !== "closed" && Array.from({ length: 5 }).map((_, b) => <rect key={b} x={x - w / 2 + 16 + b * 34} y={yy + h / rows - 24 - 48 - (b % 3) * 6} width={18 + (b % 2) * 8} height={48 + (b % 3) * 6} fill={bookColors[(r * 2 + b) % 5]} />)}
          {el.variant === "closed" && <rect x={x - w / 2 + 14} y={yy + 4} width={w - 28} height={h / rows - 34} fill={lighten(c, 0.08)} stroke={darken(c, 0.15)} strokeWidth={2} />}
        </g>); })}
    </g>
  );
}
