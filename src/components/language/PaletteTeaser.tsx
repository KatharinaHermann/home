"use client";
import { Glass, Eyebrow } from "@/components/glass/Glass";
import { MOODS, PALETTES } from "@/lib/moods";
import { useMood, usePalette, useStudio } from "@/lib/store";
import { RoomScene } from "@/components/scenes/RoomScene";
import { DEMO_APARTMENT } from "@/lib/rooms";

/** Landing-page toy: click a palette, the whole page and the room re-skin. */
export function PaletteTeaser() {
  const palette = usePalette(); const mood = useMood();
  const setPalette = useStudio((s) => s.setPalette); const setMood = useStudio((s) => s.setMood);
  return (
    <Glass strong className="p-4 lg:p-5 fade-in" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>Live preview · {mood.name} · {palette.name}</Eyebrow>
        <span className="chip">try a palette ↓</span>
      </div>
      <div className="rounded-[calc(var(--radius)*.7)] overflow-hidden shadow-lg">
        <RoomScene room={DEMO_APARTMENT[0]} palette={palette} />
      </div>
      <div className="grid grid-cols-7 gap-2 mt-4">
        {PALETTES.slice(0, 7).map((p) => (
          <button key={p.id} onClick={() => setPalette(p.id)} title={p.name} className="rounded-full overflow-hidden aspect-square flex transition-transform hover:scale-110" style={{ outline: palette.id === p.id ? "2px solid var(--accent)" : "none", outlineOffset: 2 }}>
            {p.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {MOODS.slice(0, 6).map((m) => <button key={m.id} className={`chip ${mood.id === m.id ? "chip-on" : ""}`} onClick={() => setMood(m.id)}>{m.glyph} {m.name}</button>)}
      </div>
    </Glass>
  );
}
