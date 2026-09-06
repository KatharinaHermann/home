"use client";
import { Glass } from "@/components/glass/Glass";
import { MOODS } from "@/lib/moods";
import { useStudio } from "@/lib/store";

export function MoodGrid() {
  const moodId = useStudio((s) => s.design.moodId); const setMood = useStudio((s) => s.setMood);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {MOODS.map((m) => {
        const on = m.id === moodId;
        return (
          <Glass key={m.id} lift strong={on} role="button" tabIndex={0} onClick={() => setMood(m.id)} onKeyDown={(e) => e.key === "Enter" && setMood(m.id)}
            className="p-4 cursor-pointer select-none" style={{ outline: on ? "2px solid var(--accent)" : "none", outlineOffset: -2 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl" style={{ fontFamily: "var(--font-fraunces)" }}>{m.glyph}</span>
              {on && <span className="chip chip-on">selected</span>}
            </div>
            <div className="display text-lg leading-tight">{m.name}</div>
            <div className="muted text-xs mt-1">{m.tagline}</div>
            <div className="flex flex-wrap gap-1 mt-3">{m.materials.slice(0, 3).map((k) => <span key={k} className="chip" style={{ fontSize: 10 }}>{k}</span>)}</div>
          </Glass>
        );
      })}
    </div>
  );
}
