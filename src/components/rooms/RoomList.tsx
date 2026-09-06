"use client";
import { useRef } from "react";
import { Trash2, Plus, Camera } from "lucide-react";
import { Glass, Button, Input } from "@/components/glass/Glass";
import { ROOM_META, type Room, type RoomType } from "@/lib/rooms";
import { useStudio } from "@/lib/store";
import { fileToDataUrl } from "@/lib/image";

function RoomRow({ r, on, onSelect }: { r: Room; on: boolean; onSelect: () => void }) {
  const updateRoom = useStudio((s) => s.updateRoom); const removeRoom = useStudio((s) => s.removeRoom);
  const fileRef = useRef<HTMLInputElement>(null);
  const num = (k: "w" | "l" | "h") => (
    <label className="flex flex-col gap-0.5"><span className="mono text-[10px] muted uppercase">{k === "w" ? "width" : k === "l" ? "length" : "height"}</span>
      <input type="number" step={0.1} min={0.5} value={r[k]} onChange={(e) => updateRoom(r.id, { [k]: parseFloat(e.target.value) || 0 })} className="input !py-1.5 !px-2 w-20 text-sm" /></label>
  );
  return (
    <Glass strong={on} className="p-3 cursor-pointer" onClick={onSelect} style={{ outline: on ? "2px solid var(--accent)" : "none", outlineOffset: -2 }}>
      <div className="flex items-center gap-2 mb-2">
        <select value={r.type} onChange={(e) => updateRoom(r.id, { type: e.target.value as RoomType })} className="input !w-auto !py-1.5 !px-2 text-sm">
          {(Object.keys(ROOM_META) as RoomType[]).map((t) => <option key={t} value={t}>{ROOM_META[t].glyph} {ROOM_META[t].label}</option>)}
        </select>
        <Input value={r.name} onChange={(e) => updateRoom(r.id, { name: e.target.value })} className="!py-1.5 !px-2 text-sm" />
        <button className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); removeRoom(r.id); }} title="Remove"><Trash2 size={13} /></button>
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        {num("w")}{num("l")}{num("h")}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={async (e) => { const out: string[] = []; for (const f of Array.from(e.target.files ?? []).slice(0, 4)) out.push(await fileToDataUrl(f, 640)); updateRoom(r.id, { photos: [...r.photos, ...out].slice(0, 6) }); }} />
        <button className="btn btn-xs ml-auto" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}><Camera size={12} /> {r.photos.length ? `${r.photos.length} photos` : "Add photos"}</button>
      </div>
      {r.photos.length > 0 && <div className="flex gap-1.5 mt-2">{r.photos.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={p} alt="" className="h-12 w-16 object-cover rounded-md" />
      ))}</div>}
    </Glass>
  );
}

export function RoomList({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const rooms = useStudio((s) => s.rooms); const addRoom = useStudio((s) => s.addRoom);
  const total = rooms.reduce((a, r) => a + r.w * r.l, 0);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="muted text-sm">{rooms.length} rooms · {total.toFixed(1)} m²</span>
        <Button size="xs" onClick={() => addRoom({})}><Plus size={12} /> Add room</Button>
      </div>
      {rooms.map((r) => <RoomRow key={r.id} r={r} on={selected === r.id} onSelect={() => onSelect(r.id)} />)}
    </div>
  );
}
