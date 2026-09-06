"use client";
import { useRef, useState } from "react";
import { ImagePlus, Link2, StickyNote, X, Pipette } from "lucide-react";
import { Glass, Button, Input } from "@/components/glass/Glass";
import { fileToDataUrl, paletteFromImage } from "@/lib/image";
import { useStudio } from "@/lib/store";
import { luminance } from "@/lib/color";
import type { Palette } from "@/lib/moods";

export function MoodBoard() {
  const items = useStudio((s) => s.design.moodboard);
  const add = useStudio((s) => s.addMoodItem); const remove = useStudio((s) => s.removeMoodItem);
  const addCustom = useStudio((s) => s.addCustomPalette);
  const connectors = useStudio((s) => s.connectors);
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(""); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files) return; setBusy(true);
    for (const f of Array.from(files).slice(0, 8)) {
      if (!f.type.startsWith("image/")) continue;
      const src = await fileToDataUrl(f);
      const colors = await paletteFromImage(src);
      add({ kind: "image", src, colors });
    }
    setBusy(false);
  };
  const addUrl = () => {
    if (!url.trim()) return;
    const isPin = /pinterest\./i.test(url);
    add({ kind: isPin ? "pinterest" : "image", url: url.trim(), src: isPin ? undefined : url.trim(), text: isPin ? "Pinterest board" : undefined });
    setUrl("");
  };
  const applyPaletteFrom = (colors: string[], label: string) => {
    if (colors.length < 5) return;
    addCustom({ id: `img-${Date.now().toString(36)}`, name: label, colors: colors.slice(0, 5) as Palette["colors"], dark: luminance(colors[0]) < 0.25, tags: ["custom", "extracted"] });
  };

  return (
    <div className="space-y-3">
      <Glass className="p-3 flex flex-wrap items-center gap-2" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={busy}><ImagePlus size={14} /> {busy ? "Reading…" : "Add screenshots"}</Button>
        <div className="flex-1 min-w-[220px] flex gap-2">
          <Input placeholder="Paste a Pinterest board or image URL" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()} />
          <Button size="sm" onClick={addUrl}><Link2 size={14} /></Button>
        </div>
        <a href="/api/connectors/pinterest/authorize?return=/studio/language" className="btn btn-sm" title="Import boards via the Pinterest API (needs PINTEREST_APP_ID)">
          {connectors.pinterest.connected ? "Pinterest connected" : "Connect Pinterest"}
        </a>
      </Glass>
      <Glass className="p-3 flex gap-2">
        <Input placeholder="Add a note: “warm but not cluttered, love walnut, hate grey”" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) { add({ kind: "note", text: note.trim() }); setNote(""); } }} />
        <Button size="sm" onClick={() => { if (note.trim()) { add({ kind: "note", text: note.trim() }); setNote(""); } }}><StickyNote size={14} /></Button>
      </Glass>

      {items.length === 0 ? (
        <Glass className="p-8 text-center muted text-sm border-dashed" style={{ borderStyle: "dashed" }}>
          Drop screenshots, Pinterest pins or notes here. We extract colours from every image and tune the palette + mood to them.
        </Glass>
      ) : (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-3 [&>*]:mb-3">
          {items.map((it) => (
            <Glass key={it.id} lift className="p-2 break-inside-avoid overflow-hidden group relative">
              <button onClick={() => remove(it.id)} className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition" style={{ background: "var(--glass-strong)" }}><X size={12} /></button>
              {it.kind === "image" && it.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.src} alt="" className="w-full rounded-[calc(var(--radius)*.5)] object-cover" />
              )}
              {it.kind === "pinterest" && (
                <div className="p-3">
                  <div className="text-xs mono muted mb-1">PINTEREST</div>
                  <a href={it.url} target="_blank" rel="noreferrer" className="text-sm underline break-all">{it.url}</a>
                  <p className="muted text-[11px] mt-2">Pins are fetched once Pinterest is connected (API v5, boards:read).</p>
                </div>
              )}
              {it.kind === "note" && <p className="p-3 display text-lg leading-snug">“{it.text}”</p>}
              {it.colors && it.colors.length > 0 && (
                <div className="flex items-center gap-1 mt-2 px-1 pb-1">
                  {it.colors.map((c) => <span key={c} className="w-5 h-5 rounded-full" style={{ background: c }} />)}
                  <button className="ml-auto btn btn-xs" onClick={() => applyPaletteFrom(it.colors!, "From screenshot")}><Pipette size={11} /> use</button>
                </div>
              )}
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}
