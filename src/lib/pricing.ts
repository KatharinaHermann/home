import type { Product } from "./catalog";
import type { Room, Slot } from "./rooms";

/** m² a per-m² product covers for a given slot of a room. */
export function slotArea(room: Room, slot: Slot): number {
  const perim = 2 * (room.w + room.l);
  switch (slot.category) {
    case "paint": return perim * room.h * 0.82; // minus doors & windows
    case "flooring": return room.w * room.l;
    case "tiles": return perim * room.h * 0.6;
    case "cabinets": return Math.max(room.w, room.l) * 1.7;
    case "countertop": return Math.max(room.w, room.l) * 0.65;
    case "backsplash": return Math.max(room.w, room.l) * 0.6;
    default: return 1;
  }
}

export function itemPrice(product: Product | undefined | null, room: Room, slot: Slot): number {
  if (!product) return 0;
  if (!product.perSqm) return product.price;
  return Math.round(product.price * slotArea(room, slot));
}

export const fmt = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
