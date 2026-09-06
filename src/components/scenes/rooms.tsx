"use client";
import { darken, lighten, mix } from "@/lib/color";
import { Art, Defs, El, Els, FLOOR_Y, FloorLamp, H, Pendant, Plant, Rug, Sconce, Shell, Shelving, Slot, TableLamp, W, Window } from "./primitives";

export type SceneProps = { els: Els; selected?: string | null; onSelect?: (id: string) => void };
const g = (els: Els, id: string): El => els[id] ?? { variant: "", color: "#888" };

function Sofa({ x, y, el }: { x: number; y: number; el: El }) {
  const c = el.color, d = darken(c, 0.14), l = lighten(c, 0.1);
  if (el.variant === "curved") return (
    <g>
      <path d={`M${x - 250},${y} q0,-90 90,-90 h320 q90,0 90,90 v40 h-500 z`} fill={c} />
      <path d={`M${x - 230},${y - 20} q0,-40 60,-40 h340 q60,0 60,40 v30 h-460 z`} fill={l} />
      <path d={`M${x - 250},${y + 40} h500 v18 q-250,30 -500,0 z`} fill={d} />
    </g>
  );
  if (el.variant === "chesterfield") return (
    <g>
      <rect x={x - 260} y={y - 120} width={520} height={140} rx={26} fill={c} />
      <rect x={x - 290} y={y - 70} width={60} height={110} rx={22} fill={d} /><rect x={x + 230} y={y - 70} width={60} height={110} rx={22} fill={d} />
      {Array.from({ length: 6 }).map((_, i) => Array.from({ length: 2 }).map((_, j) => <circle key={`${i}${j}`} cx={x - 210 + i * 84 + (j % 2) * 42} cy={y - 95 + j * 40} r={5} fill={darken(c, 0.35)} />))}
      <rect x={x - 250} y={y - 10} width={500} height={50} rx={10} fill={l} />
      <rect x={x - 250} y={y + 40} width={500} height={16} fill={d} />
    </g>
  );
  if (el.variant === "modular") return (
    <g>
      <rect x={x - 300} y={y - 90} width={600} height={110} rx={12} fill={c} />
      {[-300, -100, 100].map((dx, i) => <rect key={i} x={x + dx + 6} y={y - 20} width={188} height={70} rx={10} fill={i === 1 ? l : mix(l, c, 0.5)} />)}
      <rect x={x - 300} y={y + 50} width={600} height={14} fill={d} />
      <rect x={x + 180} y={y - 150} width={120} height={70} rx={10} fill={d} />
    </g>
  );
  return (
    <g>
      <rect x={x - 220} y={y - 110} width={440} height={130} rx={18} fill={c} />
      <rect x={x - 250} y={y - 60} width={50} height={100} rx={18} fill={d} /><rect x={x + 200} y={y - 60} width={50} height={100} rx={18} fill={d} />
      <rect x={x - 210} y={y - 20} width={205} height={60} rx={12} fill={l} /><rect x={x + 5} y={y - 20} width={205} height={60} rx={12} fill={l} />
      <rect x={x - 230} y={y + 40} width={12} height={40} fill={darken(c, 0.4)} /><rect x={x + 218} y={y + 40} width={12} height={40} fill={darken(c, 0.4)} />
      <rect x={x - 120} y={y - 95} width={80} height={60} rx={10} fill={d} transform={`rotate(-6 ${x - 80} ${y - 65})`} />
    </g>
  );
}

function CoffeeTable({ x, y, el }: { x: number; y: number; el: El }) {
  const c = el.color, d = darken(c, 0.25);
  if (el.variant === "round") return (<g><ellipse cx={x} cy={y} rx={110} ry={34} fill={c} /><ellipse cx={x} cy={y - 4} rx={110} ry={34} fill={lighten(c, 0.08)} /><rect x={x - 6} y={y} width={12} height={60} fill={d} /><ellipse cx={x} cy={y + 60} rx={40} ry={10} fill={d} /></g>);
  if (el.variant === "nesting") return (<g><rect x={x - 100} y={y - 10} width={130} height={8} fill={c} /><rect x={x - 96} y={y - 2} width={6} height={60} fill={d} /><rect x={x + 24} y={y - 2} width={6} height={60} fill={d} /><rect x={x - 20} y={y + 12} width={110} height={8} fill={c} /><rect x={x - 16} y={y + 20} width={6} height={44} fill={d} /><rect x={x + 84} y={y + 20} width={6} height={44} fill={d} /></g>);
  return (<g><polygon points={`${x - 130},${y - 20} ${x + 130},${y - 20} ${x + 150},${y + 10} ${x - 150},${y + 10}`} fill={c} /><rect x={x - 150} y={y + 10} width={300} height={10} fill={d} /><rect x={x - 140} y={y + 20} width={10} height={44} fill={d} /><rect x={x + 130} y={y + 20} width={10} height={44} fill={d} /></g>);
}

export function LivingScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      <Slot id="curtains" els={els} selected={selected} onSelect={onSelect}><Window frame={mix(wall, "#fff", 0.5)} curtain={g(els, "curtains")} /></Slot>
      {els.curtains?.hidden && <Window frame={mix(wall, "#fff", 0.5)} />}
      <Slot id="art" els={els} selected={selected} onSelect={onSelect}><Art x={560} y={170} el={g(els, "art")} wall={wall} /></Slot>
      <Slot id="shelving" els={els} selected={selected} onSelect={onSelect}><Shelving x={860} y={FLOOR_Y + 30} el={g(els, "shelving")} wall={wall} /></Slot>
      <Slot id="rug" els={els} selected={selected} onSelect={onSelect}><Rug x={520} y={FLOOR_Y + 60} w={620} h={130} el={g(els, "rug")} /></Slot>
      <Slot id="sofa" els={els} selected={selected} onSelect={onSelect}><Sofa x={520} y={FLOOR_Y + 30} el={g(els, "sofa")} /></Slot>
      <Slot id="coffeeTable" els={els} selected={selected} onSelect={onSelect}><CoffeeTable x={520} y={FLOOR_Y + 110} el={g(els, "coffeeTable")} /></Slot>
      <Slot id="floorLamp" els={els} selected={selected} onSelect={onSelect}><FloorLamp x={880} y={FLOOR_Y + 90} el={g(els, "floorLamp")} /></Slot>
      <Slot id="plant" els={els} selected={selected} onSelect={onSelect}><Plant x={140} y={FLOOR_Y + 70} el={g(els, "plant")} /></Slot>
    </svg>
  );
}

function CabinetFront({ x, y, w, h, cab }: { x: number; y: number; w: number; h: number; cab: El }) {
  const cabD = darken(cab.color, 0.12);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={cab.color} stroke={cabD} strokeWidth={2} />
      {cab.variant === "shaker" && <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="none" stroke={cabD} strokeWidth={4} />}
      {cab.variant === "fluted" && Array.from({ length: Math.floor(w / 12) }).map((_, i) => <line key={i} x1={x + 6 + i * 12} y1={y + 4} x2={x + 6 + i * 12} y2={y + h - 4} stroke={cabD} strokeWidth={3} />)}
      <rect x={x + w / 2 - 14} y={y + (cab.variant === "shaker" ? h - 30 : h / 2)} width={28} height={4} rx={2} fill={darken(cab.color, 0.45)} />
    </g>
  );
}

export function KitchenScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  const cab = g(els, "cabinets"), ctr = g(els, "counter"), bs = g(els, "backsplash");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      <Slot id="backsplash" els={els} selected={selected} onSelect={onSelect}>
        <rect x={90} y={230} width={640} height={80} fill={bs.color} />
        {bs.variant !== "slab" && <rect x={90} y={230} width={640} height={80} fill={`url(#${bs.variant})`} />}
        {bs.variant === "slab" && <path d="M120,300 q200,-40 400,-10" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} fill="none" />}
      </Slot>
      <Slot id="cabinets" els={els} selected={selected} onSelect={onSelect}>
        {[90, 250, 410, 570].map((x) => <CabinetFront key={x} x={x} y={60} w={158} h={160} cab={cab} />)}
        {[90, 250, 410, 570].map((x) => <CabinetFront key={x} x={x} y={330} w={158} h={110} cab={cab} />)}
      </Slot>
      <Slot id="counter" els={els} selected={selected} onSelect={onSelect}>
        <rect x={80} y={306} width={660} height={26} fill={ctr.color} />
        <rect x={80} y={306} width={660} height={26} fill="url(#shade)" />
        {ctr.variant === "wood" && Array.from({ length: 12 }).map((_, i) => <line key={i} x1={90 + i * 55} y1={306} x2={90 + i * 55} y2={332} stroke={darken(ctr.color, 0.2)} strokeWidth={1.5} />)}
        {ctr.variant === "stone" && <path d="M120,318 q120,-6 260,4 t200,-2" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} fill="none" />}
        {/* sink + tap */}
        <rect x={300} y={310} width={140} height={16} rx={4} fill={darken(ctr.color, 0.25)} />
        <path d="M370,306 v-40 q0,-20 20,-20 h10" stroke="#8a8f93" strokeWidth={6} fill="none" />
      </Slot>
      {/* island */}
      <Slot id="stools" els={els} selected={selected} onSelect={onSelect}>
        {[700, 800, 900].map((x) => {
          const st = g(els, "stools");
          return (<g key={x}>
            <line x1={x - 20} y1={FLOOR_Y + 40} x2={x - 24} y2={FLOOR_Y + 150} stroke={darken(st.color, 0.3)} strokeWidth={5} />
            <line x1={x + 20} y1={FLOOR_Y + 40} x2={x + 24} y2={FLOOR_Y + 150} stroke={darken(st.color, 0.3)} strokeWidth={5} />
            {st.variant === "upholstered" ? <ellipse cx={x} cy={FLOOR_Y + 40} rx={34} ry={14} fill={st.color} /> : <rect x={x - 32} y={FLOOR_Y + 30} width={64} height={12} rx={4} fill={st.color} />}
            {st.variant === "wood" && <rect x={x - 28} y={FLOOR_Y - 30} width={56} height={10} rx={3} fill={st.color} />}
            {st.variant === "metal" && <path d={`M${x - 30},${FLOOR_Y + 32} q30,-70 60,0`} stroke={st.color} strokeWidth={5} fill="none" />}
          </g>);
        })}
      </Slot>
      <Slot id="pendant" els={els} selected={selected} onSelect={onSelect}>
        <Pendant x={720} y={200} el={g(els, "pendant")} scale={0.8} />
        {g(els, "pendant").variant !== "linear" && <><Pendant x={800} y={200} el={g(els, "pendant")} scale={0.8} /><Pendant x={880} y={200} el={g(els, "pendant")} scale={0.8} /></>}
      </Slot>
      <Slot id="plant" els={els} selected={selected} onSelect={onSelect}><Plant x={640} y={306} el={g(els, "plant")} scale={0.35} /></Slot>
    </svg>
  );
}

export function BedroomScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  const bed = g(els, "bed"), ns = g(els, "nightstands"), wd = g(els, "wardrobe");
  const bc = bed.color;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      <Slot id="curtains" els={els} selected={selected} onSelect={onSelect}><Window x={110} y={60} w={180} h={230} frame={mix(wall, "#fff", 0.5)} curtain={g(els, "curtains")} /></Slot>
      {els.curtains?.hidden && <Window x={110} y={60} w={180} h={230} frame={mix(wall, "#fff", 0.5)} />}
      <Slot id="art" els={els} selected={selected} onSelect={onSelect}><Art x={520} y={130} el={g(els, "art")} wall={wall} /></Slot>
      <Slot id="wardrobe" els={els} selected={selected} onSelect={onSelect}>
        <rect x={790} y={50} width={150} height={FLOOR_Y - 40} fill={wd.color} stroke={darken(wd.color, 0.2)} strokeWidth={3} />
        {wd.variant === "hinged" && <><line x1={865} y1={60} x2={865} y2={FLOOR_Y} stroke={darken(wd.color, 0.25)} strokeWidth={3} /><circle cx={855} cy={250} r={4} fill={darken(wd.color, 0.5)} /><circle cx={875} cy={250} r={4} fill={darken(wd.color, 0.5)} /></>}
        {wd.variant === "sliding" && <><rect x={790} y={50} width={80} height={FLOOR_Y - 40} fill={lighten(wd.color, 0.06)} /><line x1={870} y1={50} x2={870} y2={FLOOR_Y + 10} stroke={darken(wd.color, 0.3)} strokeWidth={4} /></>}
        {wd.variant === "open" && <><rect x={800} y={60} width={130} height={FLOOR_Y - 60} fill={darken(wall, 0.1)} /><line x1={800} y1={110} x2={930} y2={110} stroke={wd.color} strokeWidth={5} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={812 + i * 24} y={116} width={14} height={140} rx={4} fill={[lighten(bc, 0.2), darken(bc, 0.2), "#e9dfcf", bc, "#4a4640"][i]} />)}</>}
      </Slot>
      <Slot id="rug" els={els} selected={selected} onSelect={onSelect}><Rug x={500} y={FLOOR_Y + 90} w={640} h={110} el={g(els, "rug")} /></Slot>
      <Slot id="nightstands" els={els} selected={selected} onSelect={onSelect}>
        {[250, 750].map((x) => (<g key={x}>
          {ns.variant === "floating" ? <rect x={x - 50} y={FLOOR_Y - 20} width={100} height={16} fill={ns.color} /> : ns.variant === "pedestal" ? <><ellipse cx={x} cy={FLOOR_Y + 20} rx={40} ry={10} fill={ns.color} /><rect x={x - 5} y={FLOOR_Y + 20} width={10} height={50} fill={darken(ns.color, 0.2)} /></> : <><rect x={x - 50} y={FLOOR_Y - 30} width={100} height={100} rx={6} fill={ns.color} /><rect x={x - 20} y={FLOOR_Y + 5} width={40} height={4} fill={darken(ns.color, 0.4)} /></>}
        </g>))}
      </Slot>
      <Slot id="tableLamp" els={els} selected={selected} onSelect={onSelect}><TableLamp x={250} y={ns.variant === "floating" ? FLOOR_Y - 20 : FLOOR_Y - 30} el={g(els, "tableLamp")} scale={0.9} /><TableLamp x={750} y={ns.variant === "floating" ? FLOOR_Y - 20 : FLOOR_Y - 30} el={g(els, "tableLamp")} scale={0.9} /></Slot>
      <Slot id="bed" els={els} selected={selected} onSelect={onSelect}>
        {bed.variant === "canopy" && <><rect x={300} y={80} width={8} height={400} fill={darken(bc, 0.3)} /><rect x={692} y={80} width={8} height={400} fill={darken(bc, 0.3)} /><rect x={300} y={80} width={400} height={8} fill={darken(bc, 0.3)} /></>}
        {bed.variant === "upholstered" && <rect x={300} y={FLOOR_Y - 220} width={400} height={230} rx={40} fill={bc} />}
        {bed.variant === "platform" && <rect x={310} y={FLOOR_Y - 150} width={380} height={150} rx={6} fill={bc} />}
        {bed.variant === "spindle" && <>{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={318 + i * 32} y={FLOOR_Y - 190} width={10} height={190} rx={5} fill={bc} />)}<rect x={310} y={FLOOR_Y - 200} width={380} height={12} rx={6} fill={darken(bc, 0.1)} /></>}
        {bed.variant === "canopy" && <rect x={310} y={FLOOR_Y - 160} width={380} height={160} rx={6} fill={bc} />}
        {/* mattress + duvet */}
        <polygon points={`320,${FLOOR_Y - 20} 680,${FLOOR_Y - 20} 720,${FLOOR_Y + 120} 280,${FLOOR_Y + 120}`} fill="#f5f1ea" />
        <path d={`M290,${FLOOR_Y + 40} q210,-30 420,0 l12,80 h-444 z`} fill={mix(bc, "#fff", 0.35)} />
        <path d={`M290,${FLOOR_Y + 40} q210,-30 420,0`} stroke="#000" strokeOpacity={0.08} strokeWidth={6} fill="none" />
        <rect x={360} y={FLOOR_Y - 60} width={120} height={50} rx={12} fill="#fbf8f3" /><rect x={520} y={FLOOR_Y - 60} width={120} height={50} rx={12} fill="#fbf8f3" />
        <rect x={330} y={FLOOR_Y + 90} width={340} height={40} rx={8} fill={darken(bc, 0.15)} />
        {/* legs */}
        <rect x={296} y={FLOOR_Y + 120} width={14} height={30} fill={darken(bc, 0.4)} /><rect x={690} y={FLOOR_Y + 120} width={14} height={30} fill={darken(bc, 0.4)} />
      </Slot>
    </svg>
  );
}

export function BathroomScene({ els, selected, onSelect }: SceneProps) {
  const wallEl = g(els, "walls"), wall = wallEl.color, floor = g(els, "floor").color;
  const van = g(els, "vanity"), mir = g(els, "mirror");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant="flat" floorVariant={g(els, "floor").variant} />
      <Slot id="walls" els={els} selected={selected} onSelect={onSelect}>
        {wallEl.variant !== "flat" && <rect x={0} y={0} width={W} height={FLOOR_Y} fill={`url(#${wallEl.variant === "slab" ? "tiles" : wallEl.variant})`} />}
      </Slot>
      {/* tub */}
      <g><rect x={90} y={FLOOR_Y - 90} width={330} height={120} rx={30} fill="#f4f4f2" /><rect x={100} y={FLOOR_Y - 80} width={310} height={30} rx={14} fill="#dfe2e3" /><path d="M120,340 v-60 q0,-14 14,-14 h10" stroke="#8a8f93" strokeWidth={6} fill="none" /></g>
      <Slot id="mirror" els={els} selected={selected} onSelect={onSelect}>
        {mir.variant === "round" && <><circle cx={640} cy={170} r={80} fill="#cfe3ec" stroke={mir.color} strokeWidth={8} /><path d="M600,130 q40,-30 80,0" stroke="#fff" strokeOpacity={0.7} strokeWidth={4} fill="none" /></>}
        {mir.variant === "arch" && <><path d="M570,260 v-90 a70,70 0 0 1 140,0 v90 z" fill="#cfe3ec" stroke={mir.color} strokeWidth={8} /></>}
        {mir.variant === "rect" && <rect x={560} y={90} width={160} height={170} fill="#cfe3ec" stroke={mir.color} strokeWidth={8} />}
      </Slot>
      <Slot id="sconce" els={els} selected={selected} onSelect={onSelect}><Sconce x={520} y={160} el={g(els, "sconce")} /><Sconce x={760} y={160} el={g(els, "sconce")} /></Slot>
      <Slot id="vanity" els={els} selected={selected} onSelect={onSelect}>
        {van.variant === "floating" && <rect x={520} y={FLOOR_Y - 130} width={240} height={90} rx={6} fill={van.color} />}
        {van.variant === "cabinet" && <><rect x={520} y={FLOOR_Y - 130} width={240} height={150} rx={6} fill={van.color} /><line x1={640} y1={FLOOR_Y - 120} x2={640} y2={FLOOR_Y + 10} stroke={darken(van.color, 0.25)} strokeWidth={3} /></>}
        {van.variant === "console" && <><rect x={520} y={FLOOR_Y - 130} width={240} height={30} rx={4} fill={van.color} />{[530, 745].map((x) => <rect key={x} x={x} y={FLOOR_Y - 100} width={10} height={130} fill={darken(van.color, 0.2)} />)}<rect x={530} y={FLOOR_Y - 20} width={220} height={6} fill={darken(van.color, 0.2)} /></>}
        <rect x={510} y={FLOOR_Y - 140} width={260} height={14} rx={3} fill="#f2f0eb" />
        <ellipse cx={640} cy={FLOOR_Y - 134} rx={50} ry={9} fill="#e1e3e2" />
        <path d={`M640,${FLOOR_Y - 140} v-40 q0,-14 14,-14`} stroke="#8a8f93" strokeWidth={5} fill="none" />
      </Slot>
      <Slot id="textiles" els={els} selected={selected} onSelect={onSelect}>
        <rect x={820} y={180} width={70} height={110} rx={6} fill={g(els, "textiles").color} />
        {g(els, "textiles").variant === "striped" && [0, 1, 2].map((i) => <rect key={i} x={820} y={200 + i * 30} width={70} height={8} fill="#fff" opacity={0.6} />)}
        <rect x={810} y={176} width={90} height={6} rx={3} fill="#8a8f93" />
        <Rug x={640} y={FLOOR_Y + 60} w={220} h={60} el={{ ...g(els, "textiles"), variant: "plain" }} />
      </Slot>
      <Slot id="plant" els={els} selected={selected} onSelect={onSelect}><Plant x={140} y={FLOOR_Y - 120} el={g(els, "plant")} scale={0.5} /></Slot>
    </svg>
  );
}

export function OfficeScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  const desk = g(els, "desk"), ch = g(els, "chair");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      <Window x={120} y={70} w={200} h={240} frame={mix(wall, "#fff", 0.5)} />
      <Slot id="art" els={els} selected={selected} onSelect={onSelect}><Art x={500} y={160} el={g(els, "art")} wall={wall} /></Slot>
      <Slot id="shelving" els={els} selected={selected} onSelect={onSelect}><Shelving x={860} y={FLOOR_Y + 30} el={g(els, "shelving")} wall={wall} /></Slot>
      <Slot id="rug" els={els} selected={selected} onSelect={onSelect}><Rug x={500} y={FLOOR_Y + 80} w={520} h={110} el={g(els, "rug")} /></Slot>
      <Slot id="desk" els={els} selected={selected} onSelect={onSelect}>
        <rect x={300} y={FLOOR_Y - 40} width={400} height={16} rx={4} fill={desk.color} />
        {desk.variant === "trestle" && [320, 660].map((x) => <g key={x}><line x1={x} y1={FLOOR_Y - 24} x2={x - 20} y2={FLOOR_Y + 100} stroke={darken(desk.color, 0.3)} strokeWidth={6} /><line x1={x} y1={FLOOR_Y - 24} x2={x + 20} y2={FLOOR_Y + 100} stroke={darken(desk.color, 0.3)} strokeWidth={6} /></g>)}
        {desk.variant === "sitstand" && [340, 660].map((x) => <g key={x}><rect x={x - 8} y={FLOOR_Y - 24} width={16} height={120} fill="#3b3d40" /><rect x={x - 40} y={FLOOR_Y + 92} width={80} height={8} rx={3} fill="#3b3d40" /></g>)}
        {desk.variant === "writing" && <><rect x={300} y={FLOOR_Y - 24} width={400} height={50} rx={4} fill={darken(desk.color, 0.08)} />{[312, 676].map((x) => <rect key={x} x={x} y={FLOOR_Y + 26} width={12} height={76} fill={darken(desk.color, 0.3)} />)}<rect x={420} y={FLOOR_Y - 4} width={40} height={4} fill={darken(desk.color, 0.5)} /></>}
        {/* laptop */}
        <rect x={440} y={FLOOR_Y - 120} width={120} height={80} rx={4} fill="#2b2d31" /><rect x={446} y={FLOOR_Y - 114} width={108} height={66} fill="#8fb3c9" /><rect x={430} y={FLOOR_Y - 42} width={140} height={6} rx={2} fill="#3b3d40" />
      </Slot>
      <Slot id="deskLamp" els={els} selected={selected} onSelect={onSelect}><TableLamp x={640} y={FLOOR_Y - 40} el={g(els, "deskLamp")} scale={0.75} /></Slot>
      <Slot id="chair" els={els} selected={selected} onSelect={onSelect}>
        {ch.variant === "task" && <><rect x={460} y={FLOOR_Y - 10} width={80} height={110} rx={20} fill={ch.color} /><rect x={445} y={FLOOR_Y + 90} width={110} height={26} rx={12} fill={ch.color} /><rect x={496} y={FLOOR_Y + 116} width={8} height={40} fill="#3b3d40" /><path d={`M460,${FLOOR_Y + 160} h80 M470,${FLOOR_Y + 160} l-20,14 M530,${FLOOR_Y + 160} l20,14`} stroke="#3b3d40" strokeWidth={6} /></>}
        {ch.variant === "wood" && <><rect x={462} y={FLOOR_Y - 20} width={76} height={100} rx={28} fill={ch.color} /><rect x={448} y={FLOOR_Y + 80} width={104} height={24} rx={8} fill={ch.color} />{[456, 540].map((x) => <line key={x} x1={x} y1={FLOOR_Y + 104} x2={x - 6 + (x > 500 ? 12 : 0)} y2={FLOOR_Y + 170} stroke={darken(ch.color, 0.35)} strokeWidth={6} />)}</>}
        {ch.variant === "lounge" && <><path d={`M440,${FLOOR_Y + 120} v-110 q60,-40 120,0 v110 z`} fill={ch.color} /><ellipse cx={500} cy={FLOOR_Y + 120} rx={70} ry={20} fill={lighten(ch.color, 0.1)} /><path d={`M500,${FLOOR_Y + 140} v30 M470,${FLOOR_Y + 172} h60`} stroke="#3b3d40" strokeWidth={6} /></>}
      </Slot>
      <Slot id="plant" els={els} selected={selected} onSelect={onSelect}><Plant x={140} y={FLOOR_Y + 70} el={g(els, "plant")} /></Slot>
    </svg>
  );
}

function DiningChair({ x, back, ch }: { x: number; back?: boolean; ch: El }) {
  return (
    <g opacity={back ? 0.9 : 1}>
      {ch.variant === "shell" ? <path d={`M${x - 34},${FLOOR_Y + 40} q34,-90 68,0 v30 h-68 z`} fill={ch.color} /> : ch.variant === "upholstered" ? <rect x={x - 34} y={FLOOR_Y - 40} width={68} height={110} rx={16} fill={ch.color} /> : <>{[-26, -9, 9, 26].map((dx) => <rect key={dx} x={x + dx - 3} y={FLOOR_Y - 40} width={6} height={100} rx={3} fill={ch.color} />)}<rect x={x - 34} y={FLOOR_Y - 46} width={68} height={8} rx={4} fill={ch.color} /></>}
      <rect x={x - 36} y={FLOOR_Y + 60} width={72} height={14} rx={4} fill={darken(ch.color, 0.1)} />
      {[-30, 30].map((dx) => <line key={dx} x1={x + dx} y1={FLOOR_Y + 74} x2={x + dx * 1.15} y2={FLOOR_Y + 140} stroke={darken(ch.color, 0.3)} strokeWidth={5} />)}
    </g>
  );
}

export function DiningScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  const t = g(els, "table"), ch = g(els, "chairs"), sb = g(els, "sideboard");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      <Slot id="art" els={els} selected={selected} onSelect={onSelect}><Art x={500} y={150} el={g(els, "art")} wall={wall} /></Slot>
      <Slot id="sideboard" els={els} selected={selected} onSelect={onSelect}>
        <rect x={780} y={sb.variant === "tall" ? 120 : FLOOR_Y - 110} width={170} height={sb.variant === "tall" ? FLOOR_Y - 100 : 120} rx={6} fill={sb.color} />
        {sb.variant === "fluted" && Array.from({ length: 14 }).map((_, i) => <line key={i} x1={786 + i * 12} y1={FLOOR_Y - 104} x2={786 + i * 12} y2={FLOOR_Y + 4} stroke={darken(sb.color, 0.18)} strokeWidth={4} />)}
        {sb.variant === "low" && <line x1={865} y1={FLOOR_Y - 100} x2={865} y2={FLOOR_Y} stroke={darken(sb.color, 0.25)} strokeWidth={3} />}
        <rect x={790} y={FLOOR_Y + 10} width={8} height={24} fill={darken(sb.color, 0.4)} /><rect x={932} y={FLOOR_Y + 10} width={8} height={24} fill={darken(sb.color, 0.4)} />
      </Slot>
      <Slot id="pendant" els={els} selected={selected} onSelect={onSelect}><Pendant x={500} y={190} el={g(els, "pendant")} /></Slot>
      <Slot id="rug" els={els} selected={selected} onSelect={onSelect}><Rug x={500} y={FLOOR_Y + 70} w={640} h={130} el={g(els, "rug")} /></Slot>
      <Slot id="chairs" els={els} selected={selected} onSelect={onSelect}><DiningChair x={380} back ch={ch} /><DiningChair x={620} back ch={ch} /></Slot>
      <Slot id="table" els={els} selected={selected} onSelect={onSelect}>
        {t.variant === "round" ? <ellipse cx={500} cy={FLOOR_Y + 50} rx={150} ry={46} fill={t.color} /> : t.variant === "oval" ? <ellipse cx={500} cy={FLOOR_Y + 50} rx={210} ry={44} fill={t.color} /> : <polygon points={`320,${FLOOR_Y + 20} 680,${FLOOR_Y + 20} 710,${FLOOR_Y + 80} 290,${FLOOR_Y + 80}`} fill={t.color} />}
        <ellipse cx={500} cy={FLOOR_Y + 50} rx={t.variant === "oval" ? 210 : 150} ry={44} fill="url(#shade)" opacity={0.5} />
        {t.variant === "round" ? <><rect x={492} y={FLOOR_Y + 60} width={16} height={90} fill={darken(t.color, 0.25)} /><ellipse cx={500} cy={FLOOR_Y + 150} rx={60} ry={12} fill={darken(t.color, 0.25)} /></> : [320, 680].map((x) => <rect key={x} x={x - 6} y={FLOOR_Y + 70} width={12} height={80} fill={darken(t.color, 0.3)} />)}
        <ellipse cx={500} cy={FLOOR_Y + 36} rx={26} ry={10} fill="#e9dfcf" /><circle cx={500} cy={FLOOR_Y + 8} r={14} fill="#8c9a7e" /><circle cx={512} cy={FLOOR_Y} r={10} fill="#a8b5a0" />
      </Slot>
      <Slot id="chairs" els={els} selected={selected} onSelect={onSelect}><g transform={`translate(0,60)`}><DiningChair x={400} ch={ch} /><DiningChair x={600} ch={ch} /></g></Slot>
    </svg>
  );
}

export function HallwayScene({ els, selected, onSelect }: SceneProps) {
  const wall = g(els, "walls").color, floor = g(els, "floor").color;
  const con = g(els, "console"), mir = g(els, "mirror"), cr = g(els, "coatRack");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onClick={() => onSelect?.("walls")}>
      <Defs wall={wall} floor={floor} />
      <Shell wall={wall} floor={floor} wallVariant={g(els, "walls").variant} floorVariant={g(els, "floor").variant} />
      {/* door */}
      <rect x={120} y={60} width={200} height={FLOOR_Y - 60} fill={darken(wall, 0.25)} /><rect x={132} y={72} width={176} height={FLOOR_Y - 84} fill={darken(wall, 0.18)} /><circle cx={290} cy={260} r={7} fill="#b99145" />
      <Slot id="mirror" els={els} selected={selected} onSelect={onSelect}>
        {mir.variant === "round" && <circle cx={560} cy={190} r={80} fill="#cfe3ec" stroke={mir.color} strokeWidth={8} />}
        {mir.variant === "arch" && <path d="M490,280 v-110 a70,70 0 0 1 140,0 v110 z" fill="#cfe3ec" stroke={mir.color} strokeWidth={8} />}
        {mir.variant === "rect" && <rect x={490} y={100} width={140} height={180} fill="#cfe3ec" stroke={mir.color} strokeWidth={8} />}
      </Slot>
      <Slot id="sconce" els={els} selected={selected} onSelect={onSelect}><Sconce x={420} y={190} el={g(els, "sconce")} /></Slot>
      <Slot id="coatRack" els={els} selected={selected} onSelect={onSelect}>
        {cr.variant === "wall" ? <><rect x={760} y={190} width={180} height={12} rx={6} fill={cr.color} />{[780, 830, 880, 930].map((x) => <g key={x}><circle cx={x} cy={214} r={7} fill={darken(cr.color, 0.3)} />{x === 830 && <path d={`M${x},220 q-40,60 -30,150 h70 q10,-90 -30,-150`} fill="#8a9aa8" />}</g>)}</> : <><line x1={860} y1={FLOOR_Y + 60} x2={860} y2={120} stroke={cr.color} strokeWidth={8} />{[-1, 1].map((s) => <path key={s} d={`M860,140 q${s * 40},10 ${s * 50},40`} stroke={cr.color} strokeWidth={6} fill="none" />)}<path d="M820,180 q-40,70 -30,160 h60 q10,-90 -20,-160" fill="#8a9aa8" /><ellipse cx={860} cy={FLOOR_Y + 60} rx={40} ry={10} fill={darken(cr.color, 0.2)} /></>}
      </Slot>
      <Slot id="runner" els={els} selected={selected} onSelect={onSelect}><Rug x={500} y={FLOOR_Y + 70} w={300} h={130} el={g(els, "runner")} /></Slot>
      <Slot id="console" els={els} selected={selected} onSelect={onSelect}>
        {con.variant === "bench" ? <><rect x={430} y={FLOOR_Y - 30} width={260} height={30} rx={8} fill={con.color} /><rect x={440} y={FLOOR_Y - 46} width={240} height={20} rx={8} fill={lighten(con.color, 0.25)} />{[440, 670].map((x) => <rect key={x} x={x} y={FLOOR_Y} width={10} height={70} fill={darken(con.color, 0.3)} />)}</> : <><rect x={430} y={FLOOR_Y - 60} width={260} height={con.variant === "drawer" ? 60 : 14} rx={4} fill={con.color} />{con.variant === "drawer" && <rect x={540} y={FLOOR_Y - 34} width={40} height={4} fill={darken(con.color, 0.5)} />}{[440, 670].map((x) => <rect key={x} x={x} y={FLOOR_Y - 46 + (con.variant === "drawer" ? 46 : 0)} width={con.variant === "slim" ? 4 : 10} height={con.variant === "drawer" ? 90 : 136} fill={darken(con.color, 0.3)} />)}<ellipse cx={500} cy={FLOOR_Y - 66} rx={22} ry={8} fill="#e9dfcf" /><ellipse cx={640} cy={FLOOR_Y - 60} rx={30} ry={5} fill="#b99145" /></>}
      </Slot>
    </svg>
  );
}
