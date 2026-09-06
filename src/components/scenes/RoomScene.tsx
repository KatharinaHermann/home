"use client";
import { useMemo } from "react";
import { productById } from "@/lib/catalog";
import type { Palette } from "@/lib/moods";
import { slotsFor, type Room } from "@/lib/rooms";
import type { PlacedProduct, RoomDesign } from "@/lib/types";
import type { Els } from "./primitives";
import { BathroomScene, BedroomScene, DiningScene, HallwayScene, KitchenScene, LivingScene, OfficeScene } from "./rooms";

/**
 * Resolves what each slot should look like: explicit user override →
 * chosen product → palette default. Products bring their own variant and
 * (if they have one) their dominant colour.
 */
export function resolveElements(room: Room, palette: Palette, design: RoomDesign = {}, items: PlacedProduct[] = []): Els {
  const els: Els = {};
  for (const slot of slotsFor(room.type)) {
    const d = design[slot.id] ?? {};
    const item = items.find((i) => i.roomId === room.id && i.slotId === slot.id);
    const product = item?.productId ? productById(item.productId) : undefined;
    const hidden = d.hidden ?? (item ? item.status === "removed" || !item.productId : false);
    const variant = d.variant ?? product?.variant ?? slot.variants[0];
    const color = d.hex ?? (d.colorIndex !== undefined ? palette.colors[d.colorIndex] : undefined) ?? (product?.colors?.[0] && slot.kind !== "surface" ? product.colors[0] : undefined) ?? palette.colors[slot.colorIndex];
    els[slot.id] = { variant: slot.variants.includes(variant) ? variant : slot.variants[0], color, hidden: hidden && slot.kind !== "surface" };
  }
  return els;
}

export function RoomScene({ room, palette, design, items, selected, onSelect }: { room: Room; palette: Palette; design?: RoomDesign; items?: PlacedProduct[]; selected?: string | null; onSelect?: (id: string) => void }) {
  const els = useMemo(() => resolveElements(room, palette, design, items), [room, palette, design, items]);
  const props = { els, selected, onSelect };
  switch (room.type) {
    case "kitchen": return <KitchenScene {...props} />;
    case "bedroom": return <BedroomScene {...props} />;
    case "bathroom": return <BathroomScene {...props} />;
    case "office": return <OfficeScene {...props} />;
    case "dining": return <DiningScene {...props} />;
    case "hallway": return <HallwayScene {...props} />;
    default: return <LivingScene {...props} />;
  }
}
