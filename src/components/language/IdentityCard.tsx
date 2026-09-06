"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Glass, Button, Eyebrow, Chip } from "@/components/glass/Glass";
import { useMood, usePalette, useStudio } from "@/lib/store";
import { luminance } from "@/lib/color";
import type { Palette } from "@/lib/moods";

/** The "corporate identity" of the home: mood + palette + vocabulary. Also hosts the Claude analysis button. */
export function IdentityCard() {
  const mood = useMood(); const palette = usePalette();
  const design = useStudio((s) => s.design);
  const { setMood, setPalette, setKeywords, setMaterials, addCustomPalette, setDesignName } = useStudio();
  const [busy, setBusy] = useState(false); const [summary, setSummary] = useState<string | null>(null); const [mode, setMode] = useState<string | null>(null);

  const analyze = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/design/analyze", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          images: design.moodboard.filter((m) => m.kind === "image" && m.src?.startsWith("data:")).map((m) => ({ dataUrl: m.src })),
          notes: design.moodboard.filter((m) => m.kind === "note").map((m) => m.text),
          urls: design.moodboard.filter((m) => m.url).map((m) => m.url),
          extractedColors: design.moodboard.flatMap((m) => m.colors ?? []).slice(0, 10),
        }),
      });
      const data = await res.json();
      setMood(data.moodId); setKeywords(data.keywords); setMaterials(data.materials); setSummary(data.summary); setMode(data.mode);
      if (data.palette?.length === 5) {
        addCustomPalette({ id: `ai-${Date.now().toString(36)}`, name: "Extracted identity", colors: data.palette as Palette["colors"], dark: luminance(data.palette[0]) < 0.25, tags: ["custom", "ai"] });
      } else setPalette(mood.paletteId);
    } finally { setBusy(false); }
  };

  return (
    <Glass strong className="p-5 lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <Eyebrow className="mb-1">Core design language</Eyebrow>
          <input value={design.name} onChange={(e) => setDesignName(e.target.value)} className="display text-2xl bg-transparent outline-none w-full" />
        </div>
        <span className="text-3xl" style={{ fontFamily: "var(--font-fraunces)" }}>{mood.glyph}</span>
      </div>
      <div className="flex gap-1.5 mb-4">{palette.colors.map((c, i) => <span key={i} className="swatch" style={{ background: c }} title={c} />)}</div>
      <div className="display text-lg leading-snug">{mood.name} <span className="muted">·</span> {palette.name}</div>
      <p className="muted text-sm mt-1">{summary ?? mood.description}</p>
      <div className="mt-4">
        <Eyebrow className="mb-1.5">Keywords</Eyebrow>
        <div className="flex flex-wrap gap-1.5">{design.keywords.map((k) => <Chip key={k} on onClick={() => setKeywords(design.keywords.filter((x) => x !== k))}>{k} ×</Chip>)}</div>
      </div>
      <div className="mt-3">
        <Eyebrow className="mb-1.5">Materials</Eyebrow>
        <div className="flex flex-wrap gap-1.5">{design.materials.map((k) => <Chip key={k} onClick={() => setMaterials(design.materials.filter((x) => x !== k))}>{k} ×</Chip>)}</div>
      </div>
      <div className="mt-3">
        <Eyebrow className="mb-1.5">Typography · shape · motion</Eyebrow>
        <div className="flex gap-1.5 flex-wrap"><span className="chip">{mood.font}</span><span className="chip">radius {mood.radius}px</span><span className="chip">energy {Math.round(mood.energy * 100)}%</span></div>
      </div>
      <Button variant="accent" className="w-full mt-5" onClick={analyze} disabled={busy}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {busy ? "Reading your mood board…" : "Build identity from mood board"}
      </Button>
      <p className="muted text-[11px] mt-2 text-center">{mode === "claude" ? "Analysed with Claude vision." : mode === "heuristic" ? "Heuristic mode: set ANTHROPIC_API_KEY for vision analysis." : "Uses Claude vision on your screenshots and notes."}</p>
    </Glass>
  );
}
