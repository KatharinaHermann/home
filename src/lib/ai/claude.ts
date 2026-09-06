/**
 * Claude wrapper. Every call has a deterministic fallback so the app works
 * without an API key (demo mode) and degrades gracefully in production.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { MOODS } from "../moods";
import { DEMO_APARTMENT, type Room, uid } from "../rooms";

export const MODEL = "claude-opus-5";
export const hasClaude = () => !!process.env.ANTHROPIC_API_KEY;
const client = () => new Anthropic();

/* ── Mood-board analysis ──────────────────────────────────────────────── */
export const MoodAnalysis = z.object({
  moodId: z.string(),
  keywords: z.array(z.string()),
  materials: z.array(z.string()),
  palette: z.array(z.string()).length(5),
  summary: z.string(),
});
export type MoodAnalysis = z.infer<typeof MoodAnalysis>;

type ImageInput = { dataUrl: string };

function toImageBlock(img: ImageInput): Anthropic.ImageBlockParam | null {
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(img.dataUrl);
  if (!m) return null;
  return { type: "image", source: { type: "base64", media_type: m[1] as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: m[2] } };
}

export async function analyzeMoodboard(input: { images: ImageInput[]; notes: string[]; urls: string[]; extractedColors: string[] }): Promise<MoodAnalysis & { mode: "claude" | "heuristic" }> {
  if (hasClaude() && (input.images.length || input.notes.length)) {
    const blocks: Anthropic.ContentBlockParam[] = input.images.slice(0, 8).map(toImageBlock).filter((b): b is Anthropic.ImageBlockParam => !!b);
    blocks.push({
      type: "text",
      text: `You are a senior interior designer building a client's core design language.
Available moods: ${MOODS.map((m) => `${m.id} (${m.name}: ${m.tagline})`).join("; ")}.
Notes from the client: ${input.notes.join(" | ") || "none"}.
Pinterest/reference URLs: ${input.urls.join(", ") || "none"}.
Colours extracted from their images: ${input.extractedColors.join(", ") || "none"}.
Choose the best matching moodId, 5-7 keywords, 5 materials, a harmonious 5-colour palette as hex (wall, secondary, wood/warm, accent, deep ink) and a two-sentence summary in the client's voice.`,
    });
    const res = await client().messages.parse({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: zodOutputFormat(MoodAnalysis) },
      messages: [{ role: "user", content: blocks }],
    });
    if (res.parsed_output) return { ...res.parsed_output, mode: "claude" };
  }
  return { ...heuristicMood(input), mode: "heuristic" };
}

function heuristicMood(input: { notes: string[]; extractedColors: string[] }): MoodAnalysis {
  const text = input.notes.join(" ").toLowerCase();
  const scored = MOODS.map((m) => ({ m, s: [...m.keywords, ...m.materials, m.name.toLowerCase(), m.id].filter((k) => text.includes(k.toLowerCase())).length }))
    .sort((a, b) => b.s - a.s);
  const m = scored[0].s > 0 ? scored[0].m : MOODS[0];
  const cols = input.extractedColors.length >= 5 ? input.extractedColors.slice(0, 5) : ["#EFE8DC", "#D9CDBA", "#B5946B", "#8C9A7E", "#3A342C"];
  return {
    moodId: m.id, keywords: m.keywords, materials: m.materials, palette: cols,
    summary: `${m.tagline} A ${m.keywords.slice(0, 3).join(", ")} home built from ${m.materials.slice(0, 3).join(", ")}.`,
  };
}

/* ── Sketch / photo → rooms ───────────────────────────────────────────── */
export const RoomsOut = z.object({
  rooms: z.array(z.object({
    name: z.string(),
    type: z.enum(["living", "kitchen", "bedroom", "bathroom", "office", "dining", "hallway"]),
    w: z.number(), l: z.number(), h: z.number(),
    x: z.number(), y: z.number(),
    notes: z.string(),
  })),
  confidence: z.number(),
});

export async function parseSketch(input: { images: ImageInput[]; hint?: string }): Promise<{ rooms: Room[]; confidence: number; mode: "claude" | "demo" }> {
  if (hasClaude() && input.images.length) {
    const blocks: Anthropic.ContentBlockParam[] = input.images.slice(0, 6).map(toImageBlock).filter((b): b is Anthropic.ImageBlockParam => !!b);
    blocks.push({
      type: "text",
      text: `These are floor-plan sketches and/or photos of an apartment. Reconstruct every room with real-world dimensions in metres (width w along x, length l along y, ceiling height h; default 2.6 if unknown) and a non-overlapping layout position (x, y in metres). Use annotated dimensions when present; otherwise estimate from doors (≈0.9 m) and standard fixtures. ${input.hint ? `Hint from the user: ${input.hint}` : ""} Report an overall confidence 0-1.`,
    });
    const res = await client().messages.parse({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: zodOutputFormat(RoomsOut) },
      messages: [{ role: "user", content: blocks }],
    });
    if (res.parsed_output) {
      return { rooms: res.parsed_output.rooms.map((r) => ({ ...r, id: uid(), photos: [] })), confidence: res.parsed_output.confidence, mode: "claude" };
    }
  }
  return { rooms: DEMO_APARTMENT.map((r) => ({ ...r, id: uid() })), confidence: 0.35, mode: "demo" };
}

/* ── Negotiation copy ─────────────────────────────────────────────────── */
export async function draftNegotiation(input: { item: string; listPrice: number; targetPrice: number; seller?: string; tone: "friendly" | "direct" }): Promise<string> {
  if (hasClaude()) {
    const res = await client().messages.create({
      model: MODEL,
      max_tokens: 400,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: `Write a ${input.tone}, 2-3 sentence Facebook Marketplace message to ${input.seller ?? "the seller"} about "${input.item}" listed at €${input.listPrice}. Offer €${input.targetPrice}, mention pickup within 48h and paying cash. No emojis, no subject line.` }],
    });
    const txt = res.content.find((b) => b.type === "text");
    if (txt && txt.type === "text") return txt.text.trim();
  }
  return `Hi${input.seller ? ` ${input.seller.split(" ")[0]}` : ""}! I'm interested in the ${input.item}. Would you take €${input.targetPrice}? I can pick it up within 48 hours and pay cash on collection.`;
}
