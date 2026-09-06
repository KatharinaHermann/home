"use client";
import { useRef, useState } from "react";
import { Upload, Loader2, Wand2, Home } from "lucide-react";
import { Glass, Button, Input } from "@/components/glass/Glass";
import { fileToDataUrl } from "@/lib/image";
import { useStudio } from "@/lib/store";

export function SketchUpload() {
  const setRooms = useStudio((s) => s.setRooms); const loadDemo = useStudio((s) => s.loadDemo);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hint, setHint] = useState(""); const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ confidence: number; mode: string } | null>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 6)) if (f.type.startsWith("image/")) urls.push(await fileToDataUrl(f, 1200));
    setPreviews((p) => [...p, ...urls].slice(0, 6));
  };
  const build = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/rooms/parse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ images: previews.map((dataUrl) => ({ dataUrl })), hint }) });
      const data = await res.json();
      setRooms(data.rooms); setResult({ confidence: data.confidence, mode: data.mode });
    } finally { setBusy(false); }
  };
  return (
    <Glass className="p-4 space-y-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload sketch or photos</Button>
        <Button size="sm" variant="ghost" onClick={() => { loadDemo(); setResult(null); }}><Home size={14} /> Load demo flat</Button>
        <span className="muted text-xs">Floor plan with dimensions works best; photos of each room also work.</span>
      </div>
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p} alt="" className="h-20 rounded-lg object-cover" />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input placeholder="Hint: “Altbau, 3.2m ceilings, living room is the big one on the left”" value={hint} onChange={(e) => setHint(e.target.value)} />
        <Button variant="accent" size="sm" onClick={build} disabled={busy || previews.length === 0}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Build model</Button>
      </div>
      {result && (
        <div className="text-xs muted">
          {result.mode === "claude" ? `Reconstructed with Claude vision · confidence ${Math.round(result.confidence * 100)}%. Check the dimensions below.` : "Demo mode: no ANTHROPIC_API_KEY set, so a sample apartment was loaded. Edit dimensions to match yours."}
        </div>
      )}
    </Glass>
  );
}
