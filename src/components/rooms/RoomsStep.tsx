"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/studio/PageHeader";
import { SketchUpload } from "./SketchUpload";
import { FloorPlan } from "./FloorPlan";
import { RoomList } from "./RoomList";
import { Glass, Eyebrow } from "@/components/glass/Glass";
import { RoomScene } from "@/components/scenes/RoomScene";
import { usePalette, useStudio } from "@/lib/store";

export function RoomsStep() {
  const rooms = useStudio((s) => s.rooms); const palette = usePalette();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = rooms.find((r) => r.id === selected) ?? rooms[0];
  return (
    <div>
      <PageHeader step="Step 2 · Room constructor" title={<>From sketch to <span className="display-italic accent">model.</span></>} blurb="Upload a floor plan or photos and we reconstruct your rooms with dimensions. Drag rooms around the plan, correct numbers, add photos per room for the tour.">
        <Link href="/studio/tour" className={`btn btn-accent btn-sm ${rooms.length ? "" : "pointer-events-none opacity-50"}`}>Next: room tour <ArrowRight size={14} /></Link>
      </PageHeader>
      <div className="space-y-4">
        <SketchUpload />
        {rooms.length > 0 && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-4 min-w-0">
              <Glass className="p-3"><Eyebrow className="mb-2 px-1">Floor plan · drag to arrange</Eyebrow><FloorPlan selected={sel?.id} onSelect={setSelected} /></Glass>
              {sel && <Glass className="p-3"><Eyebrow className="mb-2 px-1">Preview · {sel.name}</Eyebrow><div className="rounded-[calc(var(--radius)*.7)] overflow-hidden"><RoomScene room={sel} palette={palette} /></div></Glass>}
            </div>
            <RoomList selected={sel?.id ?? null} onSelect={setSelected} />
          </div>
        )}
      </div>
    </div>
  );
}
