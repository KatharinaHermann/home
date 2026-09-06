import { NextRequest } from "next/server";
import { z } from "zod";
import { moodById, paletteById, type Palette } from "@/lib/moods";
import { optimize } from "@/lib/optimizer";
import { buildSources, type SearchQuery } from "@/lib/sources";
import { ndjson, sleep } from "@/lib/ndjson";
import { slotsFor, type Room } from "@/lib/rooms";
import type { AgentEvent, Budget, Connector, DesignLanguage } from "@/lib/types";
import { SOURCE_META, productById } from "@/lib/catalog";

const Body = z.object({
  rooms: z.array(z.custom<Room>()),
  design: z.custom<DesignLanguage>(),
  budget: z.custom<Budget>(),
  connectors: z.record(z.string(), z.custom<Connector>()),
});

/**
 * Budget → product agent. Streams NDJSON `AgentEvent`s:
 *   1. fans out one SearchQuery per slot category to every enabled source
 *   2. merges + dedupes candidates (real sources) with the curated catalogue
 *   3. runs the optimiser and streams the plan
 * A live pace is simulated so the user can watch the reasoning; real source
 * latency replaces `sleep` in production.
 */
export async function POST(req: NextRequest) {
  const { rooms, design, budget, connectors } = Body.parse(await req.json());
  const mood = moodById(design.moodId);
  const palette: Palette = paletteById(design.paletteId, design.customPalettes);
  const fbToken = connectors.facebook?.connected ? "demo-token" : undefined;
  const sources = buildSources({ facebookToken: fbToken, kleinanzeigen: !!connectors.kleinanzeigen?.connected });

  async function* run(): AsyncGenerator<AgentEvent> {
    const log = (text: string, level: "info" | "ok" | "warn" = "info"): AgentEvent => ({ type: "log", level, text, at: Date.now() });
    yield log(`Design language: ${mood.name} · ${palette.name} · ${design.keywords.slice(0, 4).join(", ")}`);
    yield log(`Budget ${budget.currency} ${budget.total.toLocaleString("de-DE")} · ${rooms.length} rooms · pickup radius ${budget.radiusKm} km around ${budget.city}`);
    await sleep(250);
    const categories = Array.from(new Set(rooms.flatMap((r) => slotsFor(r.type).map((s) => s.category))));
    yield log(`${categories.length} product categories to fill: ${categories.slice(0, 6).join(", ")}…`);
    await sleep(300);

    for (const src of sources) {
      const st = src.status();
      if (st !== "ready") { yield log(`${src.label}: skipped (${st === "needs-auth" ? "not authorised" : st === "needs-key" ? `needs ${src.requires[0]}` : st})`, "warn"); continue; }
      let found = 0;
      for (const category of categories) {
        const q: SearchQuery = { category, mood, palette, city: budget.city, radiusKm: budget.radiusKm, keywords: design.keywords };
        found += (await src.search(q)).length;
      }
      yield { type: "source", source: src.label, found };
      yield log(`${src.label}: ${found} candidates`, "ok");
      await sleep(180);
    }

    const prefs = budget.prefs;
    const tiers = Object.entries({ luxury: prefs.luxury, mid: prefs.mid, budget: prefs.budget, secondhand: prefs.secondhand }).filter(([, v]) => v > 0.04).map(([k]) => k);
    yield log(`Scoring on style fit (45%), colour fit vs palette (30%), source preference (25%). Tiers in play: ${tiers.join(", ")}${prefs.existing ? ", existing furniture" : ""}`);
    await sleep(350);
    yield log("Allocating budget by room importance × element weight, then repairing overspend and using headroom for upgrades…");
    await sleep(400);

    const plan = optimize({ rooms, mood, palette, budget });
    const total = plan.items.filter((i) => i.productId).reduce((a, i) => a + i.price, 0);
    const bySource: Record<string, number> = {};
    for (const it of plan.items) { if (!it.productId) continue; const p = productById(it.productId); if (p) bySource[SOURCE_META[p.source].label] = (bySource[SOURCE_META[p.source].label] ?? 0) + 1; }
    yield log(`Plan: ${plan.items.filter((i) => i.productId).length} items · ${budget.currency} ${total.toLocaleString("de-DE")} (${Math.round((total / budget.total) * 100)}% of budget)`, "ok");
    yield log(`Mix: ${Object.entries(bySource).map(([s, n]) => `${s} ×${n}`).join(" · ")}`);
    if (!fbToken) yield log("Tip: connect Facebook Marketplace to unlock second-hand finds near you.", "warn");
    yield { type: "plan", plan };
    yield { type: "done" };
  }
  return ndjson(run());
}
