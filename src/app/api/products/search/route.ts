import { NextRequest } from "next/server";
import { moodById, paletteById } from "@/lib/moods";
import { buildSources } from "@/lib/sources";
import { scoreProduct } from "@/lib/optimizer";

/**
 * GET /api/products/search?category=sofa&mood=japandi&palette=linen-oak
 * Direct access to the source fan-out (used by the swipe deck's "more" and
 * by external clients). Returns products ranked by fit.
 */
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams;
  const category = u.get("category") ?? "sofa";
  const mood = moodById(u.get("mood") ?? "japandi");
  const palette = paletteById(u.get("palette") ?? mood.paletteId);
  const sources = buildSources({ facebookToken: u.get("fb") ?? undefined });
  const prefs = { luxury: 1, mid: 1, budget: 1, secondhand: 1, existing: true };
  const results = (await Promise.all(sources.filter((s) => s.status() === "ready").map((s) => s.search({ category, mood, palette, keywords: [] })))).flat();
  const seen = new Set<string>();
  const ranked = results.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).map((p) => ({ ...p, score: scoreProduct(p, { mood, palette, prefs }) })).sort((a, b) => b.score - a.score);
  return Response.json({ category, mood: mood.id, palette: palette.id, sources: sources.map((s) => ({ id: s.id, label: s.label, status: s.status(), requires: s.requires })), results: ranked });
}
