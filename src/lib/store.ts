"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOODS, type Palette, moodById, paletteById } from "./moods";
import { DEMO_APARTMENT, type Room, uid } from "./rooms";
import type { Budget, Connector, ConnectorId, DesignLanguage, ElementChoice, MoodItem, Order, Plan, PlacedProduct, RoomDesign } from "./types";

export type StudioState = {
  design: DesignLanguage;
  rooms: Room[];
  roomDesigns: Record<string, RoomDesign>;
  tourConfirmed: boolean;
  budget: Budget;
  plan: Plan | null;
  connectors: Record<ConnectorId, Connector>;
  orders: Order[];
  hydrated: boolean;

  setMood: (id: string) => void;
  setPalette: (id: string) => void;
  addCustomPalette: (p: Palette) => void;
  setDesignName: (name: string) => void;
  addMoodItem: (item: Omit<MoodItem, "id" | "createdAt">) => void;
  removeMoodItem: (id: string) => void;
  setKeywords: (k: string[]) => void;
  setMaterials: (m: string[]) => void;

  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Partial<Room>) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  loadDemo: () => void;

  setElement: (roomId: string, slotId: string, patch: ElementChoice) => void;
  resetRoomDesign: (roomId: string) => void;
  setTourConfirmed: (v: boolean) => void;

  setBudget: (patch: Partial<Budget>) => void;
  setPlan: (plan: Plan | null) => void;
  swapProduct: (key: string, productId: string | null, price: number) => void;
  setItemStatus: (key: string, status: PlacedProduct["status"]) => void;
  setItemPos: (key: string, pos: { x: number; y: number }) => void;
  confirmAll: () => void;

  setConnector: (id: ConnectorId, patch: Partial<Connector>) => void;
  setOrders: (orders: Order[]) => void;
  upsertOrder: (order: Order) => void;
  resetAll: () => void;
};

const defaultDesign = (): DesignLanguage => ({
  name: "My apartment",
  moodId: MOODS[0].id,
  paletteId: MOODS[0].paletteId,
  customPalettes: [],
  moodboard: [],
  keywords: [...MOODS[0].keywords],
  materials: [...MOODS[0].materials],
});

const defaultBudget = (): Budget => ({
  total: 6000,
  currency: "EUR",
  prefs: { luxury: 0.25, mid: 0.7, budget: 0.8, secondhand: 0.6, existing: true },
  city: "Berlin",
  radiusKm: 25,
  priorities: [],
});

const defaultConnectors = (): Record<ConnectorId, Connector> => ({
  facebook: { id: "facebook", connected: false },
  pinterest: { id: "pinterest", connected: false },
  kleinanzeigen: { id: "kleinanzeigen", connected: false },
  amazon: { id: "amazon", connected: false },
  ikea: { id: "ikea", connected: false },
});

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      design: defaultDesign(),
      rooms: [],
      roomDesigns: {},
      tourConfirmed: false,
      budget: defaultBudget(),
      plan: null,
      connectors: defaultConnectors(),
      orders: [],
      hydrated: false,

      setMood: (id) => {
        const m = moodById(id);
        set((s) => ({ design: { ...s.design, moodId: id, paletteId: m.paletteId, keywords: [...m.keywords], materials: [...m.materials] } }));
      },
      setPalette: (id) => set((s) => ({ design: { ...s.design, paletteId: id } })),
      addCustomPalette: (p) => set((s) => ({ design: { ...s.design, customPalettes: [p, ...s.design.customPalettes.filter((x) => x.id !== p.id)].slice(0, 12), paletteId: p.id } })),
      setDesignName: (name) => set((s) => ({ design: { ...s.design, name } })),
      addMoodItem: (item) => set((s) => ({ design: { ...s.design, moodboard: [{ ...item, id: uid(), createdAt: Date.now() }, ...s.design.moodboard].slice(0, 40) } })),
      removeMoodItem: (id) => set((s) => ({ design: { ...s.design, moodboard: s.design.moodboard.filter((m) => m.id !== id) } })),
      setKeywords: (keywords) => set((s) => ({ design: { ...s.design, keywords } })),
      setMaterials: (materials) => set((s) => ({ design: { ...s.design, materials } })),

      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((s) => {
        const maxY = s.rooms.reduce((a, r) => Math.max(a, r.y + r.l), 0);
        return { rooms: [...s.rooms, { id: uid(), name: "New room", type: "living", w: 4, l: 3.5, h: 2.7, x: 0, y: maxY, photos: [], ...room }] };
      }),
      updateRoom: (id, patch) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),
      loadDemo: () => set({ rooms: DEMO_APARTMENT.map((r) => ({ ...r })), roomDesigns: {}, plan: null, tourConfirmed: false }),

      setElement: (roomId, slotId, patch) => set((s) => ({
        roomDesigns: { ...s.roomDesigns, [roomId]: { ...(s.roomDesigns[roomId] ?? {}), [slotId]: { ...(s.roomDesigns[roomId]?.[slotId] ?? {}), ...patch } } },
      })),
      resetRoomDesign: (roomId) => set((s) => { const d = { ...s.roomDesigns }; delete d[roomId]; return { roomDesigns: d }; }),
      setTourConfirmed: (tourConfirmed) => set({ tourConfirmed }),

      setBudget: (patch) => set((s) => ({ budget: { ...s.budget, ...patch, prefs: { ...s.budget.prefs, ...(patch.prefs ?? {}) } } })),
      setPlan: (plan) => set({ plan }),
      swapProduct: (key, productId, price) => set((s) => s.plan ? ({
        plan: { ...s.plan, items: s.plan.items.map((i) => (i.key === key ? { ...i, productId, price, status: "proposed" } : i)) },
      }) : {}),
      setItemStatus: (key, status) => set((s) => s.plan ? ({ plan: { ...s.plan, items: s.plan.items.map((i) => (i.key === key ? { ...i, status } : i)) } }) : {}),
      setItemPos: (key, pos) => set((s) => s.plan ? ({ plan: { ...s.plan, items: s.plan.items.map((i) => (i.key === key ? { ...i, pos } : i)) } }) : {}),
      confirmAll: () => set((s) => s.plan ? ({ plan: { ...s.plan, items: s.plan.items.map((i) => (i.status === "removed" || !i.productId ? i : { ...i, status: "confirmed" })) } }) : {}),

      setConnector: (id, patch) => set((s) => ({ connectors: { ...s.connectors, [id]: { ...s.connectors[id], ...patch } } })),
      setOrders: (orders) => set({ orders }),
      upsertOrder: (order) => set((s) => ({ orders: s.orders.some((o) => o.id === order.id) ? s.orders.map((o) => (o.id === order.id ? order : o)) : [...s.orders, order] })),
      resetAll: () => set({ design: defaultDesign(), rooms: [], roomDesigns: {}, tourConfirmed: false, budget: defaultBudget(), plan: null, orders: [], connectors: defaultConnectors() }),
    }),
    {
      name: "atelier-studio-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ design: s.design, rooms: s.rooms, roomDesigns: s.roomDesigns, tourConfirmed: s.tourConfirmed, budget: s.budget, plan: s.plan, connectors: s.connectors, orders: s.orders }),
      onRehydrateStorage: () => (state) => { if (state) state.hydrated = true; },
    },
  ),
);

/* ── selectors ──────────────────────────────────────────────────────── */
export const useMood = () => useStudio((s) => moodById(s.design.moodId));
export const usePalette = () => useStudio((s) => paletteById(s.design.paletteId, s.design.customPalettes));

export function planTotal(plan: Plan | null): number {
  if (!plan) return 0;
  return plan.items.filter((i) => i.status !== "removed" && i.productId).reduce((a, i) => a + i.price, 0);
}

export const stepStatus = (s: Pick<StudioState, "design" | "rooms" | "tourConfirmed" | "plan" | "orders">) => ({
  language: s.design.moodboard.length > 0 || s.design.customPalettes.length > 0,
  rooms: s.rooms.length > 0,
  tour: s.tourConfirmed,
  budget: !!s.plan,
  products: !!s.plan && s.plan.items.some((i) => i.status === "confirmed"),
  checkout: s.orders.length > 0,
});
