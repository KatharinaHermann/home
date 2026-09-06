"use client";
import { useState } from "react";
import { Wand2, Plus } from "lucide-react";
import { Glass, Button, Input } from "@/components/glass/Glass";
import { PALETTES, type Palette } from "@/lib/moods";
import { useStudio } from "@/lib/store";
import { luminance } from "@/lib/color";

export function PaletteGrid() {
  const paletteId = useStudio((s) => s.design.paletteId);
  const custom = useStudio((s) => s.design.customPalettes);
  const setPalette = useStudio((s) => s.setPalette);
  const addCustom = useStudio((s) => s.addCustomPalette);
  const [edit, setEdit] = useState<string[]>(["#EFE8DC", "#D9CDBA", "#B5946B", "#8C9A7E", "#3A342C"]);
  const [name, setName] = useState("My palette");

  const all: Palette[] = [...custom, ...PALETTES];
  const save = () => {
    const dark = luminance(edit[0]) < 0.25;
    addCustom({ id: `custom-${Date.now().toString(36)}`, name: name || "My palette", colors: edit as Palette["colors"], dark, tags: ["custom"] });
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {all.map((p) => {
          const on = p.id === paletteId;
          return (
            <Glass key={p.id} lift strong={on} role="button" tabIndex={0} onClick={() => setPalette(p.id)} className="p-3 cursor-pointer" style={{ outline: on ? "2px solid var(--accent)" : "none", outlineOffset: -2 }}>
              <div className="flex gap-1.5 mb-2.5">{p.colors.map((c, i) => <span key={i} className="swatch" style={{ background: c }} />)}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{p.name}</span>
                {p.dark && <span className="chip" style={{ fontSize: 10 }}>dark</span>}
                {p.tags.includes("custom") && <span className="chip" style={{ fontSize: 10 }}>yours</span>}
              </div>
            </Glass>
          );
        })}
      </div>
      <Glass className="p-4">
        <div className="flex items-center gap-2 mb-3"><Wand2 size={16} /><span className="font-medium text-sm">Compose your own palette</span><span className="muted text-xs">wall · secondary · wood · accent · ink</span></div>
        <div className="flex flex-wrap items-center gap-3">
          {edit.map((c, i) => (
            <label key={i} className="relative w-12 h-12 rounded-[40%] overflow-hidden cursor-pointer shadow" style={{ background: c }}>
              <input type="color" value={c} onChange={(e) => setEdit(edit.map((x, j) => (j === i ? e.target.value : x)))} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
          ))}
          <Input value={name} onChange={(e) => setName(e.target.value)} className="!w-44" placeholder="Palette name" />
          <Button size="sm" variant="accent" onClick={save}><Plus size={14} /> Save & apply</Button>
        </div>
      </Glass>
    </div>
  );
}
