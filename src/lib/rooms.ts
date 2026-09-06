/**
 * Apartment model: rooms, their dimensions, and the "slots" (swappable
 * elements) that each room type exposes to the tour and the product agent.
 */
export type RoomType = "living" | "kitchen" | "bedroom" | "bathroom" | "office" | "dining" | "hallway";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  /** metres */
  w: number;
  l: number;
  h: number;
  /** floor-plan position, metres */
  x: number;
  y: number;
  photos: string[];
  notes?: string;
};

export type SlotKind = "surface" | "furniture" | "lighting" | "decor";

export type Slot = {
  id: string;
  label: string;
  /** product category the slot is filled from */
  category: string;
  kind: SlotKind;
  /** visual variants the scene renderer understands */
  variants: string[];
  /** which palette role colours it by default: index into palette.colors */
  colorIndex: number;
  /** importance 0..1 – drives budget share and which slots are dropped first */
  weight: number;
  /** default tag position in the scene (0..100 %) */
  tag: { x: number; y: number };
};

export const ROOM_META: Record<RoomType, { label: string; glyph: string }> = {
  living: { label: "Living room", glyph: "🛋" },
  kitchen: { label: "Kitchen", glyph: "🍳" },
  bedroom: { label: "Bedroom", glyph: "🛏" },
  bathroom: { label: "Bathroom", glyph: "🛁" },
  office: { label: "Home office", glyph: "💻" },
  dining: { label: "Dining", glyph: "🍽" },
  hallway: { label: "Hallway", glyph: "🚪" },
};

const walls = (tag = { x: 50, y: 18 }): Slot => ({ id: "walls", label: "Wall colour", category: "paint", kind: "surface", variants: ["flat", "halfwall", "limewash"], colorIndex: 0, weight: 0.55, tag });
const floor = (tag = { x: 50, y: 92 }): Slot => ({ id: "floor", label: "Flooring", category: "flooring", kind: "surface", variants: ["planks", "herringbone", "tiles", "concrete"], colorIndex: 2, weight: 0.35, tag });

export const SLOTS: Record<RoomType, Slot[]> = {
  living: [
    walls(), floor(),
    { id: "sofa", label: "Sofa", category: "sofa", kind: "furniture", variants: ["modular", "loveseat", "curved", "chesterfield"], colorIndex: 1, weight: 1, tag: { x: 50, y: 62 } },
    { id: "rug", label: "Rug", category: "rug", kind: "decor", variants: ["plain", "striped", "kilim"], colorIndex: 1, weight: 0.5, tag: { x: 50, y: 84 } },
    { id: "coffeeTable", label: "Coffee table", category: "coffee-table", kind: "furniture", variants: ["round", "rect", "nesting"], colorIndex: 2, weight: 0.6, tag: { x: 50, y: 76 } },
    { id: "floorLamp", label: "Floor lamp", category: "floor-lamp", kind: "lighting", variants: ["arc", "tripod", "paper", "column"], colorIndex: 3, weight: 0.5, tag: { x: 86, y: 40 } },
    { id: "art", label: "Wall art", category: "art", kind: "decor", variants: ["single", "gallery", "oversized"], colorIndex: 3, weight: 0.3, tag: { x: 50, y: 30 } },
    { id: "plant", label: "Plant", category: "plant", kind: "decor", variants: ["tall", "bushy", "hanging"], colorIndex: 4, weight: 0.2, tag: { x: 12, y: 60 } },
    { id: "curtains", label: "Curtains", category: "curtains", kind: "decor", variants: ["linen", "sheer", "velvet"], colorIndex: 1, weight: 0.35, tag: { x: 20, y: 32 } },
    { id: "shelving", label: "Shelving", category: "shelving", kind: "furniture", variants: ["open", "closed", "ladder"], colorIndex: 2, weight: 0.45, tag: { x: 84, y: 55 } },
  ],
  kitchen: [
    walls({ x: 50, y: 12 }), floor(),
    { id: "cabinets", label: "Cabinet fronts", category: "cabinets", kind: "surface", variants: ["flat", "shaker", "fluted"], colorIndex: 1, weight: 1, tag: { x: 30, y: 70 } },
    { id: "counter", label: "Countertop", category: "countertop", kind: "surface", variants: ["stone", "wood", "concrete"], colorIndex: 0, weight: 0.7, tag: { x: 50, y: 56 } },
    { id: "backsplash", label: "Backsplash", category: "backsplash", kind: "surface", variants: ["subway", "zellige", "slab"], colorIndex: 2, weight: 0.4, tag: { x: 60, y: 40 } },
    { id: "stools", label: "Bar stools", category: "bar-stool", kind: "furniture", variants: ["wood", "metal", "upholstered"], colorIndex: 2, weight: 0.5, tag: { x: 80, y: 78 } },
    { id: "pendant", label: "Pendant lights", category: "pendant", kind: "lighting", variants: ["globe", "cone", "linear"], colorIndex: 3, weight: 0.5, tag: { x: 50, y: 22 } },
    { id: "plant", label: "Herbs & plants", category: "plant", kind: "decor", variants: ["bushy", "hanging", "tall"], colorIndex: 4, weight: 0.15, tag: { x: 90, y: 50 } },
  ],
  bedroom: [
    walls(), floor(),
    { id: "bed", label: "Bed", category: "bed", kind: "furniture", variants: ["platform", "upholstered", "canopy", "spindle"], colorIndex: 1, weight: 1, tag: { x: 50, y: 68 } },
    { id: "nightstands", label: "Nightstands", category: "nightstand", kind: "furniture", variants: ["drawer", "pedestal", "floating"], colorIndex: 2, weight: 0.45, tag: { x: 22, y: 66 } },
    { id: "tableLamp", label: "Bedside lamps", category: "table-lamp", kind: "lighting", variants: ["mushroom", "dome", "globe"], colorIndex: 3, weight: 0.35, tag: { x: 22, y: 52 } },
    { id: "rug", label: "Rug", category: "rug", kind: "decor", variants: ["plain", "striped", "kilim"], colorIndex: 1, weight: 0.4, tag: { x: 50, y: 88 } },
    { id: "wardrobe", label: "Wardrobe", category: "wardrobe", kind: "furniture", variants: ["sliding", "hinged", "open"], colorIndex: 0, weight: 0.7, tag: { x: 86, y: 50 } },
    { id: "art", label: "Wall art", category: "art", kind: "decor", variants: ["single", "gallery", "oversized"], colorIndex: 3, weight: 0.25, tag: { x: 50, y: 30 } },
    { id: "curtains", label: "Curtains", category: "curtains", kind: "decor", variants: ["linen", "sheer", "velvet"], colorIndex: 1, weight: 0.35, tag: { x: 12, y: 30 } },
  ],
  bathroom: [
    { id: "walls", label: "Wall tiles", category: "tiles", kind: "surface", variants: ["subway", "zellige", "slab", "flat"], colorIndex: 0, weight: 0.6, tag: { x: 50, y: 16 } },
    floor(),
    { id: "vanity", label: "Vanity", category: "vanity", kind: "furniture", variants: ["floating", "console", "cabinet"], colorIndex: 2, weight: 1, tag: { x: 50, y: 70 } },
    { id: "mirror", label: "Mirror", category: "mirror", kind: "decor", variants: ["round", "arch", "rect"], colorIndex: 3, weight: 0.4, tag: { x: 50, y: 36 } },
    { id: "sconce", label: "Wall lights", category: "sconce", kind: "lighting", variants: ["globe", "tube", "shade"], colorIndex: 3, weight: 0.35, tag: { x: 28, y: 32 } },
    { id: "textiles", label: "Towels & bath mat", category: "towels", kind: "decor", variants: ["plain", "striped"], colorIndex: 1, weight: 0.2, tag: { x: 84, y: 60 } },
    { id: "plant", label: "Plant", category: "plant", kind: "decor", variants: ["hanging", "bushy"], colorIndex: 4, weight: 0.1, tag: { x: 14, y: 60 } },
  ],
  office: [
    walls(), floor(),
    { id: "desk", label: "Desk", category: "desk", kind: "furniture", variants: ["trestle", "sitstand", "writing"], colorIndex: 2, weight: 1, tag: { x: 50, y: 66 } },
    { id: "chair", label: "Desk chair", category: "desk-chair", kind: "furniture", variants: ["task", "wood", "lounge"], colorIndex: 1, weight: 0.8, tag: { x: 50, y: 80 } },
    { id: "shelving", label: "Shelving", category: "shelving", kind: "furniture", variants: ["open", "closed", "ladder"], colorIndex: 2, weight: 0.5, tag: { x: 84, y: 48 } },
    { id: "deskLamp", label: "Desk lamp", category: "table-lamp", kind: "lighting", variants: ["mushroom", "dome", "globe"], colorIndex: 3, weight: 0.35, tag: { x: 66, y: 56 } },
    { id: "rug", label: "Rug", category: "rug", kind: "decor", variants: ["plain", "striped", "kilim"], colorIndex: 1, weight: 0.3, tag: { x: 50, y: 90 } },
    { id: "art", label: "Pinboard / art", category: "art", kind: "decor", variants: ["single", "gallery", "oversized"], colorIndex: 3, weight: 0.2, tag: { x: 30, y: 30 } },
    { id: "plant", label: "Plant", category: "plant", kind: "decor", variants: ["tall", "bushy"], colorIndex: 4, weight: 0.15, tag: { x: 12, y: 62 } },
  ],
  dining: [
    walls(), floor(),
    { id: "table", label: "Dining table", category: "dining-table", kind: "furniture", variants: ["round", "rect", "oval"], colorIndex: 2, weight: 1, tag: { x: 50, y: 70 } },
    { id: "chairs", label: "Dining chairs", category: "dining-chair", kind: "furniture", variants: ["wood", "shell", "upholstered"], colorIndex: 1, weight: 0.8, tag: { x: 28, y: 76 } },
    { id: "pendant", label: "Pendant", category: "pendant", kind: "lighting", variants: ["globe", "cone", "linear"], colorIndex: 3, weight: 0.5, tag: { x: 50, y: 24 } },
    { id: "sideboard", label: "Sideboard", category: "sideboard", kind: "furniture", variants: ["low", "tall", "fluted"], colorIndex: 2, weight: 0.5, tag: { x: 85, y: 62 } },
    { id: "art", label: "Wall art", category: "art", kind: "decor", variants: ["single", "gallery", "oversized"], colorIndex: 3, weight: 0.3, tag: { x: 50, y: 34 } },
    { id: "rug", label: "Rug", category: "rug", kind: "decor", variants: ["plain", "striped", "kilim"], colorIndex: 1, weight: 0.3, tag: { x: 50, y: 90 } },
  ],
  hallway: [
    walls(), floor(),
    { id: "console", label: "Console", category: "console", kind: "furniture", variants: ["slim", "drawer", "bench"], colorIndex: 2, weight: 0.8, tag: { x: 50, y: 66 } },
    { id: "mirror", label: "Mirror", category: "mirror", kind: "decor", variants: ["round", "arch", "rect"], colorIndex: 3, weight: 0.5, tag: { x: 50, y: 36 } },
    { id: "coatRack", label: "Coat rack", category: "coat-rack", kind: "furniture", variants: ["wall", "standing"], colorIndex: 4, weight: 0.4, tag: { x: 84, y: 44 } },
    { id: "runner", label: "Runner", category: "rug", kind: "decor", variants: ["plain", "striped", "kilim"], colorIndex: 1, weight: 0.3, tag: { x: 50, y: 90 } },
    { id: "sconce", label: "Wall light", category: "sconce", kind: "lighting", variants: ["globe", "tube", "shade"], colorIndex: 3, weight: 0.3, tag: { x: 20, y: 30 } },
  ],
};

export const slotsFor = (type: RoomType) => SLOTS[type];
export const area = (r: Room) => r.w * r.l;

export const uid = () => Math.random().toString(36).slice(2, 10);

/** A small Altbau flat used as the one-click demo. */
export const DEMO_APARTMENT: Room[] = [
  { id: "r-living", name: "Living room", type: "living", w: 5.2, l: 4.1, h: 3.2, x: 0, y: 0, photos: [] },
  { id: "r-kitchen", name: "Kitchen", type: "kitchen", w: 3.4, l: 2.8, h: 3.2, x: 5.2, y: 0, photos: [] },
  { id: "r-bed", name: "Bedroom", type: "bedroom", w: 4.0, l: 3.6, h: 3.2, x: 0, y: 4.1, photos: [] },
  { id: "r-bath", name: "Bathroom", type: "bathroom", w: 2.4, l: 2.0, h: 3.2, x: 4.0, y: 4.1, photos: [] },
  { id: "r-hall", name: "Hallway", type: "hallway", w: 2.2, l: 2.0, h: 3.2, x: 6.4, y: 4.1, photos: [] },
  { id: "r-office", name: "Home office", type: "office", w: 3.0, l: 2.6, h: 3.2, x: 5.2, y: 2.8, photos: [] },
];
