import type { Palette } from "./moods";
import type { Room } from "./rooms";

export type MoodItem = {
  id: string;
  kind: "image" | "pinterest" | "note" | "palette";
  src?: string;
  url?: string;
  text?: string;
  colors?: string[];
  createdAt: number;
};

export type DesignLanguage = {
  name: string;
  moodId: string;
  paletteId: string;
  customPalettes: Palette[];
  moodboard: MoodItem[];
  keywords: string[];
  materials: string[];
};

export type ElementChoice = {
  variant?: string;
  /** index into palette colours, or explicit hex via `hex` */
  colorIndex?: number;
  hex?: string;
  hidden?: boolean;
  pos?: { x: number; y: number };
};
export type RoomDesign = Record<string, ElementChoice>;

export type SourcePrefs = {
  luxury: number;
  mid: number;
  budget: number;
  secondhand: number;
  existing: boolean;
};

export type Budget = {
  total: number;
  currency: "EUR";
  prefs: SourcePrefs;
  city: string;
  radiusKm: number;
  /** room ids the user cares about most */
  priorities: string[];
};

export type ItemStatus = "proposed" | "confirmed" | "removed";

export type PlacedProduct = {
  key: string; // `${roomId}:${slotId}`
  roomId: string;
  slotId: string;
  productId: string | null;
  price: number;
  status: ItemStatus;
  pos?: { x: number; y: number };
};

export type Plan = {
  items: PlacedProduct[];
  /** ranked candidate product ids per key (used by the swipe deck) */
  candidates: Record<string, string[]>;
  generatedAt: number;
  budget: number;
};

export type ConnectorId = "facebook" | "pinterest" | "kleinanzeigen" | "amazon" | "ikea";
export type Connector = { id: ConnectorId; connected: boolean; account?: string; scopes?: string[]; connectedAt?: number };

export type Order = {
  id: string;
  key: string;
  productId: string;
  kind: "order" | "negotiation" | "pickup";
  status: "queued" | "messaging" | "counter" | "agreed" | "ordered" | "failed" | "awaiting-auth";
  listPrice: number;
  targetPrice?: number;
  finalPrice?: number;
  thread: { from: "agent" | "seller" | "system"; text: string; at: number }[];
  authorized: boolean;
};

export type AgentEvent =
  | { type: "log"; level?: "info" | "ok" | "warn"; text: string; at: number }
  | { type: "source"; source: string; found: number }
  | { type: "plan"; plan: Plan }
  | { type: "order"; order: Order }
  | { type: "done" };

export type ApartmentSnapshot = { rooms: Room[] };
