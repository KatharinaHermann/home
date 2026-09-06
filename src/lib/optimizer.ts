/**
 * Budget → product optimiser. Deterministic, runs in <5ms, and is the
 * "inner loop" the product agent calls after it has gathered candidates
 * from every source adapter.
 */
import { byCategory, type Product, type Tier } from "./catalog";
import { colorDistance } from "./color";
import type { Mood, Palette } from "./moods";
import { itemPrice, slotArea } from "./pricing";
import { slotsFor, type Room, type Slot } from "./rooms";
import type { Budget, Plan, PlacedProduct, SourcePrefs } from "./types";

const ROOM_WEIGHT: Record<Room["type"], number> = {
  living: 1, kitchen: 0.9, bedroom: 0.9, dining: 0.8, office: 0.7, bathroom: 0.6, hallway: 0.5,
};

export function tierWeight(tier: Tier, prefs: SourcePrefs): number {
  switch (tier) {
    case "luxury": return prefs.luxury;
    case "mid": return prefs.mid;
    case "budget": return prefs.budget;
    case "secondhand": return prefs.secondhand;
    case "existing": return prefs.existing ? 1 : 0;
  }
}

export function styleFit(p: Product, mood: Mood): number {
  if (p.styleTags.includes("*")) return 0.7;
  const hits = p.styleTags.filter((t) => mood.styleTags.includes(t)).length;
  const primary = p.styleTags[0] === mood.styleTags[0] ? 0.15 : 0;
  return Math.min(1, hits / Math.min(3, mood.styleTags.length) + primary);
}

export function colorFit(p: Product, palette: Palette): number {
  if (!p.colors.length) return 0.75;
  const best = Math.min(...p.colors.map((c) => Math.min(...palette.colors.map((pc) => colorDistance(c, pc)))));
  return Math.max(0, 1 - best / 0.9);
}

export type ScoreCtx = { mood: Mood; palette: Palette; prefs: SourcePrefs };

/** Perceived build/brand quality per tier – used only to spend headroom. */
const QUALITY: Record<Tier, number> = { luxury: 1, mid: 0.7, secondhand: 0.55, budget: 0.4, existing: 0.35 };

export function scoreProduct(p: Product, ctx: ScoreCtx): number {
  const s = styleFit(p, ctx.mood);
  const c = colorFit(p, ctx.palette);
  const src = tierWeight(p.tier, ctx.prefs);
  // second-hand finds are cheap for what they are: value bonus scaled by the user's appetite
  const value = p.tier === "secondhand" ? 0.15 * ctx.prefs.secondhand + (p.meta?.negotiable ? 0.03 : 0) : 0;
  return 0.45 * s + 0.3 * c + 0.25 * src + value;
}

export type Demand = { key: string; room: Room; slot: Slot; weight: number; candidates: Product[] };

export function buildDemands(rooms: Room[], ctx: ScoreCtx, priorities: string[] = []): Demand[] {
  const out: Demand[] = [];
  for (const room of rooms) {
    const rw = ROOM_WEIGHT[room.type] * (priorities.includes(room.id) ? 1.35 : 1);
    for (const slot of slotsFor(room.type)) {
      const cands = byCategory(slot.category)
        .filter((p) => tierWeight(p.tier, ctx.prefs) > 0.04)
        .map((p) => ({ p, s: scoreProduct(p, ctx) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map((x) => x.p);
      if (cands.length) out.push({ key: `${room.id}:${slot.id}`, room, slot, weight: slot.weight * rw, candidates: cands });
    }
  }
  return out;
}

export function optimize(input: { rooms: Room[]; mood: Mood; palette: Palette; budget: Budget }): Plan {
  const ctx: ScoreCtx = { mood: input.mood, palette: input.palette, prefs: input.budget.prefs };
  const demands = buildDemands(input.rooms, ctx, input.budget.priorities);
  const total = input.budget.total;
  const sumW = demands.reduce((a, d) => a + d.weight, 0) || 1;

  const scoreOf = new Map<string, number>();
  const score = (p: Product) => {
    let s = scoreOf.get(p.id);
    if (s === undefined) { s = scoreProduct(p, ctx); scoreOf.set(p.id, s); }
    return s;
  };

  // 1. initial pick: best score near the target share
  const chosen = new Map<string, Product | null>();
  for (const d of demands) {
    const target = (d.weight / sumW) * total;
    let best: Product | null = null, bestV = -Infinity;
    for (const p of d.candidates) {
      const price = itemPrice(p, d.room, d.slot);
      const pen = price > target ? (price - target) / Math.max(target, 1) : 0.25 * ((target - price) / Math.max(target, 1));
      const v = score(p) - 0.35 * Math.min(pen, 3);
      if (v > bestV) { bestV = v; best = p; }
    }
    chosen.set(d.key, best);
  }
  const spend = () => demands.reduce((a, d) => a + itemPrice(chosen.get(d.key), d.room, d.slot), 0);

  // 2. repair: over budget → downgrade cheapest-loss items, then drop decor
  let guard = 0;
  while (spend() > total && guard++ < 400) {
    let bestKey: string | null = null, bestAlt: Product | null = null, bestRatio = Infinity;
    for (const d of demands) {
      const cur = chosen.get(d.key); if (!cur) continue;
      const curPrice = itemPrice(cur, d.room, d.slot);
      for (const alt of d.candidates) {
        const altPrice = itemPrice(alt, d.room, d.slot);
        if (altPrice >= curPrice) continue;
        const loss = Math.max(0.001, score(cur) - score(alt)) * d.weight;
        const ratio = loss / (curPrice - altPrice);
        if (ratio < bestRatio) { bestRatio = ratio; bestKey = d.key; bestAlt = alt; }
      }
    }
    if (bestKey) { chosen.set(bestKey, bestAlt); continue; }
    // nothing cheaper: drop the lowest-weight non-surface item
    const droppable = demands.filter((d) => chosen.get(d.key) && d.slot.kind !== "surface").sort((a, b) => a.weight - b.weight)[0];
    if (!droppable) break;
    chosen.set(droppable.key, null);
  }

  // 3. use headroom: upgrade best gain per euro while under 92 %.
  //    "gain" here also counts tier quality, so a generous budget buys better
  //    pieces even where the user's source preference is lukewarm.
  const upScore = (p: Product) => score(p) + 0.35 * QUALITY[p.tier];
  guard = 0;
  while (spend() < total * 0.92 && guard++ < 300) {
    const room = total - spend();
    let bestKey: string | null = null, bestAlt: Product | null = null, bestGain = 0;
    for (const d of demands) {
      const cur = chosen.get(d.key);
      const curPrice = itemPrice(cur, d.room, d.slot);
      const curScore = cur ? upScore(cur) : 0;
      for (const alt of d.candidates) {
        const altPrice = itemPrice(alt, d.room, d.slot);
        const delta = altPrice - curPrice;
        if (delta <= 0 || delta > room) continue;
        const gain = ((upScore(alt) - curScore) * d.weight) / (delta / Math.max(total, 1) * 10 + 0.02);
        if (upScore(alt) > curScore && gain > bestGain) { bestGain = gain; bestKey = d.key; bestAlt = alt; }
      }
    }
    if (!bestKey) break;
    chosen.set(bestKey, bestAlt);
  }

  const items: PlacedProduct[] = demands.map((d) => {
    const p = chosen.get(d.key) ?? null;
    return { key: d.key, roomId: d.room.id, slotId: d.slot.id, productId: p?.id ?? null, price: itemPrice(p, d.room, d.slot), status: "proposed", pos: d.slot.tag };
  });
  const candidates: Record<string, string[]> = {};
  for (const d of demands) candidates[d.key] = d.candidates.map((p) => p.id);
  return { items, candidates, generatedAt: Date.now(), budget: total };
}

export { slotArea };
